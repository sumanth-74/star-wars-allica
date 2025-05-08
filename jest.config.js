module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}", // Include all source files
    "!src/**/*.d.ts",          // Exclude type declaration files
    "!src/index.js",           // Exclude entry point
    "!src/reportWebVitals.js", // Exclude reportWebVitals
    "!src/setupTests.js",      // Exclude setupTests
  ],
  coverageDirectory: "coverage", // Output directory for coverage reports
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
};