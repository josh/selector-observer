export function whenReady(document, callback) {
  const readyState = document.readyState
  if (readyState === 'interactive' || readyState === 'complete') {
    callback()
  } else {
    document.addEventListener('DOMContentLoaded', callback)
  }
}
