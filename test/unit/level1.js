(function() {
  'use strict';

  // Test selectors allowed per CSS1 spec
  //
  //   http://www.w3.org/TR/CSS1/
  //
  module('CSS1', {
    teardown: function() {
      SelectorObserver.stop();
    }
  });

  test('group tag selectors', function() {
    expect(4);

    var fixture = document.getElementById('qunit-fixture');
    var observer = new SelectorObserver(fixture);

    var h1 = document.createElement('h1');
    var h2 = document.createElement('h2');

    var count = 0;
    observer.observe('H1, H2, H3', function() {
      count++;
      if (count === 1) {
        equal(this, h1);
        fixture.removeChild(h1);
      } else if (count === 2) {
        equal(this, h2);
        fixture.removeChild(h2);
      } else {
        ok(false);
      }

      return function() {
        count++;
        if (count === 3) {
          equal(h1, this);
        } else if (count === 4) {
          equal(h2, this);
        } else {
          ok(false);
        }
        start();
      };
    });
    stop();
    stop();

    fixture.appendChild(h1);
    fixture.appendChild(h2);
  });

  test('class selector', function() {
    expect(2);

    var fixture = document.getElementById('qunit-fixture');
    var observer = new SelectorObserver(fixture);

    var h1 = document.createElement('h1');
    h1.className = 'pastoral';

    observer.observe('H1.pastoral', function() {
      equal(this, h1);
      fixture.removeChild(h1);

      return function() {
        equal(h1, this);
        start();
      };
    });
    stop();

    fixture.appendChild(h1);
  });

  test('id selector', function() {
    expect(2);

    var fixture = document.getElementById('qunit-fixture');
    var observer = new SelectorObserver(fixture);

    var p = document.createElement('p');
    p.id = 'z98y';

    observer.observe('H1#z98y', function() {
      ok(false);
    });

    observer.observe('#z98y', function() {
      equal(this, p);
      fixture.removeChild(p);

      return function() {
        equal(p, this);
        start();
      };
    });
    stop();

    fixture.appendChild(p);
  });
})();
