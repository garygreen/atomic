var resolve = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');

module.exports = {
    input: 'src/atomic.js',
    output: {
      file: 'dist/atomic.js',
      name: 'atomic',
      format: 'iife'
    },
    plugins: [
      resolve(),
      commonjs()
    ]
}