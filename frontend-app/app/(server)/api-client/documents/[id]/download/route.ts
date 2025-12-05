import { getCurrentUser } from "@/app/lib/auth/middleware";
import { getDocumentsCollection, getGridFSBucket } from "@/app/lib/db/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "node:stream";

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

    // Authorization check:
    // - Admins can download any document
    // - Regular users can ONLY download APPROVED documents
    if (currentUser.role !== "ADMIN") {
      const documentStatus = document.metadata?.status || "PENDING";
      if (documentStatus !== "APPROVED") {
        return NextResponse.json(
          { error: "Document not found or not yet approved" },
          { status: 404 },
        );
      }
    }

    // Stream file from GridFS
    const bucket = await getGridFSBucket();

    try {
      const downloadStream = bucket.openDownloadStream(document.fileId);

      // Convert MongoDB stream to Web ReadableStream
      const webStream = Readable.toWeb(
        downloadStream,
      ) as ReadableStream<Uint8Array>;

      // Return file as streaming response
      return new NextResponse(webStream, {
        headers: {
          "Content-Type": document.mimetype || "application/octet-stream",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(document.filename)}"`,
          "Content-Length": document.size.toString(),
        },
      });
    } catch (gridfsError) {
      console.error("Error downloading file from GridFS:", gridfsError);
      return NextResponse.json(
        { error: "Failed to download file" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error generating download:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
