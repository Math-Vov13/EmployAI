import { describe, test, expect, beforeAll, beforeEach, afterEach } from "@jest/globals";
import {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  TokenPayload,
} from "../token";

// Set JWT_SECRET for testing
process.env.JWT_SECRET = "test-secret-key-for-jwt-token-testing-32chars";

// Mock console.error to suppress expected error logs during tests
let consoleErrorSpy: jest.SpyInstance;

describe("Token Utilities", () => {
  beforeEach(() => {
    // Suppress console.error for tests that expect errors
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    consoleErrorSpy.mockRestore();
  });
  describe("generateToken", () => {
    test("should generate a valid JWT token", () => {
      const payload: TokenPayload = {
        userId: "user123",
        email: "test@example.com",
        role: "USER",
      };

      const token = generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3); // JWT has 3 parts
    });

    test("should generate different tokens for different users", () => {
      const payload1: TokenPayload = {
        userId: "user123",
        email: "test1@example.com",
        role: "USER",
      };

      const payload2: TokenPayload = {
        userId: "user456",
        email: "test2@example.com",
        role: "ADMIN",
      };

      const token1 = generateToken(payload1);
      const token2 = generateToken(payload2);

      expect(token1).not.toBe(token2);
    });

    test("should include role information in token", () => {
      const adminPayload: TokenPayload = {
        userId: "admin123",
        email: "admin@example.com",
        role: "ADMIN",
      };

      const token = generateToken(adminPayload);
      const verified = verifyToken(token);

      expect(verified).not.toBeNull();
      expect(verified?.role).toBe("ADMIN");
    });
  });

  describe("verifyToken", () => {
    test("should verify and decode a valid token", () => {
      const payload: TokenPayload = {
        userId: "user123",
        email: "test@example.com",
        role: "USER",
      };

      const token = generateToken(payload);
      const verified = verifyToken(token);

      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(payload.userId);
      expect(verified?.email).toBe(payload.email);
      expect(verified?.role).toBe(payload.role);
    });

    test("should return null for invalid token", () => {
      const invalidToken = "invalid.token.here";
      const verified = verifyToken(invalidToken);

      expect(verified).toBeNull();
    });

    test("should return null for malformed token", () => {
      const malformedToken = "not-a-jwt-token-at-all";
      const verified = verifyToken(malformedToken);

      expect(verified).toBeNull();
    });

    test("should return null for empty token", () => {
      const verified = verifyToken("");

      expect(verified).toBeNull();
    });

    test("should verify admin role correctly", () => {
      const adminPayload: TokenPayload = {
        userId: "admin123",
        email: "admin@example.com",
        role: "ADMIN",
      };

      const token = generateToken(adminPayload);
      const verified = verifyToken(token);

      expect(verified).not.toBeNull();
      expect(verified?.role).toBe("ADMIN");
    });

    test("should verify user role correctly", () => {
      const userPayload: TokenPayload = {
        userId: "user123",
        email: "user@example.com",
        role: "USER",
      };

      const token = generateToken(userPayload);
      const verified = verifyToken(token);

      expect(verified).not.toBeNull();
      expect(verified?.role).toBe("USER");
    });
  });

  describe("extractTokenFromHeader", () => {
    test("should extract token from valid Bearer header", () => {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token";
      const authHeader = `Bearer ${token}`;

      const extracted = extractTokenFromHeader(authHeader);

      expect(extracted).toBe(token);
    });

    test("should return null for header without Bearer prefix", () => {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token";
      const authHeader = token; // Missing "Bearer " prefix

      const extracted = extractTokenFromHeader(authHeader);

      expect(extracted).toBeNull();
    });

    test("should return null for null header", () => {
      const extracted = extractTokenFromHeader(null);

      expect(extracted).toBeNull();
    });

    test("should return null for empty string header", () => {
      const extracted = extractTokenFromHeader("");

      expect(extracted).toBeNull();
    });

    test("should return null for header with incorrect case", () => {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token";
      const authHeader = `bearer ${token}`; // lowercase 'bearer'

      const extracted = extractTokenFromHeader(authHeader);

      expect(extracted).toBeNull();
    });

    test("should handle token with spaces correctly", () => {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token";
      const authHeader = `Bearer  ${token}`; // Extra space

      const extracted = extractTokenFromHeader(authHeader);

      // Should still extract but with the extra space
      expect(extracted).toBeTruthy();
    });

    test("should return null for 'Bearer' without token", () => {
      const authHeader = "Bearer ";

      const extracted = extractTokenFromHeader(authHeader);

      expect(extracted).toBe("");
    });
  });

  describe("Token Integration Tests", () => {
    test("should create and verify token end-to-end", () => {
      const originalPayload: TokenPayload = {
        userId: "integration-test-user",
        email: "integration@example.com",
        role: "USER",
      };

      // Generate token
      const token = generateToken(originalPayload);
      expect(token).toBeDefined();

      // Simulate Authorization header
      const authHeader = `Bearer ${token}`;
      const extractedToken = extractTokenFromHeader(authHeader);
      expect(extractedToken).toBe(token);

      // Verify token
      const verifiedPayload = verifyToken(extractedToken!);
      expect(verifiedPayload).not.toBeNull();
      expect(verifiedPayload?.userId).toBe(originalPayload.userId);
      expect(verifiedPayload?.email).toBe(originalPayload.email);
      expect(verifiedPayload?.role).toBe(originalPayload.role);
    });

    test("should handle full authentication flow for admin", () => {
      const adminPayload: TokenPayload = {
        userId: "admin-integration-test",
        email: "admin-integration@example.com",
        role: "ADMIN",
      };

      const token = generateToken(adminPayload);
      const authHeader = `Bearer ${token}`;
      const extractedToken = extractTokenFromHeader(authHeader);
      const verified = verifyToken(extractedToken!);

      expect(verified).not.toBeNull();
      expect(verified?.role).toBe("ADMIN");
    });

    test("should reject tampered token", () => {
      const payload: TokenPayload = {
        userId: "user123",
        email: "test@example.com",
        role: "USER",
      };

      const token = generateToken(payload);

      // Tamper with the token by changing a character
      const tamperedToken = token.slice(0, -5) + "XXXXX";
      const verified = verifyToken(tamperedToken);

      expect(verified).toBeNull();
    });
  });

  describe("Token Payload Validation", () => {
    test("should handle special characters in email", () => {
      const payload: TokenPayload = {
        userId: "user123",
        email: "test+special@example.com",
        role: "USER",
      };

      const token = generateToken(payload);
      const verified = verifyToken(token);

      expect(verified).not.toBeNull();
      expect(verified?.email).toBe(payload.email);
    });

    test("should handle long userId", () => {
      const payload: TokenPayload = {
        userId: "507f1f77bcf86cd799439011", // MongoDB ObjectId format
        email: "test@example.com",
        role: "USER",
      };

      const token = generateToken(payload);
      const verified = verifyToken(token);

      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(payload.userId);
    });

    test("should preserve all payload fields", () => {
      const payload: TokenPayload = {
        userId: "user123",
        email: "test@example.com",
        role: "ADMIN",
      };

      const token = generateToken(payload);
      const verified = verifyToken(token);

      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(payload.userId);
      expect(verified?.email).toBe(payload.email);
      expect(verified?.role).toBe(payload.role);
    });
  });
});
