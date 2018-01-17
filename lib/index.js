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

import SelectorObserver from './selector-observer'

let documentObserver

export function getDocumentObserver() {
  if (!documentObserver) {
    documentObserver = new SelectorObserver(window.document)
  }
  return documentObserver
}

export function observe(...args) {
  return getDocumentObserver().observe(...args)
}

export function triggerObservers(...args) {
  return getDocumentObserver().triggerObservers(...args)
}

export default SelectorObserver
