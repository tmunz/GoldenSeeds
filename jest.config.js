module.exports = {
  roots: ['./src'],
  testRegex: 'spec\\.(j|t)sx?$',
  collectCoverage : true,
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  coverageReporters: ['text-summary'],
  setupFilesAfterEnv: ['./src/stage/drawer/voronoi/TestUtils.ts'],
};
