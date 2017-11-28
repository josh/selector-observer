/* @flow */

export const test = window.test
export const assert = window.chai.assert
export const invariant = () => undefined

export const timeout /*: (number) => Promise<void> */ = ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms)
  })
