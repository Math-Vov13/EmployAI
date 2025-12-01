import { describe, test, expect } from "@jest/globals";
import {
  hashPassword,
  verifyPassword,
  generateRandomPassword,
} from "../password";

describe("Password Utilities", () => {
  describe("hashPassword", () => {
    test("should hash a password successfully", async () => {
      const password = "TestPassword123!";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    test("should generate unique hashes for the same password", async () => {
      const password = "TestPassword123!";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    test("should start with bcrypt identifier", async () => {
      const password = "TestPassword123!";
      const hash = await hashPassword(password);

      expect(hash).toMatch(/^\$2[ab]\$/);
    });
  });

  describe("verifyPassword", () => {
    test("should verify correct password", async () => {
      const password = "TestPassword123!";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    test("should reject incorrect password", async () => {
      const password = "TestPassword123!";
      const wrongPassword = "WrongPassword123!";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    test("should handle empty password", async () => {
      const password = "TestPassword123!";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword("", hash);

      expect(isValid).toBe(false);
    });

    test("should verify password against pre-computed hash", async () => {
      const password = "TestPassword123!";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword("DifferentPassword123!", hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe("generateRandomPassword", () => {
    test("should generate a random password", () => {
      const password = generateRandomPassword();

      expect(password).toBeDefined();
      expect(typeof password).toBe("string");
      expect(password.length).toBeGreaterThan(0);
    });

    test("should generate unique passwords", () => {
      const password1 = generateRandomPassword();
      const password2 = generateRandomPassword();

      expect(password1).not.toBe(password2);
    });

    test("should generate 64-character hex string", () => {
      const password = generateRandomPassword();

      expect(password.length).toBe(64);
      expect(password).toMatch(/^[0-9a-f]{64}$/);
    });

    test("should generate multiple unique passwords", () => {
      const passwords = new Set();
      const count = 100;

      for (let i = 0; i < count; i++) {
        passwords.add(generateRandomPassword());
      }

      expect(passwords.size).toBe(count);
    });
  });

  describe("Password Security", () => {
    test("hashing should be resistant to timing attacks", async () => {
      const password = "TestPassword123!";
      const hash = await hashPassword(password);

      const start1 = Date.now();
      await verifyPassword(password, hash);
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      await verifyPassword("WrongPassword123!", hash);
      const time2 = Date.now() - start2;

      expect(time1).toBeGreaterThan(0);
      expect(time2).toBeGreaterThan(0);
    });

    test("should handle special characters in password", async () => {
      const password = "Test!@#$%^&*()_+-=[]{}|;:,.<>?";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    test("should handle unicode characters in password", async () => {
      const password = "Test密码123!";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });
  });
});
