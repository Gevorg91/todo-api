module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/test/**/*.test.js'],
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['**/*.js', '!**/node_modules/**', '!**/coverage/**', '!**/test/**'],
    coverageThreshold: {
        global: {
            statements: 95,
            branches: 95,
            functions: 95,
            lines: 95,
        },
    },
};
