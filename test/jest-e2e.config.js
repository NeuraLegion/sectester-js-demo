/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: '../jest.config.js',
  testRegex: '.*spec.ts$',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/../tsconfig.json',
        isolatedModules: true
      }
    ]
  },
  globalSetup: '<rootDir>/global-setup.js',
  globalTeardown: '<rootDir>/global-teardown.js'
};
