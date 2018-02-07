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

## Event Delegation vs Direct Binding
