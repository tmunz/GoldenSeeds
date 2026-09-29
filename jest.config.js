module.exports = {
  roots: ['./src'],
  testRegex: 'spec\\.(j|t)sx?$',
  moduleNameMapper: {
    '\\.(otf|ttf|woff|woff2|eot)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
  collectCoverage : true,
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  coverageReporters: ['text-summary'],
};
