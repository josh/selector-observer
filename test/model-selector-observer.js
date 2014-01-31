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

  function bind(fn, self) {
    return function() {
      return fn.apply(self, arguments);
    };
  }

  function noop() {
  }

  function SelectorObserver(root) {
    if (!root) {
      throw new TypeError('Failed to construct \'SelectorObserver\': Argument must be a Node');
    }

    this.root = root;
    this.observers = [];
    this.trackedElements = [];

    this.scheduleCheckForChanges = bind(this.scheduleCheckForChanges, this);
    this.checkForChanges = bind(this.checkForChanges, this);

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

    var tasks = [];

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
            observer.handlers.set(el, noop);
            this.trackedElements.push(el);
            tasks.push({match: observer.handler, handlers: observer.handlers, el: el});
          }
        } else {
          if (matched) {
            tasks.push({unmatch: matched, el: el});
            observer.handlers['delete'](el);
          }
        }
      }
    }

    while (tasks.length) {
      var task = tasks.shift();
      if (task.match) {
        try {
          var result = task.match.call(task.el, task.el);
          if (typeof result === 'function') {
            task.handlers.set(task.el, result);
          }
        } catch (err) {}
      } else if (task.unmatch) {
        try {
          task.unmatch.call(task.el, task.el);
        } catch (err) {}
      }
    }

    this.checkForChangesId = null;
  };


  window.SelectorObserver = SelectorObserver;
})(this);
