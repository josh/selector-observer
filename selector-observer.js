(function(window) {
  'use strict';

  var Promise = window.Promise;
  var SelectorSet = window.SelectorSet;
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
    this.selectorSet = new SelectorSet();

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
    var observer = {
      id: ++this.uid,
      selector: selector,
      handler: handler,
      elements: []
    };
    this.selectorSet.add(selector, observer);
    this.observers.push(observer);
  };

  SelectorObserver.prototype.checkForChanges = function() {
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

    var observer, observerKey, deferred;
    var e, el;

    var m, matches = this.selectorSet.queryAll(this.root);
    for (m = 0; m < matches.length; m++) {
      var match = matches[m];
      observer = match.data;
      observerKey = '__selectorObserver' + observer.id;

      for (e = 0; e < match.elements.length; e++) {
        el = match.elements[e];

        if (!el[observerKey]) {
          deferred = new Deferred();
          el[observerKey] = deferred;
          observer.elements.push(el);
          runHandler(observer.handler, el, deferred);
        }
      }
    }

    var i;
    for (i = 0; i < this.observers.length; i++) {
      observer = this.observers[i];
      observerKey = '__selectorObserver' + observer.id;
      matches = slice.call(this.root.querySelectorAll(observer.selector), 0);

      for (e = 0; e < observer.elements.length; e++) {
        el = observer.elements[e];

        if (matches.indexOf(el) === -1) {
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
