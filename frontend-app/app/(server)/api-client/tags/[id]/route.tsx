import { requireAdmin } from "@/app/lib/auth/middleware";
import { tagUpdateSchema, toTagResponse } from "@/app/lib/db/models/Tag";
import { getTagsCollection } from "@/app/lib/db/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

// PUT /api-client/tags/[id] - Update a tag (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck) {
      return adminCheck;
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid tag ID" }, { status: 400 });
    }

    const body = await request.json();

    const validationResult = tagUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const tagsCollection = await getTagsCollection();

    const existingTag = await tagsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!existingTag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (validationResult.data.name !== undefined) {
      updateData.name = validationResult.data.name;
    }

    if (validationResult.data.description !== undefined) {
      updateData.description = validationResult.data.description;
    }

    if (validationResult.data.color !== undefined) {
      updateData.color = validationResult.data.color;
    }

    const updateResult = await tagsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" },
    );

    if (!updateResult) {
      return NextResponse.json(
        { error: "Failed to update tag" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Tag updated successfully",
        tag: toTagResponse(updateResult),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating tag:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api-client/tags/[id] - Delete a tag (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck) {
      return adminCheck;
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid tag ID" }, { status: 400 });
    }

    const tagsCollection = await getTagsCollection();

    const tag = await tagsCollection.findOne({ _id: new ObjectId(id) });

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    const deleteResult = await tagsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: "Failed to delete tag" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Tag deleted successfully",
        deletedId: id,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
