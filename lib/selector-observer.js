import SelectorSet from 'selector-set'
import {scheduleBatch} from './tasks'
import {addNodes, handleMutations, revalidateDescendantObservers, revalidateInputObservers} from './changes'
import {applyChanges, runRemove} from './apply'
import {whenReady} from './ready'

// Observer uid counter
let uid = 0

export default function SelectorObserver(rootNode) {
  this.rootNode = rootNode.nodeType === 9 ? rootNode.documentElement : rootNode
  this.ownerDocument = rootNode.nodeType === 9 ? rootNode : rootNode.ownerDocument

  // Map of observer id to object
  this.observers = []

  // Index of selectors to observer objects
  this.selectorSet = new SelectorSet()

  // Process all mutations from root element
  this.mutationObserver = new MutationObserver(handleRootMutations.bind(this, this))

  this._scheduleAddRootNodes = scheduleBatch(this.ownerDocument, addRootNodes.bind(this, this))

  this._handleThrottledChangedTargets = scheduleBatch(this.ownerDocument, handleChangedTargets.bind(this, this))
  this.rootNode.addEventListener('change', handleChangeEvents.bind(this, this), false)

  whenReady(this.ownerDocument, onReady.bind(this, this))
}

SelectorObserver.prototype.disconnect = function() {
  this.mutationObserver.disconnect()
}

// Register a new observer.
//
// selector - String CSS selector.
// handlers - Initialize Function or Object with keys:
//   initialize - Function to invoke once when Node is first matched
//   add        - Function to invoke when Node matches selector
//   remove     - Function to invoke when Node no longer matches selector
//
// Returns Observer object.
SelectorObserver.prototype.observe = function(a, b) {
  let handlers

  if (typeof b === 'function') {
    handlers = {
      selector: a,
      initialize: b
    }
  } else if (typeof b === 'object') {
    handlers = b
    handlers.selector = a
  } else {
    handlers = a
  }

  const self = this

  const observer = {
    id: uid++,
    selector: handlers.selector,
    initialize: handlers.initialize,
    add: handlers.add,
    remove: handlers.remove,
    elements: [],
    elementConstructor: handlers.hasOwnProperty('constructor') ? handlers.constructor : Element,
    abort() {
      self._abortObserving(observer)
    }
  }
  this.selectorSet.add(observer.selector, observer)
  this.observers[observer.id] = observer
  this._scheduleAddRootNodes()

  return observer
}

// Removes observer and calls any remaining remove hooks.
//
// observer - Observer object
//
// Returns nothing.
SelectorObserver.prototype._abortObserving = function(observer) {
  const elements = observer.elements
  for (let i = 0; i < elements.length; i++) {
    runRemove(observer, elements[i])
  }
  this.selectorSet.remove(observer.selector, observer)
  delete this.observers[observer.id]
}

// Internal: For hacking in dirty changes that aren't getting picked up
SelectorObserver.prototype.triggerObservers = function(container) {
  const changes = []
  revalidateDescendantObservers(this, changes, container)
  applyChanges(this, changes)
}

function onReady(selectorObserver) {
  selectorObserver.mutationObserver.observe(selectorObserver.rootNode, {
    childList: true,
    attributes: true,
    subtree: true
  })
  selectorObserver._scheduleAddRootNodes()
}

function addRootNodes(selectorObserver) {
  const changes = []
  addNodes(selectorObserver, changes, [selectorObserver.rootNode])
  applyChanges(selectorObserver, changes)
}

function handleRootMutations(selectorObserver, mutations) {
  const changes = []
  handleMutations(selectorObserver, changes, mutations)
  applyChanges(selectorObserver, changes)
}

function handleChangeEvents(selectorObserver, event) {
  selectorObserver._handleThrottledChangedTargets(event.target)
}

function handleChangedTargets(selectorObserver, inputs) {
  const changes = []
  revalidateInputObservers(selectorObserver, changes, inputs)
  applyChanges(selectorObserver, changes)
}
