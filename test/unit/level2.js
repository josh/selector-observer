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

  test('universal selector', function() {
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
})();
