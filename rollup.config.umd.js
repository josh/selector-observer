export default {
  input: 'selector-observer.js',
  name: 'SelectorObserver',
  output: {
    file: 'dist/index.umd.js',
    format: 'umd',
    globals: {
      'selector-set': 'SelectorSet'
    }
  },
  external: 'selector-set',
  plugins: []
}
