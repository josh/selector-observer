import babel from 'rollup-plugin-babel'

export default {
  input: 'selector-observer.js',
  output: {
    file: 'dist/index.esm.js',
    format: 'es'
  },
  external: 'selector-set',
  plugins: [babel()]
}
