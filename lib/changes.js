// selector-observer processes dom mutations in two phases. This module
// processes DOM mutations, revalidates selectors against the target element and
// enqueues a Change for an observers hooks to be ran.

import {addMap} from './apply'
import {detectInnerHTMLReplacementBuggy, supportsSelectorMatching} from './support'

// A set of Changes is structured as an Array of tuples:
//
// [ADD, element, observer]: Indicates that an observer starting matching
// the element.
export const ADD = 1

// [REMOVE, element, observer]: Indicates that an observer stopped matching
// the element.
export const REMOVE = 2

// [REMOVE_ALL, element]: Indicates that an element was removed from the
// document and all related observers stopped matching the element.
export const REMOVE_ALL = 3

// A handler for processing MutationObserver mutations.
//
// selectorObserver - The SelectorObserver
// changes - Array of changes to append to
// mutations - An array of MutationEvents
//
// Return nothing.
export function handleMutations(selectorObserver, changes, mutations) {
  for (let i = 0; i < mutations.length; i++) {
    const mutation = mutations[i]
    if (mutation.type === 'childList') {
      addNodes(selectorObserver, changes, mutation.addedNodes)
      removeNodes(selectorObserver, changes, mutation.removedNodes)
    } else if (mutation.type === 'attributes') {
      revalidateObservers(selectorObserver, changes, mutation.target)
    }
  }
  if (detectInnerHTMLReplacementBuggy(selectorObserver.ownerDocument)) {
    revalidateOrphanedElements(selectorObserver, changes)
  }
}

// Run observer node "add" callback once on the any matching
// node and its subtree.
//
// selectorObserver - The SelectorObserver
// changes - Array of changes to append to
// nodes   - A NodeList of Nodes
//
// Returns nothing.
export function addNodes(selectorObserver, changes, nodes) {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]

    if (supportsSelectorMatching(node)) {
      const matches = selectorObserver.selectorSet.matches(node)
      for (let j = 0; j < matches.length; j++) {
        const {data} = matches[j]
        changes.push([ADD, node, data])
      }
    }

    if ('querySelectorAll' in node) {
      const matches2 = selectorObserver.selectorSet.queryAll(node)
      for (let j = 0; j < matches2.length; j++) {
        const {data, elements} = matches2[j]
        for (let k = 0; k < elements.length; k++) {
          changes.push([ADD, elements[k], data])
        }
      }
    }
  }
}

// Run all observer node "remove" callbacks on the node
// and its entire subtree.
//
// selectorObserver - The SelectorObserver
// changes - Array of changes to append to
// nodes   - A NodeList of Nodes
//
// Returns nothing.
export function removeNodes(selectorObserver, changes, nodes) {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if ('querySelectorAll' in node) {
      changes.push([REMOVE_ALL, node])
      const descendants = node.querySelectorAll('*')
      for (let j = 0; j < descendants.length; j++) {
        changes.push([REMOVE_ALL, descendants[j]])
      }
    }
  }
}

// Recheck all "add" observers to see if the selector still matches.
// If not, run the "remove" callback.
//
// selectorObserver - The SelectorObserver
// changes - Array of changes to append to
// node    - A Node
//
// Returns nothing.
export function revalidateObservers(selectorObserver, changes, node) {
  if (supportsSelectorMatching(node)) {
    const matches = selectorObserver.selectorSet.matches(node)
    for (let i = 0; i < matches.length; i++) {
      const {data} = matches[i]
      changes.push([ADD, node, data])
    }
  }

  if ('querySelectorAll' in node) {
    const ids = addMap.get(node)
    if (ids) {
      for (let i = 0; i < ids.length; i++) {
        const observer = selectorObserver.observers[ids[i]]
        if (observer) {
          if (!selectorObserver.selectorSet.matchesSelector(node, observer.selector)) {
            changes.push([REMOVE, node, observer])
          }
        }
      }
    }
  }
}

// Recheck all "add" observers to see if the selector still matches.
// If not, run the "remove" callback. Runs on node and all its descendants.
//
// selectorObserver - The SelectorObserver
// changes - Array of changes to append to
// node    - The root Node
//
// Returns nothing.
export function revalidateDescendantObservers(selectorObserver, changes, node) {
  if ('querySelectorAll' in node) {
    revalidateObservers(selectorObserver, changes, node)
    const descendants = node.querySelectorAll('*')
    for (let i = 0; i < descendants.length; i++) {
      revalidateObservers(selectorObserver, changes, descendants[i])
    }
  }
}

// Recheck input after "change" event and possible related form elements.
//
// selectorObserver - The SelectorObserver
// changes - Array of changes to append to
// input   - The HTMLInputElement
//
// Returns nothing.
export function revalidateInputObservers(selectorObserver, changes, inputs) {
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i]
    const els = input.form ? input.form.elements : selectorObserver.rootNode.querySelectorAll('input')
    for (let j = 0; j < els.length; j++) {
      revalidateObservers(selectorObserver, changes, els[j])
    }
  }
}

// Check all observed elements to see if they are still in the DOM.
// Only intended to run on IE where innerHTML replacement is buggy.
//
// selectorObserver - The SelectorObserver
// changes - Array of changes to append to
//
// Returns nothing.
export function revalidateOrphanedElements(selectorObserver, changes) {
  for (let i = 0; i < selectorObserver.observers.length; i++) {
    const observer = selectorObserver.observers[i]
    if (observer) {
      const {elements} = observer
      for (let j = 0; j < elements.length; j++) {
        const el = elements[j]
        if (!el.parentNode) {
          changes.push([REMOVE_ALL, el])
        }
      }
    }
  }
}
