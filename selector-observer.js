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
    var key = 'SelectorObserver' + uid++;

    var div = document.createElement('div');
    var styleProps = window.getComputedStyle(div);

    var prefix;
    if ('animationName' in styleProps) {
      prefix = '';
    } else if ('MozAnimationName' in styleProps) {
      prefix = '-moz-';
    } else if ('msAnimationName' in styleProps) {
      prefix = '-ms-';
    } else if ('webkitAnimationName' in styleProps) {
      prefix = '-webkit-';
    } else {
      return;
    }

    var keyframe = '@' + prefix + 'keyframes ' + key + ' {\n  from { outline: 1px solid transparent }\n  to { outline: 0px solid transparent }\n}';
    var node = document.createTextNode(keyframe);
    keyframes.appendChild(node);

    var rule = selector + ' {\n  ' + prefix + 'animation-duration: 0.01s;\n  ' + prefix + 'animation-name: ' + key + ';\n}';
    styles.sheet.insertRule(rule, 0);
  }

  // hack for unmatching .checked = false
  watch(':checked');
  watch(':not(:checked)');


  function SelectorObserver(root) {
    if (!root) {
      throw new TypeError('Failed to construct \'SelectorObserver\': Argument must be a Node');
    }

    this.root = root;
    this.observers = [];
    this.selectorSet = new SelectorSet();
    this.handlers = new WeakMap();

    this.scheduleCheckForChanges = bind(this.scheduleCheckForChanges, this);
    this.checkForChanges = bind(this.checkForChanges, this);

    this.root.addEventListener('animationstart', this.scheduleCheckForChanges, true);
    this.root.addEventListener('oAnimationStart', this.scheduleCheckForChanges, true);
    this.root.addEventListener('MSAnimationStart', this.scheduleCheckForChanges, true);
    this.root.addEventListener('webkitAnimationStart', this.scheduleCheckForChanges, true);

    var self = this;
    this.root.addEventListener('DOMNodeInserted', function(event) {
      event.target.onpropertychange = self.scheduleCheckForChanges;
    }, true);

    if (MutationObserver) {
      var observer = new MutationObserver(this.checkForChanges);
      var config = {
        childList: true,
        attributes: true,
        characterData: true,
        subtree: true
      };
      observer.observe(this.root, config);
    } else {
      this.root.addEventListener('DOMAttributeNameChanged', this.scheduleCheckForChanges, true);
      this.root.addEventListener('DOMCharacterDataModified', this.scheduleCheckForChanges, true);
      this.root.addEventListener('DOMElementNameChanged', this.scheduleCheckForChanges, true);
      this.root.addEventListener('DOMNodeInserted', this.scheduleCheckForChanges, true);
      this.root.addEventListener('DOMNodeInsertedIntoDocument', this.scheduleCheckForChanges, true);
      this.root.addEventListener('DOMNodeRemoved', this.scheduleCheckForChanges, true);
      this.root.addEventListener('DOMNodeRemovedFromDocument', this.scheduleCheckForChanges, true);
      this.root.addEventListener('DOMSubtreeModified', this.scheduleCheckForChanges, true);
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
