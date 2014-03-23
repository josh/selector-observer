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

  function asap(flush) {
    var iterations = 0;
    var observer = new MutationObserver(flush);
    var node = document.createTextNode('');
    observer.observe(node, {characterData: true});
    return {
      flush: function() {
        node.data = (iterations = ++iterations % 2);
      },
      stop: function() {
        observer.disconnect();
      }
    };
  }

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

  var PseudoObserver = (function() {
    // :link, :visited, :hover, :active
    // :focus

    var classes = {
      disabled: {
        value: function(el) { return el.disabled; },
        oldValue: new WeakMap()
      },
      checked: {
        value: function(el) { return el.checked; },
        oldValue: new WeakMap()
      },
      indeterminate: {
        value: function(el) { return el.indeterminate; },
        oldValue: new WeakMap()
      }
    };

    var styles = document.createElement('style');
    styles.type = 'text/css';
    document.head.appendChild(styles);

    var keyframes = document.createElement('style');
    keyframes.type = 'text/css';
    document.head.appendChild(keyframes);

    var uid = 0;
    function insertAnimation(selector){
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

    insertAnimation('input');
    insertAnimation('input:disabled');
    insertAnimation('input:not(:disabled)');
    insertAnimation('input:checked');
    insertAnimation('input:not(:checked)');
    insertAnimation('input:indeterminate');
    insertAnimation('input:not(:indeterminate)');

    function PseudoObserver(callback) {
      this.nodes = [];
      this.records = [];
      this.onAnimationStart = bind(this.onAnimationStart, this);

      var self = this;
      this.asap = asap(function() {
        callback(self.takeRecords());
      });
    }

    PseudoObserver.prototype.observe = function(node) {
      this.nodes.push(node);

      node.addEventListener('change', this.onAnimationStart, true);
      node.addEventListener('animationstart', this.onAnimationStart, true);
      node.addEventListener('oAnimationStart', this.onAnimationStart, true);
      node.addEventListener('MSAnimationStart', this.onAnimationStart, true);
      node.addEventListener('webkitAnimationStart', this.onAnimationStart, true);

      var self = this;
      node.addEventListener('DOMSubtreeModified', function(event) {
        if (event.target.nodeName === 'INPUT') {
          self.onChange(event.target);
          event.target.onpropertychange = function() {
            self.onChange(event.target);
          };
        }
      }, true);
    };

    PseudoObserver.prototype.onAnimationStart = function(event) {
      this.onChange(event.target);
    };

    PseudoObserver.prototype.onChange = function(target) {
      var className;
      for (className in classes) {
        var oldValue = classes[className].oldValue.get(target);
        var value = classes[className].value(target);

        if (oldValue !== value) {
          classes[className].oldValue.set(target, value);

          var record = {
            type: 'pseudo',
            className: className,
            oldValue: oldValue,
            value: value,
            target: target
          };
          this.records.push(record);
        }
      }

      if (this.records.length) {
        this.asap.flush();
      }
    };

    PseudoObserver.prototype.disconnect = function() {
      var n = this.nodes.length;
      while (n--) {
        var node = this.nodes[n];
        node.removeEventListener('change', this.onAnimationStart, true);
        node.removeEventListener('animationstart', this.onAnimationStart, true);
        node.removeEventListener('oAnimationStart', this.onAnimationStart, true);
        node.removeEventListener('MSAnimationStart', this.onAnimationStart, true);
        node.removeEventListener('webkitAnimationStart', this.onAnimationStart, true);
      }

      this.asap.stop();
    };

    PseudoObserver.prototype.takeRecords = function() {
      var records = this.records;
      this.records = [];
      return records;
    };

    return PseudoObserver;
  })();


  var uid = 0;

  function SelectorObserver(root) {
    if (!root) {
      throw new TypeError('Failed to construct \'SelectorObserver\': Argument must be a Node');
    }

    this.root = root;
    this.observers = [];
    this.selectorSet = new SelectorSet();
    this.handlers = new WeakMap();
    this.invalidatedElements = [];

    this.invalidateRecords = bind(this.invalidateRecords, this);
    this.checkForChanges = bind(this.checkForChanges, this);
    this.asap = asap(this.checkForChanges);

    this.mutationObserver = new MutationObserver(this.invalidateRecords);
    var config = {
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true
    };
    this.mutationObserver.observe(this.root, config);

    this.psuedoObserver = new PseudoObserver(this.invalidateRecords);
    this.psuedoObserver.observe(this.root);
  }

  SelectorObserver.prototype.disconnect = function() {
    this.stopped = true;
    this.mutationObserver.disconnect();
    this.psuedoObserver.disconnect();
    this.asap.stop();
  };

  SelectorObserver.prototype.observe = function(selector, handler) {
    var observer = {
      id: uid++,
      selector: selector,
      handler: handler,
      handlers: new WeakMap(),
      elements: []
    };
    this.selectorSet.add(selector, observer);
    this.observers.push(observer);
  };

  SelectorObserver.prototype.invalidateRecords = function(records) {
    var self = this;

    records.forEach(function(record) {
      self.invalidateElement(record.target);

      if (record.type === 'childList') {
        var i;
        for (i = 0; i < record.addedNodes.length; i++) {
          self.invalidateElement(record.addedNodes[i]);
        }
        for (i = 0; i < record.removedNodes.length; i++) {
          self.invalidateElement(record.removedNodes[i]);
        }
      }
    });
  };

  SelectorObserver.prototype.invalidateElement = function(el) {
    this.invalidatedElements.push(el);
    this.asap.flush();
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

    var observer, deferred;
    var e, el;

    var m, matches = this.selectorSet.queryAll(this.root);
    for (m = 0; m < matches.length; m++) {
      var match = matches[m];
      observer = match.data;

      for (e = 0; e < match.elements.length; e++) {
        el = match.elements[e];

        if (!observer.handlers.get(el)) {
          deferred = new Deferred();
          observer.handlers.set(el, deferred);
          observer.elements.push(el);
          runHandler(observer.handler, el, deferred);
        }
      }
    }

    var i;
    for (i = 0; i < this.observers.length; i++) {
      observer = this.observers[i];
      matches = slice.call(this.root.querySelectorAll(observer.selector), 0);

      for (e = 0; e < observer.elements.length; e++) {
        el = observer.elements[e];

        if (matches.indexOf(el) === -1) {
          deferred = observer.handlers.get(el);
          if (deferred) {
            deferred.resolve();
            observer.handlers['delete'](el);
          }
        }
      }
    }
  };


  window.SelectorObserver = SelectorObserver;
})(this);
