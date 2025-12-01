import { describe, test, expect } from "@jest/globals";
import { ObjectId } from "mongodb";
import {
  documentMetadataSchema,
  documentUploadSchema,
  toDocumentResponse,
  DocumentDocument,
} from "../Document";

describe("Document Model", () => {
  describe("documentUploadSchema", () => {
    test("should accept valid upload data", () => {
      const validData = {
        title: "Employee Handbook 2024",
        metadata: {
          category: "HR",
          tags: ["handbook", "policies"],
          department: "Human Resources",
        },
      };

      const result = documentUploadSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("should accept upload data without metadata", () => {
      const validData = {
        title: "Company Policy",
      };

      const result = documentUploadSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("should accept upload data with empty metadata", () => {
      const validData = {
        title: "Document Title",
        metadata: {},
      };

      const result = documentUploadSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("should reject empty title", () => {
      const invalidData = {
        title: "",
        metadata: {},
      };

      const result = documentUploadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Title is required");
      }
    });

    test("should reject missing title", () => {
      const invalidData = {
        metadata: { category: "HR" },
      };

      const result = documentUploadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("should reject title longer than 255 characters", () => {
      const invalidData = {
        title: "a".repeat(256),
        metadata: {},
      };

      const result = documentUploadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("should accept title with exactly 255 characters", () => {
      const validData = {
        title: "a".repeat(255),
      };

      const result = documentUploadSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("should accept various metadata types", () => {
      const validData = {
        title: "Complex Document",
        metadata: {
          version: 2.5,
          isPublic: true,
          tags: ["tag1", "tag2"],
          config: { nested: { value: 123 } },
        },
      };

      const result = documentUploadSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("documentMetadataSchema", () => {
    test("should accept valid metadata update with title only", () => {
      const validData = {
        title: "Updated Title",
      };

      const result = documentMetadataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("should accept valid metadata update with metadata only", () => {
      const validData = {
        metadata: {
          category: "Finance",
          updated: true,
        },
      };

      const result = documentMetadataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("should accept valid metadata update with both title and metadata", () => {
      const validData = {
        title: "New Title",
        metadata: {
          version: 2,
          lastReviewed: "2024-01-15",
        },
      };

      const result = documentMetadataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("should accept empty object (all fields optional)", () => {
      const validData = {};

      const result = documentMetadataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("should reject empty title when provided", () => {
      const invalidData = {
        title: "",
      };

      const result = documentMetadataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Title is required");
      }
    });

    test("should reject title longer than 255 characters", () => {
      const invalidData = {
        title: "x".repeat(256),
      };

      const result = documentMetadataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("should accept title with exactly 255 characters", () => {
      const validData = {
        title: "y".repeat(255),
      };

      const result = documentMetadataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("should accept metadata with various data types", () => {
      const validData = {
        metadata: {
          string: "value",
          number: 42,
          boolean: true,
          array: [1, 2, 3],
          nested: { deep: { value: "test" } },
        },
      };

      const result = documentMetadataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("toDocumentResponse", () => {
    test("should convert DocumentDocument to DocumentResponse", () => {
      const docDocument: DocumentDocument = {
        _id: new ObjectId("507f1f77bcf86cd799439011"),
        title: "Employee Handbook",
        s3Key: "users/user123/abc123-handbook.pdf",
        s3Url:
          "https://s3.amazonaws.com/bucket/users/user123/abc123-handbook.pdf",
        mimetype: "application/pdf",
        size: 1024000,
        metadata: {
          category: "HR",
          version: 1,
        },
        creatorId: new ObjectId("507f1f77bcf86cd799439022"),
        createdAt: new Date("2024-01-01T10:00:00Z"),
        updatedAt: new Date("2024-01-02T15:30:00Z"),
      };

      const response = toDocumentResponse(docDocument);

      expect(response.id).toBe("507f1f77bcf86cd799439011");
      expect(response.title).toBe("Employee Handbook");
      expect(response.mimetype).toBe("application/pdf");
      expect(response.size).toBe(1024000);
      expect(response.metadata).toEqual({ category: "HR", version: 1 });
      expect(response.creatorId).toBe("507f1f77bcf86cd799439022");
      expect(response.createdAt).toEqual(new Date("2024-01-01T10:00:00Z"));
      expect(response.updatedAt).toEqual(new Date("2024-01-02T15:30:00Z"));
      expect(response).not.toHaveProperty("s3Key");
      expect(response).not.toHaveProperty("s3Url");
      expect(response).not.toHaveProperty("_id");
    });

    test("should handle document without metadata", () => {
      const docDocument: DocumentDocument = {
        _id: new ObjectId("507f1f77bcf86cd799439011"),
        title: "Simple Document",
        s3Key: "users/user456/xyz789-document.pdf",
        s3Url: "https://s3.amazonaws.com/bucket/document.pdf",
        mimetype: "application/pdf",
        size: 500000,
        metadata: {},
        creatorId: new ObjectId("507f1f77bcf86cd799439022"),
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      };

      const response = toDocumentResponse(docDocument);

      expect(response.metadata).toEqual({});
      expect(response.id).toBe("507f1f77bcf86cd799439011");
    });

    test("should handle document without _id", () => {
      const docDocument: DocumentDocument = {
        title: "New Document",
        s3Key: "users/user789/new-doc.pdf",
        s3Url: "https://s3.amazonaws.com/bucket/new-doc.pdf",
        mimetype: "application/pdf",
        size: 200000,
        metadata: { draft: true },
        creatorId: new ObjectId("507f1f77bcf86cd799439022"),
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      };

      const response = toDocumentResponse(docDocument);

      expect(response.id).toBe("");
    });

    test("should convert ObjectIds to strings", () => {
      const docId = new ObjectId("507f1f77bcf86cd799439011");
      const creatorId = new ObjectId("507f1f77bcf86cd799439022");

      const docDocument: DocumentDocument = {
        _id: docId,
        title: "Test Document",
        s3Key: "test-key",
        s3Url: "https://test-url",
        mimetype: "application/pdf",
        size: 100,
        metadata: {},
        creatorId: creatorId,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      };

      const response = toDocumentResponse(docDocument);

      expect(typeof response.id).toBe("string");
      expect(typeof response.creatorId).toBe("string");
      expect(response.id).toBe(docId.toString());
      expect(response.creatorId).toBe(creatorId.toString());
    });

    test("should never expose internal S3 fields", () => {
      const docDocument: DocumentDocument = {
        _id: new ObjectId("507f1f77bcf86cd799439011"),
        title: "Secure Document",
        s3Key: "secret/internal/path/document.pdf",
        s3Url: "https://internal-s3.example.com/secret-bucket/document.pdf",
        mimetype: "application/pdf",
        size: 1000000,
        metadata: { confidential: true },
        creatorId: new ObjectId("507f1f77bcf86cd799439022"),
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      };

      const response = toDocumentResponse(docDocument);

      expect(response).not.toHaveProperty("s3Key");
      expect(response).not.toHaveProperty("s3Url");
      expect(JSON.stringify(response)).not.toContain("secret/internal/path");
      expect(JSON.stringify(response)).not.toContain(
        "https://internal-s3.example.com",
      );
    });

    test("should handle various MIME types", () => {
      const mimeTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "image/png",
        "image/jpeg",
      ];

      mimeTypes.forEach((mimetype) => {
        const docDocument: DocumentDocument = {
          _id: new ObjectId(),
          title: "Test Document",
          s3Key: "test-key",
          s3Url: "https://test-url",
          mimetype: mimetype,
          size: 1000,
          metadata: {},
          creatorId: new ObjectId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const response = toDocumentResponse(docDocument);
        expect(response.mimetype).toBe(mimetype);
      });
    });

    test("should preserve complex metadata structures", () => {
      const complexMetadata = {
        category: "Engineering",
        tags: ["technical", "documentation", "api"],
        version: 3.2,
        isPublic: false,
        authors: ["John Doe", "Jane Smith"],
        reviewers: {
          primary: "Alice Johnson",
          secondary: "Bob Williams",
        },
        changelog: [
          { date: "2024-01-01", changes: "Initial version" },
          { date: "2024-01-15", changes: "Added section 3" },
        ],
      };

      const docDocument: DocumentDocument = {
        _id: new ObjectId("507f1f77bcf86cd799439011"),
        title: "API Documentation",
        s3Key: "docs/api-v3.pdf",
        s3Url: "https://s3.example.com/docs/api-v3.pdf",
        mimetype: "application/pdf",
        size: 2500000,
        metadata: complexMetadata,
        creatorId: new ObjectId("507f1f77bcf86cd799439022"),
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-15"),
      };

      const response = toDocumentResponse(docDocument);

      expect(response.metadata).toEqual(complexMetadata);
      expect(response.metadata.tags).toHaveLength(3);
      expect(response.metadata.changelog).toHaveLength(2);
      expect(response.metadata.reviewers.primary).toBe("Alice Johnson");
    });

    test("should handle large file sizes", () => {
      const largeSize = 50 * 1024 * 1024; // 50MB

      const docDocument: DocumentDocument = {
        _id: new ObjectId(),
        title: "Large Document",
        s3Key: "large-file.pdf",
        s3Url: "https://s3.example.com/large-file.pdf",
        mimetype: "application/pdf",
        size: largeSize,
        metadata: {},
        creatorId: new ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response = toDocumentResponse(docDocument);

      expect(response.size).toBe(largeSize);
    });

    test("should preserve date precision", () => {
      const createdDate = new Date("2024-01-15T08:30:45.123Z");
      const updatedDate = new Date("2024-02-20T14:22:10.987Z");

      const docDocument: DocumentDocument = {
        _id: new ObjectId(),
        title: "Time-Sensitive Document",
        s3Key: "time-doc.pdf",
        s3Url: "https://s3.example.com/time-doc.pdf",
        mimetype: "application/pdf",
        size: 1000,
        metadata: {},
        creatorId: new ObjectId(),
        createdAt: createdDate,
        updatedAt: updatedDate,
      };

      const response = toDocumentResponse(docDocument);

      expect(response.createdAt).toEqual(createdDate);
      expect(response.updatedAt).toEqual(updatedDate);
      expect(response.createdAt.getMilliseconds()).toBe(123);
      expect(response.updatedAt.getMilliseconds()).toBe(987);
    });
  });
});
