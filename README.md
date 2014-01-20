# Selector Observer


## Usage

``` javascript
var observer = new SelectorObserver(document);
observer.observe(‘form’, function() {
  this.addEventListener(‘submit’, onSubmit);
  return function() {
    this.removeEventListener(‘submit’, onSubmit);
  };
});
````


## Installation

Available on [Bower](http://bower.io) as **selector-observer**.

```
$ bower install selector-observer
```


## Browser Support

Chrome (latest), Safari (6.0+), Firefox (latest) and IE 9+.


## Development

Clone the repository from GitHub.

```
$ git clone https://github.com/josh/selector-observer
```

You'll need to have [Grunt](http://gruntjs.com) installed. If you don't have the `grunt` executable available, you can install it with:

```
$ npm install -g grunt-cli
```

Now just `cd` into the directory and install the local npm dependencies.

```
$ cd selector-observer/
$ npm install
```

Use `grunt test` to run the test suite.

```
$ grunt test
Running "jshint:all" (jshint) task
>> 5 files lint free.

Running "qunit:all" (qunit) task
Testing test/test.html .....................OK
>> 100 assertions passed (50ms)

Done, without errors.
```


## See Also

* [@csuwildcat](github.com/csuwildcat)'s "[I Want a DAMNodeInserted Event!](http://www.backalleycoder.com/2012/04/25/i-want-a-damnodeinserted/)" post
* [mutation-summary](https://code.google.com/p/mutation-summary/)


## License

Copyright (c) 2014 Joshua Peek

Distributed under an MIT-style license. See LICENSE for details.
