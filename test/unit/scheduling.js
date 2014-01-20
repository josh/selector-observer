(function() {
  'use strict';

  module('scheduling', {
    setup: function() {
      QUnit.config.current.ignoreGlobalErrors = true;
      this.fixture = document.getElementById('qunit-fixture');
      this.observer = new SelectorObserver(this.fixture);
    },
    teardown: function() {
      this.observer.disconnect();
      QUnit.config.current.ignoreGlobalErrors = false;
    }
  });

  test('observers are ran in defined order', function() {
    expect(2);

    var fixture = this.fixture;

    var count = 0;
    this.observer.observe('.foo', function() {
      equal(++count, 1);
      start();
    });
    stop();

    this.observer.observe('.bar', function() {
      equal(++count, 2);
      start();
    });
    stop();

    var foo = document.createElement('div');
    foo.className = 'foo';

    var bar = document.createElement('div');
    bar.className = 'bar';

    fixture.appendChild(foo);
    fixture.appendChild(bar);
  });

  // FIXME
  // test('observers with the same selector are ran in defined order', function() {
  //   expect(4);
  //
  //   var fixture = this.fixture;
  //
  //   var count = 0;
  //   this.observer.observe('.foo', function() {
  //     ++count;
  //     if (count === 1) {
  //       equal(count, 1);
  //     } else {
  //       equal(count, 2);
  //     }
  //     start();
  //   });
  //   stop();
  //   stop();
  //
  //   this.observer.observe('.foo', function() {
  //     ++count;
  //     if (count === 3) {
  //       equal(count, 3);
  //     } else {
  //       equal(count, 4);
  //     }
  //     start();
  //   });
  //   stop();
  //   stop();
  //
  //   var foo1 = document.createElement('div');
  //   foo1.className = 'foo';
  //
  //   var foo2 = document.createElement('div');
  //   foo2.className = 'foo';
  //
  //   fixture.appendChild(foo1);
  //   fixture.appendChild(foo2);
  // });

  test('observers unmwatch handlers are ran async in defined order', function() {
    expect(4);

    var fixture = this.fixture;

    var foo = document.createElement('div');
    foo.className = 'foo';

    var bar = document.createElement('div');
    bar.className = 'bar';

    var count = 0;
    this.observer.observe('.foo', function() {
      equal(++count, 1);
      fixture.removeChild(foo);

      return function() {
        equal(++count, 3);
        start();
      };
    });
    stop();

    this.observer.observe('.bar', function() {
      equal(++count, 2);
      fixture.removeChild(bar);

      return function() {
        equal(++count, 4);
        start();
      };
    });
    stop();

    fixture.appendChild(foo);
    fixture.appendChild(bar);
  });

  test('observers find existing matching elements', function() {
    expect(1);

    var fixture = this.fixture;

    var foo = document.createElement('div');
    foo.className = 'foo';
    fixture.appendChild(foo);

    this.observer.observe('.foo', function() {
      ok(true);
      start();
    });
    stop();
  });

  test('observers that throw an exception dont prevent others from running', function() {
    expect(2);

    var fixture = this.fixture;

    var count = 0;
    this.observer.observe('.foo', function() {
      equal(++count, 1);
      start();
      throw('error');
    });
    stop();

    this.observer.observe('.bar', function() {
      equal(++count, 2);
      start();
    });
    stop();

    var foo = document.createElement('div');
    foo.className = 'foo';

    var bar = document.createElement('div');
    bar.className = 'bar';

    fixture.appendChild(foo);
    fixture.appendChild(bar);
  });
})();
