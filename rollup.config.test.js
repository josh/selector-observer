import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  input: 'test/test.js',
  output: {
    file: 'dist/index.test.js',
    format: 'iife'
  },
  plugins: [
    nodeResolve(),
    commonjs({
      namedExports: {
        './node_modules/chai/index.js': ['assert']
      }
    })
  ]
}
