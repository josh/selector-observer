(function() {
  'use strict';

  module('level1 - class', {
    teardown: function() {
      SelectorObserver.stop();
    }
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
})();
