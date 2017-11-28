/* @flow */

import {assert, test, invariant, timeout} from './utils'
import {observe} from '../selector-observer'

const body = document.body
invariant(body)

test('simple', () => {
  let addRan = false
  let removeRan = false

  const observer = observe('.foo', {
    add() {
      addRan = true
    },
    remove() {
      removeRan = true
    }
  })

  const foo = document.createElement('div')
  foo.className = 'foo'

  body.appendChild(foo)
  body.removeChild(foo)

  return timeout(10).then(() => {
    observer.stop()
    assert.equal(addRan, true, 'add ran')
    assert.equal(removeRan, true, 'remove ran')
  })
})
