import { describe, expect, test } from "@jest/globals";
import { ObjectId } from "mongodb";
import {
  ChatDocument,
  ChatMessage,
  chatMessageSchema,
  createChatSchema,
  toChatResponse,
} from "../Chat";

describe("Chat Model", () => {
  describe("chatMessageSchema", () => {
    test("should accept valid user message", () => {
      const validMessage = {
        role: "user",
        content: "What is this document about?",
      };

      const result = chatMessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });

    test("should accept valid assistant message", () => {
      const validMessage = {
        role: "assistant",
        content: "This document is about...",
      };

      const result = chatMessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });

    test("should accept valid system message", () => {
      const validMessage = {
        role: "system",
        content: "You are a helpful assistant analyzing documents.",
      };

      const result = chatMessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });

    test("should reject message with invalid role", () => {
      const invalidMessage = {
        role: "invalid-role",
        content: "Some content",
      };

      const result = chatMessageSchema.safeParse(invalidMessage);
      expect(result.success).toBe(false);
    });

    test("should reject message with empty content", () => {
      const invalidMessage = {
        role: "user",
        content: "",
      };

      const result = chatMessageSchema.safeParse(invalidMessage);
      expect(result.success).toBe(false);
    });

    test("should reject message without content", () => {
      const invalidMessage = {
        role: "user",
      };

      const result = chatMessageSchema.safeParse(invalidMessage);
      expect(result.success).toBe(false);
    });

    test("should accept message with long content", () => {
      const longContent = "A".repeat(10000);
      const validMessage = {
        role: "user",
        content: longContent,
      };

      const result = chatMessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });

    test("should accept message with special characters", () => {
      const validMessage = {
        role: "user",
        content: "What about émojis 🎉 and spëcial çharacters?",
      };

      const result = chatMessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });

    test("should accept message with line breaks", () => {
      const validMessage = {
        role: "user",
        content: "First line\nSecond line\nThird line",
      };

      const result = chatMessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });
  });

  describe("createChatSchema", () => {
    test("should accept valid chat creation request", () => {
      const validRequest = {
        documentId: "507f1f77bcf86cd799439011",
        message: "Tell me about this document",
        chatHistory: [],
      };

      const result = createChatSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    test("should accept chat request with history", () => {
      const validRequest = {
        documentId: "507f1f77bcf86cd799439011",
        message: "And what else?",
        chatHistory: [
          { role: "user", content: "Previous question" },
          { role: "assistant", content: "Previous answer" },
        ],
      };

      const result = createChatSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.chatHistory).toHaveLength(2);
      }
    });

    test("should provide default empty array for chatHistory", () => {
      const requestWithoutHistory = {
        documentId: "507f1f77bcf86cd799439011",
        message: "First message",
      };

      const result = createChatSchema.safeParse(requestWithoutHistory);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.chatHistory).toEqual([]);
      }
    });

    test("should reject request without documentId", () => {
      const invalidRequest = {
        message: "Tell me about this document",
      };

      const result = createChatSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    test("should reject request without message", () => {
      const invalidRequest = {
        documentId: "507f1f77bcf86cd799439011",
      };

      const result = createChatSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    test("should reject request with empty message", () => {
      const invalidRequest = {
        documentId: "507f1f77bcf86cd799439011",
        message: "",
      };

      const result = createChatSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    test("should reject request with empty documentId", () => {
      const invalidRequest = {
        documentId: "",
        message: "Tell me about this document",
      };

      const result = createChatSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    test("should accept chat history with system messages", () => {
      const validRequest = {
        documentId: "507f1f77bcf86cd799439011",
        message: "Continue",
        chatHistory: [
          { role: "system", content: "System prompt" },
          { role: "user", content: "User question" },
          { role: "assistant", content: "Assistant response" },
        ],
      };

      const result = createChatSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    test("should reject chat history with invalid message roles", () => {
      const invalidRequest = {
        documentId: "507f1f77bcf86cd799439011",
        message: "Continue",
        chatHistory: [{ role: "invalid-role", content: "Some content" }],
      };

      const result = createChatSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe("toChatResponse", () => {
    test("should convert ChatDocument to ChatResponse", () => {
      const now = new Date();
      const chatDoc: ChatDocument = {
        _id: new ObjectId("507f1f77bcf86cd799439011"),
        userId: new ObjectId("507f1f77bcf86cd799439012"),
        documentId: new ObjectId("507f1f77bcf86cd799439013"),
        messages: [
          {
            role: "user",
            content: "First question",
            timestamp: now,
          },
          {
            role: "assistant",
            content: "First answer",
            timestamp: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      const response = toChatResponse(chatDoc);

      expect(response.id).toBe("507f1f77bcf86cd799439011");
      expect(response.userId).toBe("507f1f77bcf86cd799439012");
      expect(response.documentId).toBe("507f1f77bcf86cd799439013");
      expect(response.messages).toHaveLength(2);
      expect(response.createdAt).toBe(now.toISOString());
      expect(response.updatedAt).toBe(now.toISOString());
    });

    test("should convert message timestamps to ISO strings", () => {
      const now = new Date();
      const chatDoc: ChatDocument = {
        _id: new ObjectId(),
        userId: new ObjectId(),
        documentId: new ObjectId(),
        messages: [
          {
            role: "user",
            content: "Question",
            timestamp: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      const response = toChatResponse(chatDoc);

      expect(response.messages[0].timestamp).toBe(now.toISOString());
      expect(typeof response.messages[0].timestamp).toBe("string");
    });

    test("should handle empty messages array", () => {
      const now = new Date();
      const chatDoc: ChatDocument = {
        _id: new ObjectId(),
        userId: new ObjectId(),
        documentId: new ObjectId(),
        messages: [],
        createdAt: now,
        updatedAt: now,
      };

      const response = toChatResponse(chatDoc);

      expect(response.messages).toEqual([]);
      expect(response.messages).toHaveLength(0);
    });

    test("should convert multiple messages correctly", () => {
      const now = new Date();
      const messages: ChatMessage[] = [
        { role: "user", content: "Q1", timestamp: now },
        { role: "assistant", content: "A1", timestamp: now },
        { role: "user", content: "Q2", timestamp: now },
        { role: "assistant", content: "A2", timestamp: now },
        { role: "user", content: "Q3", timestamp: now },
        { role: "assistant", content: "A3", timestamp: now },
      ];

      const chatDoc: ChatDocument = {
        _id: new ObjectId(),
        userId: new ObjectId(),
        documentId: new ObjectId(),
        messages,
        createdAt: now,
        updatedAt: now,
      };

      const response = toChatResponse(chatDoc);

      expect(response.messages).toHaveLength(6);
      expect(response.messages[0].role).toBe("user");
      expect(response.messages[1].role).toBe("assistant");
    });

    test("should preserve message content and role", () => {
      const now = new Date();
      const chatDoc: ChatDocument = {
        _id: new ObjectId(),
        userId: new ObjectId(),
        documentId: new ObjectId(),
        messages: [
          {
            role: "user",
            content: "What is the capital of France?",
            timestamp: now,
          },
          {
            role: "assistant",
            content: "The capital of France is Paris.",
            timestamp: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      const response = toChatResponse(chatDoc);

      expect(response.messages[0].role).toBe("user");
      expect(response.messages[0].content).toBe(
        "What is the capital of France?",
      );
      expect(response.messages[1].role).toBe("assistant");
      expect(response.messages[1].content).toBe(
        "The capital of France is Paris.",
      );
    });

    test("should handle special characters in message content", () => {
      const now = new Date();
      const specialContent =
        "Hello! 👋 This has émojis & special characters: <>&\"'";

      const chatDoc: ChatDocument = {
        _id: new ObjectId(),
        userId: new ObjectId(),
        documentId: new ObjectId(),
        messages: [
          {
            role: "user",
            content: specialContent,
            timestamp: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      const response = toChatResponse(chatDoc);

      expect(response.messages[0].content).toBe(specialContent);
    });

    test("should handle system messages", () => {
      const now = new Date();
      const chatDoc: ChatDocument = {
        _id: new ObjectId(),
        userId: new ObjectId(),
        documentId: new ObjectId(),
        messages: [
          {
            role: "system",
            content: "You are analyzing document XYZ",
            timestamp: now,
          },
          {
            role: "user",
            content: "Tell me about it",
            timestamp: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      const response = toChatResponse(chatDoc);

      expect(response.messages[0].role).toBe("system");
      expect(response.messages[0].content).toBe(
        "You are analyzing document XYZ",
      );
    });
  });

  describe("ChatDocument Structure", () => {
    test("should have correct structure for new chat", () => {
      const now = new Date();
      const newChat: ChatDocument = {
        _id: new ObjectId(),
        userId: new ObjectId(),
        documentId: new ObjectId(),
        messages: [],
        createdAt: now,
        updatedAt: now,
      };

      expect(newChat._id).toBeInstanceOf(ObjectId);
      expect(newChat.userId).toBeInstanceOf(ObjectId);
      expect(newChat.documentId).toBeInstanceOf(ObjectId);
      expect(Array.isArray(newChat.messages)).toBe(true);
      expect(newChat.createdAt).toBeInstanceOf(Date);
      expect(newChat.updatedAt).toBeInstanceOf(Date);
    });

    test("should allow chat without _id (before insertion)", () => {
      const now = new Date();
      const newChat: ChatDocument = {
        userId: new ObjectId(),
        documentId: new ObjectId(),
        messages: [],
        createdAt: now,
        updatedAt: now,
      };

      expect(newChat._id).toBeUndefined();
      expect(newChat.userId).toBeDefined();
    });
  });
});
