var test = require('tape')
var SelectorObserver = require('../lib')

// build initial DOM
function createEntry(content) {
  var li = document.createElement('li')
    , a  = document.createElement('a')
  a.innerHTML = content
  li.appendChild(a)
  return li
}

function prepare(content) {
  var ul = document.createElement('ul')

  ul.appendChild(createEntry(content || 'existing'))
  ul.appendChild(createEntry(content || 'existing'))

  return ul
}

test('single target', function (t) {
  t.plan(2)

  var ul = prepare()
  document.body.appendChild(ul)

  var observer = new SelectorObserver(ul, 'a', function() {
    t.equal(this.innerHTML, 'existing')
  })

  observer.observe()

  document.body.removeChild(ul)
})

test('multiple targets', function(t) {
  t.plan(4)

  var ul1 = prepare()
    , ul2 = prepare()
  document.body.appendChild(ul1)
  document.body.appendChild(ul2)

  var observer = new SelectorObserver(document.querySelectorAll('ul'), 'a', function() {
    t.equal(this.innerHTML, 'existing')
  })

  observer.observe()

  document.body.removeChild(ul1)
  document.body.removeChild(ul2)
})

test('added callback', function(t) {
  t.plan(4)

  var ul = prepare('existing')
  document.body.appendChild(ul)

  var expect = 'existing'

  var observer = new SelectorObserver(ul, 'a', function() {
    t.equal(this.innerHTML, expect)
  })

  observer.observe()

  expect = 'new'

  ul.appendChild(createEntry('new'))
  ul.appendChild(createEntry('new'))

  document.body.removeChild(ul)
})

test('mute while processing mutations', function(t) {
  t.plan(4)

  var ul = prepare('non-ninja')
  document.body.appendChild(ul)

  var observer = new SelectorObserver(ul, 'a', function() {
    t.equal(this.innerHTML, 'non-ninja')
    ul.appendChild(createEntry('ninja'))
  })

  observer.observe()

  ul.appendChild(createEntry('non-ninja'))

  document.body.removeChild(ul)

  t.ok(true)
})

test('removed callback', function(t) {
  t.plan(2)

  var ul = prepare('to be removed')
  document.body.appendChild(ul)

  var observer = new SelectorObserver(ul, 'a', function() {
  }, function() {
    t.equal(this.innerHTML, 'to be removed')
  })

  observer.observe()

  var li
  while (li = ul.querySelector('li')) {
    ul.removeChild(li)
  }

  document.body.removeChild(ul)
})

test('child selector', function(t) {
  t.plan(3)

  var ul1 = prepare('ul1')
    , ul2 = prepare('ul2')
  document.body.appendChild(ul1)

  var li = createEntry('ul1')
  li.appendChild(ul2)
  ul1.appendChild(li)

  var observer = new SelectorObserver(ul1, '> li', function() {
    t.equal(this.children[0].innerHTML, 'ul1')
  })

  observer.observe()

  document.body.removeChild(ul1)
})

test('DOM extension', function(t) {
  t.plan(2)

  var ul = prepare()
  document.body.appendChild(ul)

  ul.observeSelector('a', function() {
    t.equal(this.innerHTML, 'existing')
  })

  document.body.removeChild(ul)
})

test('unique elements', function(t) {
  t.plan(1)

  var div = document.createElement('div')

  document.body.observeSelector('.target', function() {
    t.equal(this.getAttribute('class'), 'target')
  })

  document.body.appendChild(div)

  div.innerHTML = '<div class="target"></div>'
})