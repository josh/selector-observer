(function() {
  'use strict';

  module('main', {
    teardown: function() {
      SelectorObserver.stop();
    }
  });

  test('create new document SelectorObserver', function() {
    var observer = new SelectorObserver(document);
    ok(observer);
  });

  test('invoke observe on document SelectorObserver with no arguments', function() {
    var observer = new SelectorObserver(document);
    var result = observer.observe();
    equal(undefined, result);
  });

  test('invoke observe on document SelectorObserver with no handler', function() {
    var observer = new SelectorObserver(document);
    var result = observer.observe('.foo');
    equal(undefined, result);
  });

  asyncTest('observe selector on document SelectorObserver', function() {
    expect(5);
    var observer = new SelectorObserver(document);

    var fixture = document.getElementById('qunit-fixture');

    var foo = document.createElement('div');
    foo.className = 'foo';

    var result = observer.observe('.foo', function(el) {
      equal(foo, this);
      equal(foo, el);

      fixture.removeChild(foo);

      return function(el) {
        equal(foo, this);
        equal(foo, el);

        start();
      };
    });

    fixture.appendChild(foo);

    equal(undefined, result);
  });
})();
