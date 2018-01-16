import babel from 'rollup-plugin-babel'

export default {
  input: 'lib/index.js',
  output: {
    file: 'dist/index.umd.js',
    format: 'umd',
    name: 'SelectorObserver',
    globals: {
      'selector-set': 'SelectorSet'
    }
  },
  external: 'selector-set',
  plugins: [babel()]
}
