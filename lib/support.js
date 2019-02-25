let innerHTMLReplacementIsBuggy = null

// In IE 9/10/11 replacing child via innerHTML will orphan all of the child
// elements. This prevents walking the descendants of removedNodes.
// https://connect.microsoft.com/IE/feedback/details/797844/ie9-10-11-dom-child-kill-bug
export function detectInnerHTMLReplacementBuggy(document) {
  if (innerHTMLReplacementIsBuggy === null) {
    const a = document.createElement('div')
    const b = document.createElement('div')
    const c = document.createElement('div')
    a.appendChild(b)
    b.appendChild(c)
    a.innerHTML = ''
    innerHTMLReplacementIsBuggy = c.parentNode !== b
  }
  return innerHTMLReplacementIsBuggy
}

export function supportsSelectorMatching(node) {
  return (
    'matches' in node ||
    'webkitMatchesSelector ' in node ||
    'mozMatchesSelector' in node ||
    'oMatchesSelector' in node ||
    'msMatchesSelector' in node
  )
}
