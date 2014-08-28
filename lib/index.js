var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver
function matches(el, selector) {
  var fn = el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector
  return fn ? fn.call(el, selector) : false
}
function toArr(nodeList) {
  return Array.prototype.slice.call(nodeList)
}

// polyfill for IE < 11
var isOldIE = false
if (typeof MutationObserver === 'undefined') {
  MutationObserver = function(callback) {
    this.targets = []
    this.onAdded = function(e) {
      callback([{ addedNodes: [e.target], removedNodes: [] }])
    }
    this.onRemoved = function(e) {
      callback([{ addedNodes: [], removedNodes: [e.target] }])
    }
  }

  MutationObserver.prototype.observe = function(target) {
    target.addEventListener('DOMNodeInserted', this.onAdded)
    target.addEventListener('DOMNodeRemoved', this.onRemoved)
    this.targets.push(target)
  }

  MutationObserver.prototype.disconnect = function() {
    var target
    while (target = this.targets.shift()) {
      target.removeEventListener('DOMNodeInserted', this.onAdded)
      target.removeEventListener('DOMNodeRemoved', this.onRemoved)
    }
  }

  isOldIE = !!~navigator.appName.indexOf('Internet Explorer')
}

var SelectorObserver = function(targets, selector, onAdded, onRemoved) {
  var self     = this
  this.targets = targets instanceof NodeList
                   ? Array.prototype.slice.call(targets)
                   : [targets]

  // support selectors starting with the childs only selector `>`
  var childsOnly = selector[0] === '>'
    , search = childsOnly ? selector.substr(1) : selector
    , initialized = false

  function apply(nodes, callback) {
    toArr(nodes).forEach(function(node) {
      //ignore non-element nodes
      if (node.nodeType !== 1) return;

      // if looking for childs only, the node's parentNode
      // should be one of our targets
      if (childsOnly && self.targets.indexOf(node.parentNode) === -1) {
        return
      }

      // test if the node itself matches the selector
      if (matches(node, search)) {
        callback.call(node)
      }

                     // ↓ IE workarounds ...
      if (childsOnly || (initialized && isOldIE && callback !== onRemoved)) return

      if (!node.querySelectorAll) return
      toArr(node.querySelectorAll(selector)).forEach(function(node) {
        callback.call(node)
      })
    })
  }

  this.observer = new MutationObserver(function(mutations) {
    self.disconnect()

    mutations.forEach(function(mutation) {
      if (onAdded)   apply(mutation.addedNodes,   onAdded)
      if (onRemoved) apply(mutation.removedNodes, onRemoved)
    })

    self.observe()
  })

  initialized = true

  function start() {
    // call onAdded for existing elements
    if (onAdded) {
      self.targets.forEach(function(target) {
        apply(target.children, onAdded)
      })
    }

    self.observe()
  }

  if (document.readyState !== 'loading') {
    start()
  } else {
    document.addEventListener('DOMContentLoaded', start)
  }
}

SelectorObserver.prototype.disconnect = function() {
  this.observer.disconnect()
}

SelectorObserver.prototype.observe = function() {
  var self = this
  this.targets.forEach(function(target) {
    self.observer.observe(target, { childList: true, subtree: true })
  })
}

if (typeof exports !== 'undefined') {
  module.exports = SelectorObserver
}

// DOM extension
Element.prototype.observeSelector = function(selector, onAdded, onRemoved) {
  return new SelectorObserver(this, selector, onAdded, onRemoved)
}
