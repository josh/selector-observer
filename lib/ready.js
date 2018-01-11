import {scheduleMacroTask} from './tasks'

export function whenReady(document, callback) {
  const readyState = document.readyState
  if (readyState === 'interactive' || readyState === 'complete') {
    scheduleMacroTask(document, callback)
  } else {
    document.addEventListener('DOMContentLoaded', scheduleMacroTask(document, callback))
  }
}
