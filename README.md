# selector-observer

Observe newly added and removed DOM nodes matching a given selector. This is especially useful for applying specific calls, e.g. Plugin calls, to further added DOM nodes.

[![NPM](https://badge.fury.io/js/selector-observer.png)](https://npmjs.org/package/selector-observer)

[![browser support](https://ci.testling.com/rkusa/selector-observer.png)
](https://ci.testling.com/rkusa/selector-observer)

## API

```js
  .observeSelector(selector, onAdded, onRemoved)
```

or

```js
  var observer = new SelectorObserver(target, selector, onAdded, onRemoved)
  observer.observe()
```

## Example

```js
document.getElementById('some-id').observeSelector('div.draggable', function() {
  new Draggable(this)
})
```

## jQuery / Zepto.js

I have removed the jQuery / Zepto.js dependency in `1.0.0`. However, `selector-observer` is still compatible to both frameworks; a `.observe()` method can be added as follows:

```js
// usage $(targetSelector).observe(selector, onAdded, onRemoved)
$.fn.observe = function(selector, onAdded, onRemoved) {
  this[0].observeSelector(selector, onAdded, onRemoved)
  return this
}
```

## MIT License
Copyright (c) 2013-2014 Markus Ast

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.