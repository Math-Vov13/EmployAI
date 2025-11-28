import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth/middleware";
import { getDocumentsCollection } from "@/app/lib/db/mongodb";
import { ObjectId } from "mongodb";
import { generatePresignedUrl } from "@/app/lib/storage/s3-client";

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

    const presignedUrl = await generatePresignedUrl(document.s3Key);

    if (!presignedUrl) {
      return NextResponse.json(
        { error: "Failed to generate download URL" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        downloadUrl: presignedUrl,
        expiresIn: 3600, // 1h
        document: {
          id: document._id?.toString(),
          title: document.title,
          mimetype: document.mimetype,
          size: document.size,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error generating download URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
