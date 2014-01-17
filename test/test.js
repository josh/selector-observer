(function() {
  'use strict';

  module('SelectorObserver', {
    teardown: function() {
      window.stopAllChangeMonitors();
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
    expect(2);
    var observer = new SelectorObserver(document);

    var result = observer.observe('.foo', function() {
      ok(true);
      start();
    });

    var foo = document.createElement('div');
    foo.className = 'foo';
    var fixture = document.getElementById('qunit-fixture');
    fixture.appendChild(foo);

    equal(undefined, result);
  });
})();
