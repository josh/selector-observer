/* eslint-env mocha */
import {assert} from 'chai'
import {observe} from '../selector-observer'

test('simple', function(done) {
  let addedRan = false
  let removeRan = false

  const observer = observe('.foo', {
    add() {
      addedRan = true
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
    assert.equal(addedRan, true)
    assert.equal(removeRan, true)
    observer.stop()
    done()
  }, 10)
})
