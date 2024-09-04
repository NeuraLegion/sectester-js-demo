/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  preset: '../jest.config.mjs',
  testRegex: '.*spec.ts$',
  transform: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/../tsconfig.json',
        isolatedModules: true
      }
    ]
  },
  globalSetup: '<rootDir>/global-setup.ts',
  globalTeardown: '<rootDir>/global-teardown.ts'
};
