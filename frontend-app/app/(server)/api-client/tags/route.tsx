import { getCurrentUser, requireAdmin } from "@/app/lib/auth/middleware";
import {
  generateSlug,
  tagCreateSchema,
  toTagResponse,
} from "@/app/lib/db/models/Tag";
import { getTagsCollection } from "@/app/lib/db/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

// GET /api-client/tags - Get all tags (available to all authenticated users)
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized - login required" },
        { status: 401 },
      );
    }

    const tagsCollection = await getTagsCollection();
    const tags = await tagsCollection.find({}).sort({ name: 1 }).toArray();

    return NextResponse.json(
      {
        success: true,
        tags: tags.map(toTagResponse),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api-client/tags - Create a new tag (admin only)
export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck) {
      return adminCheck;
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized - login required" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const validationResult = tagCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const { name, description, color } = validationResult.data;
    const slug = generateSlug(name);

    const tagsCollection = await getTagsCollection();

    // Check if tag with same slug already exists
    const existingTag = await tagsCollection.findOne({ slug });
    if (existingTag) {
      return NextResponse.json(
        { error: "A tag with this name already exists" },
        { status: 409 },
      );
    }

    const newTag = {
      name,
      slug,
      description,
      color,
      createdBy: new ObjectId(currentUser.userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await tagsCollection.insertOne(newTag);

    const createdTag = await tagsCollection.findOne({ _id: result.insertedId });
    if (!createdTag) {
      return NextResponse.json(
        { error: "Failed to create tag" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Tag created successfully",
        tag: toTagResponse(createdTag),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
