import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getCurrentUser } from "@/app/lib/auth/middleware";
import { getDocumentsCollection } from "@/app/lib/db/mongodb";
import {
  documentMetadataSchema,
  toDocumentResponse,
} from "@/app/lib/db/models/Document";
import { ObjectId } from "mongodb";
import { deleteFileFromS3 } from "@/app/lib/storage/s3-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized - login required" },
        { status: 401 },
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid document ID" },
        { status: 400 },
      );
    }

    const documentsCollection = await getDocumentsCollection();
    const document = await documentsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    const isOwner = document.creatorId.toString() === currentUser.userId;
    const isAdmin = currentUser.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - You do not have access to this document" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        document: toDocumentResponse(document),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const adminCheck = await requireAdmin(request);
    if (adminCheck) {
      return adminCheck;
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid document ID" },
        { status: 400 },
      );
    }

    const body = await request.json();

    const validationResult = documentMetadataSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.issues },
        { status: 400 },
      );
    }

    const documentsCollection = await getDocumentsCollection();

    const existingDocument = await documentsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (validationResult.data.title) {
      updateData.title = validationResult.data.title;
    }

    if (validationResult.data.metadata) {
      updateData.metadata = {
        ...existingDocument.metadata,
        ...validationResult.data.metadata,
      };
    }

    const updateResult = await documentsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" },
    );

    if (!updateResult) {
      return NextResponse.json(
        { error: "Failed to update document" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Document updated successfully",
        document: toDocumentResponse(updateResult),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const adminCheck = await requireAdmin(request);
    if (adminCheck) {
      return adminCheck;
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid document ID" },
        { status: 400 },
      );
    }

    const documentsCollection = await getDocumentsCollection();

    // recup clé s3
    const document = await documentsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    // del s3
    const s3DeleteSuccess = await deleteFileFromS3(document.s3Key);

    if (!s3DeleteSuccess) {
      console.error(`Failed to delete file from S3: ${document.s3Key}`);
    }
    // del mongo
    const deleteResult = await documentsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: "Failed to delete document" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Document deleted successfully",
        deletedId: id,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
