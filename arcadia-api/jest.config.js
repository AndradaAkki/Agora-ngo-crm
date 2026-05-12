module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: ['graphql/schema.js'],
  coverageThreshold: {
    global: {
      branches: 60,
      lines: 80,
      functions: 80,
    },
  },
};
