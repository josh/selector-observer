(function() {
  'use strict';

  // Test selectors allowed per CSS2 spec
  //
  //   http://www.w3.org/TR/CSS2/
  //
  module('CSS2', {
    setup: function() {
      this.fixture = document.getElementById('qunit-fixture');
      this.observer = new SelectorObserver(this.fixture);
    },
    teardown: function() {
      this.observer.disconnect();
    }
  });

  test('add element matching universal selector', function() {
    expect(2);

    var fixture = this.fixture;
    var div1 = document.createElement('div');
    var div2 = document.createElement('div');

    var count = 0;
    this.observer.observe('*', function() {
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

    var fixture = this.fixture;
    var h1 = document.createElement('h1');

    this.observer.observe('h1', function() {
      equal(this, h1);
      start();
    });
    stop();

    fixture.appendChild(h1);
  });

  test('add element to parent with descendant selector', function() {
    expect(3);

    var fixture = this.fixture;
    var h1 = document.createElement('h1');
    var em = document.createElement('em');

    this.observer.observe('h1', function() {
      equal(this, h1);
      start();
    });
    stop();

    this.observer.observe('em', function() {
      equal(this, em);
      start();
    });
    stop();

    this.observer.observe('h1 em', function() {
      equal(this, em);
      start();
    });
    stop();

    fixture.appendChild(h1);
    h1.appendChild(em);
  });

  test('add element to parent with child selector', function() {
    expect(3);

    var fixture = this.fixture;
    var h1 = document.createElement('h1');
    var em = document.createElement('em');

    this.observer.observe('h1', function() {
      equal(this, h1);
      start();
    });
    stop();

    this.observer.observe('em', function() {
      equal(this, em);
      start();
    });
    stop();

    this.observer.observe('h1 > em', function() {
      equal(this, em);
      start();
    });
    stop();

    fixture.appendChild(h1);
    h1.appendChild(em);
  });

  test('add element to same parent with adjacent sibling selector', function() {
    expect(3);

    var fixture = this.fixture;
    var math = document.createElement('math');
    var p = document.createElement('p');

    this.observer.observe('math', function() {
      equal(this, math);
      start();
    });
    stop();

    this.observer.observe('p', function() {
      equal(this, p);
      start();
    });
    stop();

    this.observer.observe('math + p', function() {
      equal(this, p);
      start();
    });
    stop();

    fixture.appendChild(math);
    fixture.appendChild(p);
  });
})();
