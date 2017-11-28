import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  input: 'test/index.js',
  output: {
    file: 'dist/index.test.js',
    format: 'iife'
  },
  plugins: [babel(), nodeResolve(), commonjs()]
}
