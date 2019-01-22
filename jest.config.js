module.exports = {
  preset: 'jest-preset-angular',
  roots: ['src'],
  setupTestFrameworkScriptFile: '<rootDir>/src/setupJest.ts',
  transformIgnorePatterns: ['/node_modules'],
  moduleNameMapper: {
    '@app/(.*)': '<rootDir>/src/app/$1',
  },
};
