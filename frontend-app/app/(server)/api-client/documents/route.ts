import { getCurrentUser, requireAuth } from "@/app/lib/auth/middleware";
import {
  DocumentDocument,
  documentUploadSchema,
  toDocumentResponse,
} from "@/app/lib/db/models/Document";
import {
  getDocumentsCollection,
  getGridFSBucket,
  getUsersCollection,
} from "@/app/lib/db/mongodb";
import { validateFile } from "@/app/lib/storage/file-validation";
import { saveDocumentPipeline } from "@/mastra/documents/docs_chunk";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

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

    // Filter logic:
    // - Admins: see all documents (any status)
    // - Regular users: see APPROVED documents + their own documents (any status)
    let filter;
    if (currentUser.role === "ADMIN") {
      filter = {};
    } else {
      filter = {
        $or: [
          { "metadata.status": "APPROVED" },
          { creatorId: new ObjectId(currentUser.userId) },
        ],
      };
    }

    const documents = await documentsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    // Fetch user information for all documents
    const usersCollection = await getUsersCollection();
    const creatorIds = [...new Set(documents.map((doc) => doc.creatorId))];
    const creators = await usersCollection
      .find({ _id: { $in: creatorIds } })
      .toArray();

    // Create a map of creatorId to user email
    const creatorMap = new Map(
      creators.map((user) => [user._id.toString(), user.email]),
    );

    // Enrich documents with creator email
    const enrichedDocuments = documents.map((doc) => {
      const docResponse = toDocumentResponse(doc);
      return {
        ...docResponse,
        uploadedBy: {
          id: doc.creatorId.toString(),
          email: creatorMap.get(doc.creatorId.toString()) || "unknown@example.com",
          role: creators.find((u) => u._id.toString() === doc.creatorId.toString())
            ?.role || "USER",
        },
      };
    });

    return NextResponse.json(
      {
        success: true,
        documents: enrichedDocuments,
        count: enrichedDocuments.length,
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
    // Allow any authenticated user to upload (not just admins)
    const authError = await requireAuth(request);
    if (authError) return authError;

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized - login required" },
        { status: 401 },
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

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Upload to GridFS
    const bucket = await getGridFSBucket();
    const uploadStream = bucket.openUploadStream(file.name, {
      metadata: {
        originalName: file.name,
        uploadedBy: currentUser.userId,
        contentType: file.type,
      },
    });

    // Write file to GridFS
    const fileId = await new Promise<ObjectId>((resolve, reject) => {
      uploadStream.on("error", reject);
      uploadStream.on("finish", () => {
        resolve(uploadStream.id as ObjectId);
      });
      uploadStream.end(fileBuffer);
    });

    // Create document record in MongoDB
    const documentsCollection = await getDocumentsCollection();
    const now = new Date();

    // Set document status based on user role
    // Admins: documents are auto-approved
    // Regular users: documents need review (PENDING)
    const documentStatus =
      currentUser.role === "ADMIN" ? "APPROVED" : "PENDING";

    const metadata = uploadData.data.metadata || {};
    metadata.status = documentStatus;

    const newDocument: DocumentDocument = {
      title: uploadData.data.title,
      fileId: fileId,
      filename: file.name,
      mimetype: file.type,
      size: file.size,
      metadata: metadata,
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

    // Save file to vector db

    await saveDocumentPipeline(
      fileId.toString(),
      currentUser.userId,
      fileBuffer,
      {
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        ...metadata,
      },
    );

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
