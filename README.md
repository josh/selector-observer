# selector-observer

selector-observer allows you to monitor DOM elements that match a CSS selector. Rather than imperatively querying the DOM, register an observer for a CSS selector and trigger behavior whenever those elements appear on the page. Common uses include: registering event handlers, initialize a component or plugin, and .

## Usage

Two types of APIs are provide: a functional singleton API and a class based API that allows you to change the scope of observation.

The `observe` function will install on observer on the current `document`.

```javascript
import {observe} from 'selector-observer'

observe('.foo', {
  add(el) {
    console.log(el, 'added to', document)
  },
  remove(el) {
    console.log(el, 'removed from', document)
  }
})
```

Alternatively the class based `SelectorObserver` allows you to configure the root element. This API is similar to `MutationObserver`.

```javascript
import SelectorObserver from 'selector-observer'

const rootElement = document.getElementById('root')
const observer = new SelectorObserver(rootElement)

observer.observe('.foo', {
  add(el) {
    console.log(el, 'added to', rootElement)
  },
  remove(el) {
    console.log(el, 'removed from', rootElement)
  }
})
```

## Use Cases

### Event Handlers

`selector-observer` can help automatically install event handlers on any matching elements and ensure a cleanup stage ran. This is often necessary inside of using an event delegation technique if the event does not bubble.

```javascript
import {observe} from 'selector-observer'

function handleMouseEnter(event) {
  event.currentTarget.classList.add('active')
}

function handleMouseLeave(event) {
  event.currentTarget.classList.remove('active')
}

observe('.dropzone', {
  add(el) {
    el.addEventListener('mouseenter', handleMouseEnter)
    el.addEventListener('mouseleave', handleMouseLeave)
  },
  remove(el) {
    el.removeEventListener('mouseenter', handleMouseEnter)
    el.removeEventListener('mouseleave', handleMouseLeave)
  }
})
```

### Initialize third party component or plugin

Many third party component or plugin libraries require a manual initialize step to be installed on a given element. The add and remove hooks can be used if the plugin provides a cleanup hook. Often these libraries omit that kind of API too. To work around this, `observe` provides an `initialize` hook that only runs once per a given element.

This example initialize the `tippy` tooltip library on any `btn` buttons on the page.

```javascript
import {observe} from 'selector-observer'
import tippy from 'tippy'

observe('.btn', {
  initialize(el) {
    tippy(el)
  }
})
```

### Event Delegation vs Direct Binding

There are two established patterns for attaching event handlers to elements: direct binding and event delegation.

Direct binding simply means calling `addEventListener` directly on an element instance. The downside of this is they you need to first find the element to attach the event handler. Often this is done on page load. However, this misses elements that may be added dynamically after the page loads.

Event delegation is a technique where event handlers are registered to a CSS selector and are matched against all triggered events. The advantage is that it matches elements that are dynamically added and removed from the page. There's also less performance overhead to registering event handlers as you don't need to query the DOM upfront.

However, there are cases where event delegation doesn't work or there may be a significant performance overhead to doing so. `selector-observer` can be used with direct binding to discover elements on page load and those dynamically added later.

Here's an example of using the [delegated-events](https://github.com/dgraham/delegated-events) library to install a click handler

```javascript
import {on} from 'delegated-events'

function handleClick(event) {
  console.log('clicked', event.currentTarget)
}

on('click', '.foo', handleClick)
```

Similarly using `selectors-observer` using direct binding.

```javascript
import {observe} from 'selector-observer'

function handleClick(event) {
  console.log('clicked', event.currentTarget)
}

observe('.foo', {
  add(el) {
    el.addEventListener('click', handleClick)
  },
  remove(el) {
    el.removeEventListener('click', handleClick)
  }
})
```

Both accomplish similar tasks. But in this example, using `delegated-events` would be preferred as there's little upfront overhead to installing the click handler. Each `selector-observer` registration adds a little bit of start up overhead.

However, not all events types will work with `delegated-events`. In order for the event to work, it must bubble. Certain event types don't bubble like `mouseenter` and `mouseleave`. In this case, use `selector-observer` and direct bind.

## Advanced Usage

## constructor matching

When using the flow type checker, elements passed to add and remove hooks will be typed as `Element`. CSS selectors could match any HTML element and even SVG elements.

```javascript
observe('.any-element', {
  add(el /*: Element */) {},
  remove(el /*: Element */) {}
})
```

If you known the target element is a specific HTML element like a `<form>`, you can specify the constructor of the element to inform the type checker.

```javascript
observe('.some-form', {
  constructor: HTMLFormElement,
  add(form /*: HTMLFormElement */) {},
  remove(form /*: HTMLFormElement */) {}
})
```

## initialize hook

While defining `add` and `remove` hooks is preferred, a third `initialize` hook exists to enable use cases where plugins or components do not provide proper teardown APIs. Where `add` will run multiple times per `Element` instance, `initialize` will only be ran once.

```javascript
import {observe} from 'selector-observer'

observe('.foo', {
  initialize(el) {
    console.log('initialize')
  }
  add(el) {
    console.log('add')
  },
  remove(el) {
    console.log('remove')
  }
})

const el = document.createElement('div')
document.body.appendChild(el) // log: initialize, add
document.body.removeChild(el) // log: remove
document.body.appendChild(el) // log: add
```

## State via initialize closure

The `initialize` hooks allows for a special return value of `{add: Function, remove: Function}` to dynamically set hooks for the given element instance. This enables private state to be captured in the initialize closure and shared between add and remove hooks.

```javascript
import {observe} from 'selector-observer'

observe('.foo', {
  initialize(el) {
    let counter = 0
    return {
      add() {
        counter++
      },
      remove() {
        counter--
      }
    }
  }
})
```

It's also useful for defining per element event handlers that can access private state inside the initialization closure.

```javascript
import {observe} from 'selector-observer'

observe('.foo', {
  initialize(el) {
    let isMouseOver = false

    function handleMouseEnter() {
      isMouseOver = true
    }

    function handleMouseLeave() {
      isMouseOver = false
    }

    return {
      add() {
        el.addEventListener('mouseenter', handleMouseEnter)
        el.addEventListener('mouseleave', handleMouseLeave)
      },
      remove() {
        el.removeEventListener('mouseenter', handleMouseEnter)
        el.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }
})
```
