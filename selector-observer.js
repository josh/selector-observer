(function(window) {
  'use strict';

   // Detect prefixed Element#matches function.
  var docElem = window.document.documentElement;
  var matches = (docElem.webkitMatchesSelector ||
                  docElem.mozMatchesSelector ||
                  docElem.oMatchesSelector ||
                  docElem.msMatchesSelector);

  var monitors = [];

  function SelectorObserver(root) {
    var self = this;

    this.root = root;
    this.observers = [];
    this.uid = 0;

    var intervalId = setInterval(function() {
      self.checkForChanges();
    }, 0);
    monitors.push(intervalId);
  }

  SelectorObserver.prototype.observe = function(selector, handler) {
    this.observers.push({id: ++this.uid, selector: selector, handler: handler});
  };

  SelectorObserver.prototype.revalidateObservers = function(el) {
    var o = this.observers.length;
    while (o--) {
      var observer = this.observers[o];
      if (matches.call(el, observer.selector)) {
        this.didMatchObserver(el, observer);
      }
    }
  };

  SelectorObserver.prototype.didMatchObserver = function(el, observer) {
    var key = '__selectorObserver' + observer.id;
    if (!el[key]) {
      setTimeout(function() {
        observer.handler.call(el);
      }, 0);
      el[key] = true;
    }
  };

  SelectorObserver.prototype.checkForChanges = function() {
    var els = this.root.getElementsByTagName('*');
    var e = els.length;
    while (e--) {
      this.revalidateObservers(els[e]);
    }
  };

  // For tests
  window.stopAllChangeMonitors = function() {
    var m = monitors.length;
    while (m--) {
      clearInterval(monitors[m]);
    }
  };

  window.SelectorObserver = SelectorObserver;
})(this);
