/* @flow */

import {assert, body, randomClassName, suite, test, timeout} from './utils'
import {observe} from '../lib'

suite('add/remove', function() {
  test('once', async function() {
    const className = randomClassName()
    let addRan = false
    let removeRan = false

    const observer = observe(`.${className}`, {
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

    observer.abort()
  })

  test('multiple', async function() {
    const className = randomClassName()
    let addRan = 0
    let removeRan = 0

    const observer = observe(`.${className}`, {
      add() {
        addRan++
      },
      remove() {
        removeRan++
      }
    })

    const el = document.createElement('div')
    el.className = className

    let times = 1
    while (times < 4) {
      body.appendChild(el)
      await timeout(10)
      assert.equal(addRan, times, 'initialize ran')
      assert.equal(removeRan, times - 1, 'initialize ran')

      body.removeChild(el)
      await timeout(10)
      assert.equal(removeRan, times, 'initialize ran')

      times++
    }

    observer.abort()
  })
})
