import { ObjectId } from "mongodb";
import { z } from "zod";

export interface DocumentDocument {
  _id?: ObjectId;
  title: string;
  fileId: ObjectId; // GridFS file ID
  filename: string; // Original filename
  mimetype: string;
  size: number;
  metadata: Record<string, any>;
  creatorId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentResponse {
  id: string;
  title: string;
  filename: string;
  mimetype: string;
  size: number;
  metadata: Record<string, any>;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const documentMetadataSchema = z.object({
  title: z.string().min(1, "Title is required").max(255).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const documentUploadSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  metadata: z.record(z.string(), z.any()).optional(),
});

export function toDocumentResponse(doc: DocumentDocument): DocumentResponse {
  return {
    id: doc._id?.toString() || "",
    title: doc.title,
    filename: doc.filename,
    mimetype: doc.mimetype,
    size: doc.size,
    metadata: doc.metadata || {},
    creatorId: doc.creatorId.toString(),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export type DocumentMetadataInput = z.infer<typeof documentMetadataSchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
