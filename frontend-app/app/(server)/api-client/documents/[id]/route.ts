import { getCurrentUser, requireAdmin } from "@/app/lib/auth/middleware";
import {
  documentMetadataSchema,
  toDocumentResponse,
} from "@/app/lib/db/models/Document";
import {
  getDocumentsCollection,
  getGridFSBucket,
  getUsersCollection,
} from "@/app/lib/db/mongodb";
import { mongoVector } from "@/mastra/vector_store";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
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

    // All authenticated users can view documents
    // No ownership or admin check needed for viewing

    // Fetch user information for uploadedBy field
    const usersCollection = await getUsersCollection();
    const creator = await usersCollection.findOne({
      _id: document.creatorId,
    });

    const documentResponse = toDocumentResponse(document);

    // Add uploadedBy information
    const enrichedDocument = {
      ...documentResponse,
      fileName: documentResponse.filename,
      fileSize: documentResponse.size,
      mimeType: documentResponse.mimetype,
      description: documentResponse.metadata?.description || "",
      status: documentResponse.metadata?.status || "PENDING",
      tags: documentResponse.metadata?.tags || [],
      uploadedBy: {
        id: creator?._id?.toString() || documentResponse.creatorId,
        email: creator?.email || "unknown@example.com",
        role: creator?.role || "USER",
      },
    };

    return NextResponse.json(
      {
        success: true,
        document: enrichedDocument,
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

    // Get document to retrieve fileId
    const document = await documentsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    // Delete file from GridFS
    const bucket = await getGridFSBucket();
    try {
      await bucket.delete(document.fileId);
    } catch (gridfsError) {
      console.error(
        `Failed to delete file from GridFS: ${document.fileId}`,
        gridfsError,
      );
      // Continue even if GridFS delete fails
    }

    // Delete document record from MongoDB
    const deleteResult = await documentsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: "Failed to delete document" },
        { status: 500 },
      );
    }

    console.log("Document deleted with id string:", document.fileId.toString());
    await mongoVector.deleteVectors({
      indexName: "embeddings",
      filter: { source_id: document.fileId.toString() },
    });

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
