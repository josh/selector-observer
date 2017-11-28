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

// Known issues
//
// In IE 9/10/11 replacing child via innerHTML will orphan all of the child
// elements. This prevents walking the descendants of removedNodes.
// https://connect.microsoft.com/IE/feedback/details/797844/ie9-10-11-dom-child-kill-bug
const innerHTMLReplacementIsBuggy = (function() {
  const a = document.createElement('div')
  const b = document.createElement('div')
  const c = document.createElement('div')
  a.appendChild(b)
  b.appendChild(c)
  a.innerHTML = ''
  return c.parentNode !== b
})()

const scheduleMacroTask = (function() {
  const el = document.createElement('div')
  let queue = []

  function handleMutations() {
    const callbacks = queue
    queue = []
    for (const callback of callbacks) {
      callback()
    }
  }

  const observer = new MutationObserver(handleMutations)
  observer.observe(el, {attributes: true})

  return function(callback) {
    queue.push(callback)
    el.setAttribute('data-foo', `${Date.now()}`)
  }
})()

// Observer uid counter
let uid = 0

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
    for (const id of addIds.slice(0)) {
      observer = documentObservers[id]
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
  for (const el of nodes) {
    if (!(el instanceof Element)) {
      continue
    }

    for (const {data} of selectorSet.matches(el)) {
      changes.push(['add', el, data])
    }

    for (const {data, elements} of selectorSet.queryAll(el)) {
      for (const descendant of elements) {
        changes.push(['add', descendant, data])
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
  for (const el of nodes) {
    if (!(el instanceof Element)) {
      continue
    }

    changes.push(['remove', el, null])
    for (const descendant of el.getElementsByTagName('*')) {
      changes.push(['remove', descendant, null])
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
  for (const observer of documentObservers) {
    if (observer) {
      for (const el of observer.elements) {
        if (!el.parentNode) {
          changes.push(['remove', el, null])
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

  for (const {data} of selectorSet.matches(node)) {
    changes.push(['add', node, data])
  }

  const ids = addMap.get(node)
  if (ids) {
    for (const id of ids) {
      const observer = documentObservers[id]
      if (observer) {
        if (!selectorSet.matchesSelector(node, observer.selector)) {
          changes.push(['remove', node, observer])
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
  for (const descendant of node.getElementsByTagName('*')) {
    revalidateObservers(changes, descendant)
  }
}

function applyChanges(changes) {
  for (const change of changes) {
    const type = change[0]
    const el = change[1]
    const observer = change[2]
    if (type === 'add' && observer && el instanceof observer.klass) {
      runInit(el, observer)
      runAdd(el, observer)
    } else if (type === 'remove') {
      runRemove(el, observer)
    }
  }
}

// Removes observer and calls any remaining remove hooks.
//
// observer - Observer object
//
// Returns nothing.
function stopObserving(observer) {
  for (const el of observer.elements) {
    runRemove(el, observer)
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
export function observe(selector, handlersInit, klassOptional) {
  const klass = klassOptional ? klassOptional : Element
  const handlers = typeof handlersInit === 'function' ? {initialize: handlersInit} : handlersInit
  const observer = {
    id: uid++,
    selector,
    initialize: handlers.initialize,
    add: handlers.add,
    remove: handlers.remove,
    elements: [],
    klass,
    stop() {
      stopObserving(observer)
    }
  }
  selectorSet.add(selector, observer)
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
  scheduleMacroTask(addDocumentNodes)
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
  for (const target of targets) {
    let els
    if (target.form) {
      els = target.form.elements
    } else {
      els = target.ownerDocument.getElementsByTagName('input')
    }
    for (const el of els) {
      revalidateObservers(changes, el)
    }
  }
  applyChanges(changes)
}

function handleChangeEvent(event) {
  changedTargets.push(event.target)
  scheduleMacroTask(handleAsyncChangeEvents)
}
document.addEventListener('change', handleChangeEvent, false)

function handleDocumentMutations(mutations) {
  const changes = []
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      addNodes(changes, mutation.addedNodes)
      removeNodes(changes, mutation.removedNodes)
    } else if (mutation.type === 'attributes') {
      revalidateObservers(changes, mutation.target)
    }
  }
  if (innerHTMLReplacementIsBuggy) {
    revalidateOrphanedElements(changes)
  }
  applyChanges(changes)
}

const documentObserver = new MutationObserver(handleDocumentMutations)

function whenReady(callback) {
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    callback()
  } else {
    document.addEventListener('DOMContentLoaded', callback)
  }
}

whenReady(() => {
  scheduleMacroTask(() => {
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
