// selector-observer processes dom mutations in two phases. This module applies
// the Change set from the first phase and invokes the any registered hooks.

import {ADD, REMOVE, REMOVE_ALL} from './changes'

const initMap = new WeakMap()
const initializerMap = new WeakMap()
export const addMap = new WeakMap()

export function applyChanges(selectorObserver, changes) {
  for (let i = 0; i < changes.length; i++) {
    const change = changes[i]
    const type = change[0]
    const el = change[1]
    const observer = change[2]
    if (type === ADD) {
      runInit(observer, el)
      runAdd(observer, el)
    } else if (type === REMOVE) {
      runRemove(observer, el)
    } else if (type === REMOVE_ALL) {
      runRemoveAll(selectorObserver.observers, el)
    }
  }
}

// Run observer node "initialize" callback once.
// Call when observer selector matches node.
//
// observer - An observer Object.
// el       - An Element
//
// Returns nothing.
function runInit(observer, el) {
  if (!(el instanceof observer.klass)) {
    return
  }

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
// observer - An observer Object.
// el       - An Element
//
// Returns nothing.
function runAdd(observer, el) {
  if (!(el instanceof observer.klass)) {
    return
  }

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
// observer - An observer Object.
// el       - An Element
//
// Returns nothing.
export function runRemove(observer, el) {
  if (!(el instanceof observer.klass)) {
    return
  }

  const addIds = addMap.get(el)
  if (!addIds) {
    return
  }

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
}

// Runs all observer element "remove" callbacks.
// Call when element is completely removed from the DOM.
//
// observes - Array of observers
// el - An Element
//
// Returns nothing.
function runRemoveAll(observers, el) {
  const addIds = addMap.get(el)
  if (!addIds) {
    return
  }

  const ids = addIds.slice(0)
  for (let i = 0; i < ids.length; i++) {
    const observer = observers[ids[i]]
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
