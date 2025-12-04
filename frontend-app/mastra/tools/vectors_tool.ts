import { createVectorQueryTool } from "@mastra/rag";
import { gateway } from "ai";
import { mongoVector } from "../vector_store";

export const vectorQueryTool = createVectorQueryTool({
  vectorStore: mongoVector,
  indexName: "embeddings",
  model: gateway.textEmbeddingModel(process.env.EMBEDDING_MODEL!),
});
