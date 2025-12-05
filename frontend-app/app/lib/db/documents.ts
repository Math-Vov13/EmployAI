import { ObjectId } from "mongodb";
import { getDocumentsCollection, getGridFSBucket } from "./mongodb";

type DocumentResponse = {
  mimeType: string;
  filename: string;
  size: number;
  uploadedAt: Date;
  data: string;
};

export async function getDocumentById(
  id: string,
): Promise<DocumentResponse | null> {
  const documentsCollection = await getDocumentsCollection();
  const document = await documentsCollection.findOne({
    _id: new ObjectId(id),
    "metadata.status": "APPROVED",
  });
  if (!document) return null;

  // Stream file from GridFS
  const bucket = await getGridFSBucket();

  try {
    const downloadStream = bucket.openDownloadStream(document.fileId);

    // Collect chunks into a buffer
    const chunks: Buffer[] = [];
    for await (const chunk of downloadStream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    // Convert to base64 data URL
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${document.mimetype};base64,${base64Data}`;

    // Return file with base64 data URL for LLM consumption
    return {
      mimeType: document.mimetype,
      filename: document.filename,
      size: document.size,
      uploadedAt: document.createdAt,
      data: dataUrl,
    };
  } catch (gridfsError) {
    console.error("Error downloading file from GridFS:", gridfsError);
    return null;
  }
}
