import { ObjectId } from "mongodb";
import { z } from "zod";

export interface TagDocument {
  _id?: ObjectId;
  name: string; // Tag name (e.g., "Finance", "HR", "Legal")
  slug: string; // URL-friendly version (e.g., "finance", "hr", "legal")
  description?: string; // Optional description
  color?: string; // Optional color for UI display (e.g., "#3B82F6")
  createdBy: ObjectId; // Admin who created the tag
  createdAt: Date;
  updatedAt: Date;
}

export interface TagResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const tagCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name is required")
    .max(50, "Tag name must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      "Tag name can only contain letters, numbers, spaces, hyphens, and underscores",
    ),
  description: z.string().max(255).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
    .optional(),
});

export const tagUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name is required")
    .max(50, "Tag name must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      "Tag name can only contain letters, numbers, spaces, hyphens, and underscores",
    )
    .optional(),
  description: z.string().max(255).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
    .optional(),
});

export function toTagResponse(tag: TagDocument): TagResponse {
  return {
    id: tag._id?.toString() || "",
    name: tag.name,
    slug: tag.slug,
    description: tag.description,
    color: tag.color,
    createdBy: tag.createdBy.toString(),
    createdAt: tag.createdAt,
    updatedAt: tag.updatedAt,
  };
}

// Helper function to generate slug from tag name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/[^\w\-]+/g, "") // Remove non-word chars except hyphens
    .replace(/\-\-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+/, "") // Trim hyphens from start
    .replace(/-+$/, ""); // Trim hyphens from end
}

export type TagCreateInput = z.infer<typeof tagCreateSchema>;
export type TagUpdateInput = z.infer<typeof tagUpdateSchema>;
