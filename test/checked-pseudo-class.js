/* @flow */

import {assert, body, randomClassName, suite, test, timeout} from './utils'
import {observe} from '../lib'

suite('checked pseudo class', function() {
  test('checkbox checked property', async function() {
    const className = randomClassName()
    let addRan = false
    let removeRan = false
    const event = new Event('change', {bubbles: true})

    const input = document.createElement('input')
    input.className = className
    input.type = 'checkbox'
    body.appendChild(input)

    const observer = observe(`input.${className}:checked`, {
      add() {
        addRan = true
      },
      remove() {
        removeRan = true
      }
    })

    input.checked = true
    input.dispatchEvent(event)
    await timeout(10)
    assert.equal(addRan, true, 'add ran')
    assert.equal(removeRan, false, 'remove ran')

    input.checked = false
    input.dispatchEvent(event)
    await timeout(10)
    assert.equal(addRan, true, 'add ran')
    assert.equal(removeRan, true, 'remove ran')

    body.removeChild(input)
    observer.abort()
  })
})
