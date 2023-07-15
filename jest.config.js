/** @type {import('ts-jest').JestConfigWithTsJest} */
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': 'jest-esbuild',
  },
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/src/util/jest_css_placeholder.tsx',
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/src" })
  },
};