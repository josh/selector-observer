/* eslint-env commonjs */
module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],
    client: {
      mocha: {
        ui: 'tdd'
      }
    },
    files: ['dist/index.test.js'],
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless'],
    autoWatch: false,
    // singleRun: false,
    concurrency: Infinity
  })
}
