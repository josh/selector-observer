/* @flow */

export const suite = window.suite
export const test = window.test
export const assert = window.chai.assert
export const invariant = () => undefined

const documentBody = document.body
invariant(documentBody)
export const body = documentBody

export const timeout /*: (number) => Promise<void> */ = ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms)
  })

export const randomClassName = () =>
  `_${Math.random()
    .toString(36)
    .slice(2)}`
