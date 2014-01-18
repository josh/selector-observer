(function() {
  'use strict';

  // Test selectors allowed per CSS2 spec
  //
  //   http://www.w3.org/TR/CSS2/
  //
  module('CSS2', {
    teardown: function() {
      SelectorObserver.stop();
    }
  });

  test('add element matching universal selector', function() {
    expect(2);

    var fixture = document.getElementById('qunit-fixture');
    var observer = new SelectorObserver(fixture);

    var div1 = document.createElement('div');
    var div2 = document.createElement('div');

    var count = 0;
    observer.observe('*', function() {
      count++;
      ok(this);

      if (count === 2) {
        start();
      }
    });
    stop();

    fixture.appendChild(div1);
    fixture.appendChild(div2);
  });

  test('add element with type selector', function() {
    expect(1);

    var fixture = document.getElementById('qunit-fixture');
    var observer = new SelectorObserver(fixture);

    var h1 = document.createElement('h1');

    observer.observe('h1', function() {
      equal(this, h1);
      start();
    });
    stop();

    fixture.appendChild(h1);
  });

  test('add element to parent with descendant selector', function() {
    expect(3);

    var fixture = document.getElementById('qunit-fixture');
    var observer = new SelectorObserver(fixture);

    var h1 = document.createElement('h1');
    var em = document.createElement('em');

    observer.observe('h1', function() {
      equal(this, h1);
      start();
    });
    stop();

    observer.observe('em', function() {
      equal(this, em);
      start();
    });
    stop();

    observer.observe('h1 em', function() {
      equal(this, em);
      start();
    });
    stop();

    fixture.appendChild(h1);
    h1.appendChild(em);
  });

  test('add element to parent with child selector', function() {
    expect(3);

    var fixture = document.getElementById('qunit-fixture');
    var observer = new SelectorObserver(fixture);

    var h1 = document.createElement('h1');
    var em = document.createElement('em');

    observer.observe('h1', function() {
      equal(this, h1);
      start();
    });
    stop();

    observer.observe('em', function() {
      equal(this, em);
      start();
    });
    stop();

    observer.observe('h1 > em', function() {
      equal(this, em);
      start();
    });
    stop();

    fixture.appendChild(h1);
    h1.appendChild(em);
  });

  test('add element to same parent with adjacent sibling selector', function() {
    expect(3);

    var fixture = document.getElementById('qunit-fixture');
    var observer = new SelectorObserver(fixture);

    var math = document.createElement('math');
    var p = document.createElement('p');

    observer.observe('math', function() {
      equal(this, math);
      start();
    });
    stop();

    observer.observe('p', function() {
      equal(this, p);
      start();
    });
    stop();

    observer.observe('math + p', function() {
      equal(this, p);
      start();
    });
    stop();

    fixture.appendChild(math);
    fixture.appendChild(p);
  });
})();
