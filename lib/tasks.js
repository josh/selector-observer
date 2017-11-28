let el = null
let observer = null
let queue = []

export function scheduleMacroTask(document, callback) {
  if (!observer) {
    observer = new MutationObserver(handleMutations)
  }

  if (!el) {
    el = document.createElement('div')
    observer.observe(el, {attributes: true})
  }

  queue.push(callback)
  el.setAttribute('data-twiddle', `${Date.now()}`)
}

function handleMutations() {
  const callbacks = queue
  queue = []
  for (let i = 0; i < callbacks.length; i++) {
    try {
      callbacks[i]()
    } catch (error) {
      setTimeout(() => {
        throw error
      }, 0)
    }
  }
}
