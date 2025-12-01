// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Learn more: https://github.com/testing-library/jest-dom

// Set up environment variables for testing
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing-32characters";
process.env.SESSION_SECRET = "test-session-secret-key-for-testing-32chars";
