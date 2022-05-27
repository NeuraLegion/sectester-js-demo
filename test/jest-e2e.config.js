/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: '../jest.config.js',
  testRegex: '.*spec.ts$',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/../tsconfig.json'
    }
  },
  globalSetup: '<rootDir>/global-setup.js',
  globalTeardown: '<rootDir>/global-teardown.js'
};
