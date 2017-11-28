/* @flow */

import {assert, body, randomClassName, suite, test, timeout} from './utils'
import {observe} from '../lib'

suite('constructor', function() {
  test('match', async function() {
    const className = randomClassName()
    let addRan = false
    let removeRan = false

    const observer = observe({
      selector: `.${className}`,
      constructor: HTMLDivElement,
      add() {
        addRan = true
      },
      remove() {
        removeRan = true
      }
    })

    const el = document.createElement('div')
    el.className = className

    body.appendChild(el)
    await timeout(10)
    assert.equal(addRan, true, 'add ran')
    assert.equal(removeRan, false, 'remove ran')

    body.removeChild(el)
    await timeout(10)
    assert.equal(addRan, true, 'add ran')
    assert.equal(removeRan, true, 'remove ran')

    observer.stop()
  })

  test('mismatch', async function() {
    const className = randomClassName()
    let addRan = false
    let removeRan = false

    const observer = observe({
      selector: `.${className}`,
      constructor: HTMLDivElement,
      add() {
        addRan = true
      },
      remove() {
        removeRan = true
      }
    })

    const el = document.createElement('span')
    el.className = className

    body.appendChild(el)
    body.removeChild(el)

    await timeout(10)

    assert.equal(addRan, false, 'add ran')
    assert.equal(removeRan, false, 'remove ran')

    observer.stop()
  })
})
