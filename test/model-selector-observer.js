// Model implementation of SelectorObserver.
//
// This should serve as a model of correctness for guiding the implemenation
// of "selector-observer.js". Tests should pass on both implemenations.
// Prefer easy to understand code over any sort of efficiency. No
// optimizations.
//
(function(window) {
  'use strict';

  var Promise = window.Promise;
  var slice = Array.prototype.slice;

  function Deferred() {
    this.resolved = null;
    this.pending = [];
  }

  Deferred.prototype.resolve = function() {
    if (!this.resolved) {
      this.resolved = Promise.cast();
      var p = this.pending.length;
      while (p--) {
        this.resolved.then(this.pending[p]);
      }
    }
  };

  Deferred.prototype.then = function(onFulfilled) {
    if (this.resolved) {
      this.resolved.then(onFulfilled);
    } else {
      this.pending.push(onFulfilled);
    }
  };


  var monitors = [];

  function SelectorObserver(root) {
    var self = this;

    this.root = root;
    this.observers = [];
    this.uid = 0;
    this.trackedElements = [];

    var intervalId = setInterval(function() {
      self.checkForChanges();
    }, 10);
    monitors.push(intervalId);
  }

  // For tests
  SelectorObserver.stop = function() {
    var m = monitors.length;
    while (m--) {
      clearInterval(monitors[m]);
    }
  };


  SelectorObserver.prototype.observe = function(selector, handler) {
    this.observers.push({
      id: ++this.uid,
      selector: selector,
      handler: handler
    });
  };

  SelectorObserver.prototype.checkForChanges = function() {
    var elements = slice.call(this.root.getElementsByTagName('*'), 0);
    elements = elements.concat(this.trackedElements, 0);

    function runHandler(handler, el, deferred) {
      Promise.cast().then(function() {
        var result = handler.call(el, el);
        if (typeof result === 'function') {
          deferred.then(function() {
            result.call(el, el);
          });
        }
      });
    }

    var i;
    for (i = 0; i < this.observers.length; i++) {
      var observer = this.observers[i];
      var observerKey = '__selectorObserver' + observer.id;
      var matches = slice.call(this.root.querySelectorAll(observer.selector), 0);

      var e;
      for (e = 0; e < elements.length; e++) {
        var el = elements[e];

        if (matches.indexOf(el) !== -1) {
          if (!el[observerKey]) {
            var deferred = new Deferred();
            el[observerKey] = deferred;
            this.trackedElements.push(el);
            runHandler(observer.handler, el, deferred);
          }
        } else {
          if (el[observerKey]) {
            el[observerKey].resolve();
            delete el[observerKey];
          }
        }
      }
    }
  };


  window.SelectorObserver = SelectorObserver;
})(this);
