import { ObjectId } from "mongodb";
import { z } from "zod";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface ChatDocument {
  _id?: ObjectId;
  userId: ObjectId;
  documentId: ObjectId;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1, "Message content is required"),
});

export const createChatSchema = z.object({
  documentId: z.string().min(1, "Document ID is required"),
  message: z.string().min(1, "Message is required"),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      }),
    )
    .optional()
    .default([]),
});

export interface ChatResponse {
  id: string;
  userId: string;
  documentId: string;
  messages: {
    role: string;
    content: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export function toChatResponse(chat: ChatDocument): ChatResponse {
  return {
    id: chat._id!.toString(),
    userId: chat.userId.toString(),
    documentId: chat.documentId.toString(),
    messages: chat.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
    })),
    createdAt: chat.createdAt.toISOString(),
    updatedAt: chat.updatedAt.toISOString(),
  };
}
