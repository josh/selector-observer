// Model implementation of SelectorObserver.
//
// This should serve as a model of correctness for guiding the implemenation
// of "selector-observer.js". Tests should pass on both implemenations.
// Prefer easy to understand code over any sort of efficiency. No
// optimizations.
//
(function(window) {
  'use strict';

  var WeakMap = window.WeakMap;
  var slice = Array.prototype.slice;
  var bind = Function.prototype.bind || function(self) {
    var fn = this;
    return function() {
      return fn.apply(self, arguments);
    };
  };

  function noop() {
  }

  function SelectorObserver(root) {
    if (!root) {
      throw new TypeError('Failed to construct \'SelectorObserver\': Argument must be a Node');
    }

    this.root = root;
    this.observers = [];
    this.trackedElements = [];

    this.scheduleCheckForChanges = bind.call(this.scheduleCheckForChanges, this);
    this.checkForChanges = bind.call(this.checkForChanges, this);

    this.scheduleCheckForChangesId = setInterval(this.scheduleCheckForChanges, 0);
  }

  SelectorObserver.prototype.disconnect = function() {
    clearInterval(this.scheduleCheckForChangesId);
    clearInterval(this.checkForChangesId);
  };

  SelectorObserver.prototype.observe = function(selector, handler) {
    this.observers.push({
      selector: selector,
      handler: handler,
      handlers: new WeakMap()
    });
  };

  SelectorObserver.prototype.scheduleCheckForChanges = function() {
    if (typeof this.checkForChangesId !== 'number') {
      this.checkForChangesId = setTimeout(this.checkForChanges, 0);
    }
  };

  SelectorObserver.prototype.checkForChanges = function() {
    var elements = slice.call(this.root.getElementsByTagName('*'), 0);
    elements = elements.concat(this.trackedElements);

    var i;
    for (i = 0; i < this.observers.length; i++) {
      var observer = this.observers[i];
      var matches = slice.call(this.root.querySelectorAll(observer.selector), 0);

      var e;
      for (e = 0; e < elements.length; e++) {
        var el = elements[e];
        var matched = observer.handlers.get(el);

        if (matches.indexOf(el) !== -1) {
          if (!matched) {
            this.trackedElements.push(el);
            var result = null;
            try {
              result = observer.handler.call(el, el);
            } catch (err) {}
            matched = (typeof result === 'function') ? result : noop;
            observer.handlers.set(el, matched);
          }
        } else {
          if (matched) {
            try {
              matched.call(el, el);
            } catch (err) {}
            observer.handlers['delete'](el);
          }
        }
      }
    }

    this.checkForChangesId = null;
  };


  window.SelectorObserver = SelectorObserver;
})(this);
