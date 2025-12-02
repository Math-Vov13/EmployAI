import { describe, expect, test } from "@jest/globals";
import { ObjectId } from "mongodb";
import {
  passwordSchema,
  toUserResponse,
  UserDocument,
  userLoginSchema,
  userRegistrationSchema,
} from "../User";

describe("User Model", () => {
  describe("passwordSchema", () => {
    test("should accept valid password", () => {
      const validPasswords = [
        "ValidPassword123!",
        "Str0ng!Pass@2024",
        "MyP@ssw0rd2024",
        "Abcd1234!@#$",
      ];

      validPasswords.forEach((password) => {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(true);
      });
    });

    test("should reject password shorter than 12 characters", () => {
      const shortPassword = "Short1!";
      const result = passwordSchema.safeParse(shortPassword);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "le MDP doit au moins contenir 12 caractères.",
        );
      }
    });

    test("should reject password without uppercase letter", () => {
      const password = "lowercase123!";
      const result = passwordSchema.safeParse(password);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Le mot de passe doit avoir au moins une MAJUSCULE :)",
        );
      }
    });

    test("should reject password without lowercase letter", () => {
      const password = "UPPERCASE123!";
      const result = passwordSchema.safeParse(password);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Le mot de passe doit avoir au moins une minuscule... c:",
        );
      }
    });

    test("should reject password without number", () => {
      const password = "NoNumbersHere!";
      const result = passwordSchema.safeParse(password);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Le mot de passe doit avoir au moins un chiffre... 0-9",
        );
      }
    });

    test("should reject password without special character", () => {
      const password = "NoSpecialChar123";
      const result = passwordSchema.safeParse(password);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Le mot de passe doit contenir au moins un caractère spécial.",
        );
      }
    });

    test("should accept password with exactly 12 characters", () => {
      const password = "ValidPass1!a";
      const result = passwordSchema.safeParse(password);

      expect(result.success).toBe(true);
    });
  });

  describe("userRegistrationSchema", () => {
    test("should accept valid registration data", () => {
      const validData = {
        email: "user@example.com",
        password: "ValidPassword123!",
        name: "John Doe",
      };

      const result = userRegistrationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("should reject invalid email", () => {
      const invalidData = {
        email: "invalid-email",
        password: "ValidPassword123!",
        name: "John Doe",
      };

      const result = userRegistrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Invalid email");
      }
    });

    test("should reject invalid password", () => {
      const invalidData = {
        email: "user@example.com",
        password: "weak",
        name: "John Doe",
      };

      const result = userRegistrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("should reject name shorter than 2 characters", () => {
      const invalidData = {
        email: "user@example.com",
        password: "ValidPassword123!",
        name: "J",
      };

      const result = userRegistrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "at least 2 characters",
        );
      }
    });

    test("should reject missing fields", () => {
      const incompleteData = {
        email: "user@example.com",
      };

      const result = userRegistrationSchema.safeParse(incompleteData);
      expect(result.success).toBe(false);
    });
  });

  describe("userLoginSchema", () => {
    test("should accept valid login data", () => {
      const validData = {
        email: "user@example.com",
        password: "anypassword",
      };

      const result = userLoginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("should reject invalid email", () => {
      const invalidData = {
        email: "invalid-email",
        password: "anypassword",
      };

      const result = userLoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("should reject empty password", () => {
      const invalidData = {
        email: "user@example.com",
        password: "",
      };

      const result = userLoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("required");
      }
    });

    test("should accept any non-empty password (validation happens server-side)", () => {
      const validData = {
        email: "user@example.com",
        password: "short",
      };

      const result = userLoginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("toUserResponse", () => {
    test("should convert UserDocument to UserResponse", () => {
      const userDoc: UserDocument = {
        _id: new ObjectId("507f1f77bcf86cd799439011"),
        email: "user@example.com",
        password: "hashed_password",
        name: "John Doe",
        role: "USER",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
        lastLogin: new Date("2024-01-03"),
      };

      const response = toUserResponse(userDoc);

      expect(response.id).toBe("507f1f77bcf86cd799439011");
      expect(response.email).toBe("user@example.com");
      expect(response.name).toBe("John Doe");
      expect(response.role).toBe("USER");
      expect(response.createdAt).toEqual(new Date("2024-01-01"));
      expect(response.lastLogin).toEqual(new Date("2024-01-03"));
      expect(response).not.toHaveProperty("password");
    });

    test("should handle user with picture", () => {
      const userDoc: UserDocument = {
        _id: new ObjectId("507f1f77bcf86cd799439011"),
        email: "user@example.com",
        password: "hashed_password",
        name: "John Doe",
        role: "ADMIN",
        picture: "https://example.com/avatar.jpg",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      };

      const response = toUserResponse(userDoc);

      expect(response.picture).toBe("https://example.com/avatar.jpg");
      expect(response.role).toBe("ADMIN");
    });

    test("should handle user without lastLogin", () => {
      const userDoc: UserDocument = {
        _id: new ObjectId("507f1f77bcf86cd799439011"),
        email: "user@example.com",
        password: "hashed_password",
        name: "John Doe",
        role: "USER",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      };

      const response = toUserResponse(userDoc);

      expect(response.lastLogin).toBeUndefined();
    });

    test("should handle user without _id", () => {
      const userDoc: UserDocument = {
        email: "user@example.com",
        password: "hashed_password",
        name: "John Doe",
        role: "USER",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      };

      const response = toUserResponse(userDoc);

      expect(response.id).toBe("");
    });

    test("should never expose sensitive fields", () => {
      const userDoc: UserDocument = {
        _id: new ObjectId("507f1f77bcf86cd799439011"),
        email: "user@example.com",
        password: "super_secret_hashed_password",
        name: "John Doe",
        role: "USER",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      };

      const response = toUserResponse(userDoc);

      expect(response).not.toHaveProperty("password");
      expect(response).not.toHaveProperty("updatedAt");
      expect(JSON.stringify(response)).not.toContain("super_secret");
    });

    test("should handle Google OAuth user", () => {
      const userDoc: UserDocument = {
        _id: new ObjectId("507f1f77bcf86cd799439011"),
        email: "user@gmail.com",
        password: "hashed_random_password",
        name: "John Doe",
        role: "USER",
        googleId: "google_oauth_id_123",
        picture: "https://lh3.googleusercontent.com/a/avatar",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      };

      const response = toUserResponse(userDoc);

      expect(response.picture).toBe(
        "https://lh3.googleusercontent.com/a/avatar",
      );
      expect(response).not.toHaveProperty("googleId");
    });
  });
});
