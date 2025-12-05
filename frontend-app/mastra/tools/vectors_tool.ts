import { gateway } from "@ai-sdk/gateway";
import { createVectorQueryTool } from "@mastra/rag";
import { mongoVector } from "../vector_store";

export const vectorQueryTool = createVectorQueryTool({
  vectorStore: mongoVector,
  indexName: "embeddings",
  model: gateway.textEmbeddingModel(process.env.EMBEDDING_MODEL || "openai:text-embedding-3-small"),
});
