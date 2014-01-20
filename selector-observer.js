(function(window) {
  'use strict';

  var Promise = window.Promise;
  var WeakMap = window.WeakMap;
  var SelectorSet = window.SelectorSet;
  var MutationObserver = window.MutationObserver;
  var slice = Array.prototype.slice;
  var bind = function(fn, self) {
    return function() {
      return fn.apply(self, arguments);
    };
  };

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



  var styles = document.createElement('style');
  styles.type = 'text/css';
  document.head.appendChild(styles);

  var keyframes = document.createElement('style');
  keyframes.type = 'text/css';
  document.head.appendChild(keyframes);

  var uid = 0;
  function watch(selector){
    var key = 'SelectorObserver-' + uid++;
    var node = document.createTextNode('@-webkit-keyframes ' + key + ' { from { clip: rect(1px, auto, auto, auto); } to { clip: rect(0px, auto, auto, auto); } }');
    keyframes.appendChild(node);
    var rule = selector + ' { animation-duration: 0.01s; animation-name: ' + key + ' !important; }';
    styles.sheet.insertRule(rule, 0);
  }


  function SelectorObserver(root) {
    this.root = root;
    this.observers = [];
    this.selectorSet = new SelectorSet();
    this.handlers = new WeakMap();

    this.scheduleCheckForChanges = bind(this.scheduleCheckForChanges, this);
    this.checkForChanges = bind(this.checkForChanges, this);

    this.root.addEventListener('animationstart', this.scheduleCheckForChanges, true);
    this.root.addEventListener('DOMAttributeNameChanged', this.scheduleCheckForChanges, true);
    this.root.addEventListener('DOMCharacterDataModified', this.scheduleCheckForChanges, true);
    this.root.addEventListener('DOMElementNameChanged', this.scheduleCheckForChanges, true);
    this.root.addEventListener('DOMNodeInserted', this.scheduleCheckForChanges, true);
    this.root.addEventListener('DOMNodeInsertedIntoDocument', this.scheduleCheckForChanges, true);
    this.root.addEventListener('DOMNodeRemoved', this.scheduleCheckForChanges, true);
    this.root.addEventListener('DOMNodeRemovedFromDocument', this.scheduleCheckForChanges, true);
    this.root.addEventListener('DOMSubtreeModified', this.scheduleCheckForChanges, true);

    if (MutationObserver) {
      var observer = new MutationObserver(this.checkForChanges);
      var config = {
        childList: true,
        attributes: true,
        characterData: true,
        subtree: true
      };
      observer.observe(this.root, config);
    }
  }

  SelectorObserver.prototype.disconnect = function() {
    this.stopped = true;
  };

  SelectorObserver.prototype.observe = function(selector, handler) {
    var observer = {
      id: uid++,
      selector: selector,
      handler: handler,
      elements: []
    };
    watch(selector);
    this.selectorSet.add(selector, observer);
    this.observers.push(observer);
  };

  SelectorObserver.prototype.scheduleCheckForChanges = function() {
    if (typeof this.checkForChangesId !== 'number') {
      this.checkForChangesId = setTimeout(this.checkForChanges, 0);
    }
  };

  SelectorObserver.prototype.checkForChanges = function() {
    if (this.stopped) {
      return;
    }

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

    this.checkForChangesId = null;
  };


  window.SelectorObserver = SelectorObserver;
})(this);
