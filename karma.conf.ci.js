// Karma configuration
const base = require('./karma.conf.base')

const customLaunchers = {
  sl_chrome: {
    base: 'SauceLabs',
    browserName: 'chrome'
  },
  sl_firefox: {
    base: 'SauceLabs',
    browserName: 'firefox'
  },
  sl_edge: {
    base: 'SauceLabs',
    browserName: 'MicrosoftEdge'
  },
  sl_safari: {
    base: 'SauceLabs',
    browserName: 'safari'
  },
  sl_ios_safari: {
    base: 'SauceLabs',
    deviceName: 'iPhone Simulator',
    platformName: 'iOS',
    platformVersion: '11.0',
    browserName: 'Safari',
    appiumVersion: '1.7.1'
  },
  sl_android_chrome: {
    base: 'SauceLabs',
    deviceName: 'Android Emulator',
    platformName: 'Android',
    platformVersion: '6.0',
    browserName: 'Chrome',
    appiumVersion: '1.7.1'
  }
}

module.exports = Object.assign({}, base, {
  sauceLabs: {
    testName: 'isomorphic-git'
  },
  customLaunchers: customLaunchers,
  // start these browsers
  // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
  browsers: Object.keys(customLaunchers),
  // test results reporter to use
  // possible values: 'dots', 'progress'
  // available reporters: https://npmjs.org/browse/keyword/karma-reporter
  reporters: ['dots', 'saucelabs'],
  // Continuous Integration mode
  // if true, Karma captures browsers, runs the tests and exits
  singleRun: true,
  // https://support.saucelabs.com/hc/en-us/articles/225104707-Karma-Tests-Disconnect-Particularly-When-Running-Tests-on-Safari
  browserDisconnectTimeout: 10000, // default 2000
  browserDisconnectTolerance: 1, // default 0
  captureTimeout: 4 * 60 * 1000 // default 60000
})
