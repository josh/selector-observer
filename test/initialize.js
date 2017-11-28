/* @flow */

import {assert, body, randomClassName, suite, test, timeout} from './utils'
import {observe} from '../lib'

suite('initialize', function() {
  test('once', async function() {
    const className = randomClassName()
    let initializeRan = false

    const observer = observe(`.${className}`, {
      initialize() {
        initializeRan = true
      }
    })

    const el = document.createElement('div')
    el.className = className

    body.appendChild(el)

    await timeout(10)

    assert.equal(initializeRan, true, 'initialize ran')

    observer.stop()
  })

  test('multiple', async function() {
    const className = randomClassName()
    let initializeRan = 0

    const observer = observe(`.${className}`, {
      initialize() {
        initializeRan++
      }
    })

    const el = document.createElement('div')
    el.className = className

    let times = 5
    while (times--) {
      body.appendChild(el)
      await timeout(10)
      assert.equal(initializeRan, 1, 'initialize ran')
      body.removeChild(el)
    }

    observer.stop()
  })
})
