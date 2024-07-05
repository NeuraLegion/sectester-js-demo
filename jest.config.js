const { compilerOptions } = require('./tsconfig');

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
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
