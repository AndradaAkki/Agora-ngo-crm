module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: ['graphql/schema.js'],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
    },
  },
};
