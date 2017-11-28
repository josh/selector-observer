/* eslint-env mocha */
import {observe} from '../selector-observer'

/* global chai */
const {assert} = chai

test('simple', done => {
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

  document.body.appendChild(foo)
  document.body.removeChild(foo)

  setTimeout(() => {
    assert.equal(addRan, true, 'add ran')
    assert.equal(removeRan, true, 'remove ran')
    observer.stop()
    done()
  }, 10)
})
