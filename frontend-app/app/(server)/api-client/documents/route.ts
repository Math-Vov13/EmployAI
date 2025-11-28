import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getCurrentUser } from "@/app/lib/auth/middleware";
import { getDocumentsCollection } from "@/app/lib/db/mongodb";
import {
  documentUploadSchema,
  toDocumentResponse,
  DocumentDocument,
} from "@/app/lib/db/models/Document";
import { ObjectId } from "mongodb";
import {
  validateFile,
  formatFileSize,
} from "@/app/lib/storage/file-validation";
import {
  generateFileKey,
  uploadFileToS3,
  validateS3Config,
} from "@/app/lib/storage/s3-client";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized - login required" },
        { status: 401 },
      );
    }

    const documentsCollection = await getDocumentsCollection();

    const filter =
      currentUser.role === "ADMIN"
        ? {}
        : { creatorId: new ObjectId(currentUser.userId) };

    const documents = await documentsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    const documentResponses = documents.map(toDocumentResponse);

    return NextResponse.json(
      {
        success: true,
        documents: documentResponses,
        count: documentResponses.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck) {
      return adminCheck;
    } // verif admin

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized - login required" },
        { status: 401 },
      );
    }

    // s3?
    const s3ConfigValidation = validateS3Config();
    if (!s3ConfigValidation.valid) {
      return NextResponse.json(
        { error: s3ConfigValidation.error || "S3 configuration error" },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;
    const metadataStr = formData.get("metadata") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const uploadData = documentUploadSchema.safeParse({
      title: title || file.name,
      metadata: metadataStr ? JSON.parse(metadataStr) : {},
    });

    if (!uploadData.success) {
      return NextResponse.json(
        { error: "Invalid input", details: uploadData.error.issues },
        { status: 400 },
      );
    }

    const fileValidation = validateFile(file.name, file.type, file.size);
    if (!fileValidation.valid) {
      return NextResponse.json(
        { error: "File validation failed", details: fileValidation.errors },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    //s3
    const fileKey = generateFileKey(currentUser.userId, file.name);
    // s3
    const uploadResult = await uploadFileToS3(fileKey, fileBuffer, file.type);

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error || "Failed to upload file" },
        { status: 500 },
      );
    }

    // mongodb
    const documentsCollection = await getDocumentsCollection();
    const now = new Date();

    const newDocument: DocumentDocument = {
      title: uploadData.data.title,
      s3Key: fileKey,
      s3Url: uploadResult.fileUrl,
      mimetype: file.type,
      size: file.size,
      metadata: uploadData.data.metadata || {},
      creatorId: new ObjectId(currentUser.userId),
      createdAt: now,
      updatedAt: now,
    };

    const insertResult = await documentsCollection.insertOne(newDocument);

    if (!insertResult.acknowledged) {
      return NextResponse.json(
        { error: "Failed to create document record" },
        { status: 500 },
      );
    }

    const createdDocument = await documentsCollection.findOne({
      _id: insertResult.insertedId,
    });

    if (!createdDocument) {
      return NextResponse.json(
        { error: "Document created but not found" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Document uploaded successfully",
        document: toDocumentResponse(createdDocument),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
