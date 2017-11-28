import babel from 'rollup-plugin-babel'

export default {
  input: 'lib/index.js',
  name: 'SelectorObserver',
  output: {
    file: 'dist/index.umd.js',
    format: 'umd',
    globals: {
      'selector-set': 'SelectorSet'
    }
  },
  external: 'selector-set',
  plugins: [babel()]
}
