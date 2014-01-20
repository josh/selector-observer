(function() {
  'use strict';

  module('main');

  test('create new document SelectorObserver', function() {
    var observer = new SelectorObserver(document);
    ok(observer);
    observer.disconnect();
  });

  test('invoke observe on document SelectorObserver with no arguments', function() {
    var observer = new SelectorObserver(document);
    var result = observer.observe();
    equal(undefined, result);
    observer.disconnect();
  });

  test('invoke observe on document SelectorObserver with no handler', function() {
    var observer = new SelectorObserver(document);
    var result = observer.observe('.foo');
    equal(undefined, result);
    observer.disconnect();
  });

  test('observe selector on document SelectorObserver', function() {
    expect(4);
    var observer = new SelectorObserver(document);

    var fixture = document.getElementById('qunit-fixture');

    var foo = document.createElement('div');
    foo.className = 'foo';

    observer.observe('.foo', function(el) {
      equal(foo, this);
      equal(foo, el);

      fixture.removeChild(foo);

      return function(el) {
        equal(foo, this);
        equal(foo, el);

        observer.disconnect();
        start();
      };
    });
    stop();

    fixture.appendChild(foo);
  });
})();
