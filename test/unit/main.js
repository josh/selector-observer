(function() {
  'use strict';

  module('main');

  test('create new document SelectorObserver', function() {
    var observer = new SelectorObserver(document);
    ok(observer);
    observer.disconnect();
  });

  test('constructor requires a root node', function() {
    throws(function() {
      new SelectorObserver();
    }, TypeError);
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

  test('observe handler element is this', function() {
    expect(2);

    var fixture = document.getElementById('qunit-fixture');
    var observer = new SelectorObserver(fixture);

    var foo = document.createElement('div');
    foo.className = 'foo';

    observer.observe('.foo', function() {
      equal(foo, this);
      fixture.removeChild(foo);

      return function() {
        equal(foo, this);
        observer.disconnect();
        start();
      };
    });
    stop();

    fixture.appendChild(foo);
  });

  test('observe handler el as first argument', function() {
    expect(2);

    var fixture = document.getElementById('qunit-fixture');
    var observer = new SelectorObserver(fixture);

    var foo = document.createElement('div');
    foo.className = 'foo';

    observer.observe('.foo', function(el) {
      equal(foo, el);
      fixture.removeChild(foo);

      return function(el) {
        equal(foo, el);
        observer.disconnect();
        start();
      };
    });
    stop();

    fixture.appendChild(foo);
  });

  test('disconnect prevents new observe events', function() {
    expect(0);

    var fixture = document.getElementById('qunit-fixture');
    var observer = new SelectorObserver(fixture);

    var foo = document.createElement('div');
    foo.className = 'foo';

    observer.observe('.foo', function() {
      ok(false);
    });

    observer.disconnect();
    fixture.appendChild(foo);

    stop();
    setTimeout(start, 100);
  });
})();
