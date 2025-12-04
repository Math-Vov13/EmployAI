import { gateway } from "@ai-sdk/gateway";
import { MDocument } from "@mastra/rag";
import { embedMany } from "ai";
import "pdfjs-dist/legacy/build/pdf.worker.mjs";
import { mongoVector } from "../vector_store";
import { readDocumentFromBytes } from "./docs_reader";

export async function saveDocumentPipeline(
  docs_id: string,
  user_id: string,
  content: Buffer<ArrayBuffer>,
  metadata: Record<string, any>,
) {
  // Start pipeline
  // 1. Extract Text
  const uint8ArrayContent = new Uint8Array(content);
  const mimeType = metadata.type || metadata.mimeType || "text/plain";
  const extractedText = await readDocumentFromBytes(
    uint8ArrayContent,
    mimeType,
  );

  // 2. Chunk document
  const docFromText = MDocument.fromText(extractedText);
  const chunks = await docFromText.chunk({
    strategy: "recursive",
    maxSize: 512,
    overlap: 50,
  });

  // 3. Create embeddings
  const { embeddings } = await embedMany({
    values: chunks.map((chunk) => chunk.text),
    model: gateway.textEmbeddingModel(process.env.EMBEDDING_MODEL!),
  });

  // 4. Save to vector store
  await mongoVector.createIndex({
    indexName: "embeddings",
    dimension: embeddings[0].length,
  });
  await mongoVector.upsert({
    indexName: "embeddings",
    vectors: embeddings,
    metadata: chunks.map((_, idx) => ({
      ...metadata,
      source_id: docs_id,
      author_id: user_id,
      chunk_index: idx,
    })),
    ids: chunks.map((_, idx) => `${docs_id}-${Date.now()}-${idx}`),
    deleteFilter: { source_id: docs_id, author_id: user_id },
  });

  console.log("Document saved as id:", docs_id);
}
