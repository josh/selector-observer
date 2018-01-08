// observe
//
// Observe provides a declarative hook thats informed when an element becomes
// matched by a selector, and then when it stops matching the selector.
//
// Examples
//
//   observe('.js-foo', (el) => {
//     console.log(el, 'was added to the DOM')
//   })
//
//   observe('.js-bar', {
//     add(el) { console.log('js-bar was added to', el) },
//     remove(el) { console.log 'js-bar was removed from', el) }
//   })
//

import SelectorSet from 'selector-set'
import {detectInnerHTMLReplacementBuggy} from './support'
import {scheduleMacroTask} from './tasks'
import {whenReady} from './ready'

// Observer uid counter
let uid = 0

// Internal symbol constants
const ADD = 1
const REMOVE = 2

// Map of observer id to object
const documentObservers = []

// Index of selectors to observer objects
const selectorSet = new SelectorSet()
const initMap = new WeakMap()
const addMap = new WeakMap()
const initializerMap = new WeakMap()

// Run observer node "initialize" callback once.
// Call when observer selector matches node.
//
// el       - An Element
// observer - An observer Object.
//
// Returns nothing.
function runInit(el, observer) {
  let initIds = initMap.get(el)
  if (!initIds) {
    initIds = []
    initMap.set(el, initIds)
  }

  if (initIds.indexOf(observer.id) === -1) {
    let initializer
    if (observer.initialize) {
      initializer = observer.initialize.call(undefined, el)
    }
    if (initializer) {
      let initializers = initializerMap.get(el)
      if (!initializers) {
        initializers = {}
        initializerMap.set(el, initializers)
      }
      initializers[`${observer.id}`] = initializer
    }
    initIds.push(observer.id)
  }
}

// Run observer node "add" callback.
// Call when observer selector matches node.
//
// el       - An Element
// observer - An observer Object.
//
// Returns nothing.
function runAdd(el, observer) {
  let addIds = addMap.get(el)
  if (!addIds) {
    addIds = []
    addMap.set(el, addIds)
  }
  if (addIds.indexOf(observer.id) === -1) {
    observer.elements.push(el)
    const initializers = initializerMap.get(el)
    const initializer = initializers ? initializers[`${observer.id}`] : null
    if (initializer) {
      if (initializer.add) {
        initializer.add.call(undefined, el)
      }
    }
    if (observer.add) {
      observer.add.call(undefined, el)
    }
    addIds.push(observer.id)
  }
}

// Runs all observer element "remove" callbacks.
// Call when element is completely removed from the DOM.
//
// el       - An Element
// observer - Optional observer to check
//
// Returns nothing.
function runRemove(el, observer) {
  const addIds = addMap.get(el)
  if (!addIds) {
    return
  }

  if (observer && el instanceof observer.klass) {
    let index = observer.elements.indexOf(el)
    if (index !== -1) {
      observer.elements.splice(index, 1)
    }
    index = addIds.indexOf(observer.id)
    if (index !== -1) {
      const initializers = initializerMap.get(el)
      const initializer = initializers ? initializers[`${observer.id}`] : null
      if (initializer) {
        if (initializer.remove) {
          initializer.remove.call(undefined, el)
        }
      }
      if (observer.remove) {
        observer.remove.call(undefined, el)
      }
      addIds.splice(index, 1)
    }
    if (addIds.length === 0) {
      addMap.delete(el)
    }
  } else {
    const ids = addIds.slice(0)
    for (let i = 0; i < ids.length; i++) {
      observer = documentObservers[ids[i]]
      if (!observer) {
        continue
      }
      const index = observer.elements.indexOf(el)
      if (index !== -1) {
        observer.elements.splice(index, 1)
      }
      const initializers = initializerMap.get(el)
      const initializer = initializers ? initializers[`${observer.id}`] : null
      if (initializer) {
        if (initializer.remove) {
          initializer.remove.call(undefined, el)
        }
      }
      if (observer.remove) {
        observer.remove.call(undefined, el)
      }
    }
    addMap.delete(el)
  }
}

// Run observer node "add" callback once on the any matching
// node and its subtree.
//
// changes - Array of changes to append to
// nodes   - A NodeList of Nodes
//
// Returns Array of changes
function addNodes(changes, nodes) {
  for (let i = 0; i < nodes.length; i++) {
    const el = nodes[i]
    if (!(el instanceof Element)) {
      continue
    }

    const matches = selectorSet.matches(el)
    for (let j = 0; j < matches.length; j++) {
      const {data} = matches[j]
      changes.push([ADD, el, data])
    }

    const matches2 = selectorSet.queryAll(el)
    for (let j = 0; j < matches2.length; j++) {
      const {data, elements} = matches2[j]
      for (let k = 0; k < elements.length; k++) {
        changes.push([ADD, elements[k], data])
      }
    }
  }
}

// Run all observer node "remove" callbacks on the node
// and its entire subtree.
//
// changes - Array of changes to append to
// nodes   - A NodeList of Nodes
//
// Returns Array of changes
function removeNodes(changes, nodes) {
  for (let i = 0; i < nodes.length; i++) {
    const el = nodes[i]
    if (!(el instanceof Element)) {
      continue
    }

    changes.push([REMOVE, el, null])
    const descendants = el.getElementsByTagName('*')
    for (let j = 0; j < descendants.length; j++) {
      changes.push([REMOVE, descendants[j], null])
    }
  }
}

// Check all observed elements to see if they are still in the DOM.
// Only intended to run on IE where innerHTML replacement is buggy.
//
// changes - Array of changes to append to
//
// Returns nothing.
function revalidateOrphanedElements(changes) {
  for (let i = 0; i < documentObservers.length; i++) {
    const observer = documentObservers[i]
    if (observer) {
      const {elements} = observer
      for (let j = 0; j < elements.length; j++) {
        const el = elements[j]
        if (!el.parentNode) {
          changes.push([REMOVE, el, null])
        }
      }
    }
  }
}

// Recheck all "add" observers to see if the selector still matches.
// If not, run the "remove" callback.
//
// changes - Array of changes to append to
// node    - A Node
//
// Returns nothing.
function revalidateObservers(changes, node) {
  if (!(node instanceof Element)) {
    return
  }

  const matches = selectorSet.matches(node)
  for (let i = 0; i < matches.length; i++) {
    const {data} = matches[i]
    changes.push([ADD, node, data])
  }

  const ids = addMap.get(node)
  if (ids) {
    for (let i = 0; i < ids.length; i++) {
      const observer = documentObservers[ids[i]]
      if (observer) {
        if (!selectorSet.matchesSelector(node, observer.selector)) {
          changes.push([REMOVE, node, observer])
        }
      }
    }
  }
}

// Recheck all "add" observers to see if the selector still matches.
// If not, run the "remove" callback. Runs on node and all its descendants.
//
// changes - Array of changes to append to
// node    - The root Node
//
// Returns nothing.
function revalidateDescendantObservers(changes, node) {
  if (!(node instanceof Element)) {
    return
  }

  revalidateObservers(changes, node)
  const descendants = node.getElementsByTagName('*')
  for (let i = 0; i < descendants.length; i++) {
    revalidateObservers(changes, descendants[i])
  }
}

function applyChanges(changes) {
  for (let i = 0; i < changes.length; i++) {
    const change = changes[i]
    const type = change[0]
    const el = change[1]
    const observer = change[2]
    if (type === ADD && observer && el instanceof observer.klass) {
      runInit(el, observer)
      runAdd(el, observer)
    } else if (type === REMOVE) {
      runRemove(el, observer)
    }
  }
}

// Removes observer and calls any remaining remove hooks.
//
// observer - Observer object
//
// Returns nothing.
function abortObserving(observer) {
  const elements = observer.elements
  for (let i = 0; i < elements.length; i++) {
    runRemove(elements[i], observer)
  }
  selectorSet.remove(observer.selector, observer)
  delete documentObservers[observer.id]
  observerCount--
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
export function observe(a, b) {
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

  const observer = {
    id: uid++,
    selector: handlers.selector,
    initialize: handlers.initialize,
    add: handlers.add,
    remove: handlers.remove,
    elements: [],
    klass: handlers.constructor || Element,
    abort() {
      abortObserving(observer)
    }
  }
  selectorSet.add(observer.selector, observer)
  documentObservers[observer.id] = observer
  scheduleAddDocumentNodes()
  observerCount++
  return observer
}

let addDocumentNodesScheduled = false
function scheduleAddDocumentNodes() {
  if (addDocumentNodesScheduled) {
    return
  }
  scheduleMacroTask(document, addDocumentNodes)
  addDocumentNodesScheduled = true
}

function addDocumentNodes() {
  const changes = []
  const nodes = [document.documentElement]
  addNodes(changes, nodes)
  applyChanges(changes)
  addDocumentNodesScheduled = false
}

// Internal: Track number of observers for debugging.
let observerCount = 0

export function getObserverCount() {
  return observerCount
}

// Internal: For hacking in dirty changes that aren't getting picked up
export function triggerObservers(container) {
  const changes = []
  revalidateDescendantObservers(changes, container)
  applyChanges(changes)
}

let changedTargets = []

function handleAsyncChangeEvents() {
  const changes = []
  const targets = changedTargets
  changedTargets = []
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i]
    const els = target.form ? target.form.elements : target.ownerDocument.getElementsByTagName('input')
    for (let j = 0; j < els.length; j++) {
      revalidateObservers(changes, els[j])
    }
  }
  applyChanges(changes)
}

function handleChangeEvent(event) {
  changedTargets.push(event.target)
  scheduleMacroTask(document, handleAsyncChangeEvents)
}
document.addEventListener('change', handleChangeEvent, false)

function handleDocumentMutations(mutations) {
  const changes = []
  for (let i = 0; i < mutations.length; i++) {
    const mutation = mutations[i]
    if (mutation.type === 'childList') {
      addNodes(changes, mutation.addedNodes)
      removeNodes(changes, mutation.removedNodes)
    } else if (mutation.type === 'attributes') {
      revalidateObservers(changes, mutation.target)
    }
  }
  if (detectInnerHTMLReplacementBuggy(document)) {
    revalidateOrphanedElements(changes)
  }
  applyChanges(changes)
}

const documentObserver = new MutationObserver(handleDocumentMutations)

whenReady(document, () => {
  scheduleMacroTask(document, () => {
    documentObserver.observe(document, {
      childList: true,
      attributes: true,
      subtree: true
    })
    const changes = []
    const nodes = [document.documentElement]
    addNodes(changes, nodes)
    applyChanges(changes)
  })
})
