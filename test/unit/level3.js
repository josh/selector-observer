(function() {
  'use strict';

  // Test selectors allowed per CSS Selectors Level 3 spec
  //
  //   http://www.w3.org/TR/css3-selectors/
  //
  module('CSS3', {
    setup: function() {
      this.fixture = document.getElementById('qunit-fixture');
      this.observer = new SelectorObserver(this.fixture);
    },
    teardown: function() {
      this.observer.disconnect();
    }
  });

  test('add enabled input matching enabled pseudo class selector', function() {
    expect(2);

    var fixture = this.fixture;
    var input = document.createElement('input');
    equal(input.disabled, false);

    this.observer.observe('input:enabled', function() {
      ok(this);
      start();
    });
    stop();

    fixture.appendChild(input);
  });

  test('remove enabled input matching enabled pseudo class selector', function() {
    expect(2);

    var fixture = this.fixture;
    var input = document.createElement('input');
    equal(input.disabled, false);

    this.observer.observe('input:enabled', function() {
      input.disabled = true;

      return function() {
        ok(this);
        start();
      };
    });
    stop();

    fixture.appendChild(input);
  });

  test('add disabled input matching disabled pseudo class selector', function() {
    expect(2);

    var fixture = this.fixture;
    var input = document.createElement('input');
    input.disabled = true;
    equal(input.disabled, true);

    this.observer.observe('input:disabled', function() {
      ok(this);
      start();
    });
    stop();

    fixture.appendChild(input);
  });

  test('remove disabled input matching disabled pseudo class selector', function() {
    expect(2);

    var fixture = this.fixture;
    var input = document.createElement('input');
    input.disabled = true;
    equal(input.disabled, true);

    this.observer.observe('input:disabled', function() {
      input.disabled = false;

      return function() {
        ok(this);
        start();
      };
    });
    stop();

    fixture.appendChild(input);
  });

  test('add checked checkbox matching enabled checked class selector', function() {
    expect(2);

    var fixture = this.fixture;
    var input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = true;
    equal(input.checked, true);

    this.observer.observe('input:enabled', function() {
      ok(this);
      start();
    });
    stop();

    fixture.appendChild(input);
  });

  test('remove checked checkbox matching checked class selector', function() {
    expect(2);

    var fixture = this.fixture;
    var input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = true;
    equal(input.checked, true);

    this.observer.observe('input:checked', function() {
      input.checked = false;

      return function() {
        ok(this);
        start();
      };
    });
    stop();

    fixture.appendChild(input);
  });

  test('add checked radio matching checked class selector', function() {
    expect(2);

    var fixture = this.fixture;
    var input = document.createElement('input');
    input.type = 'radio';
    input.checked = true;
    equal(input.checked, true);

    this.observer.observe('input:checked', function() {
      ok(this);
      start();
    });
    stop();

    fixture.appendChild(input);
  });

  test('removing checked radio matching checked class selector', function() {
    expect(2);

    var fixture = this.fixture;
    var input = document.createElement('input');
    input.type = 'radio';
    input.checked = true;
    equal(input.checked, true);

    this.observer.observe('input:checked', function() {
      input.checked = false;

      return function() {
        ok(this);
        start();
      };
    });
    stop();

    fixture.appendChild(input);
  });

  test('add indeterminate checkbox matching indeterminate selector', function() {
    expect(2);

    var fixture = this.fixture;
    var input = document.createElement('input');
    input.type = 'checkbox';
    input.indeterminate = true;
    equal(input.indeterminate, true);

    this.observer.observe('input:indeterminate', function() {
      ok(this);
      start();
    });
    stop();

    fixture.appendChild(input);
  });

  test('remove indeterminate checkbox matching indeterminate selector', function() {
    expect(2);

    var fixture = this.fixture;
    var input = document.createElement('input');
    input.type = 'checkbox';
    input.indeterminate = true;
    equal(input.indeterminate, true);

    this.observer.observe('input:indeterminate', function() {
      input.indeterminate = false;

      return function() {
        ok(this);
        start();
      };
    });
    stop();

    fixture.appendChild(input);
  });
})();
