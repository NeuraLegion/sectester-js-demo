/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
        isolatedModules: true
      }
    ]
  },
  maxWorkers: '25%',
  coverageDirectory: '<rootDir>/coverage'
};