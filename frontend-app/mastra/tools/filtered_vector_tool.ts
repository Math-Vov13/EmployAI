import { gateway } from "@ai-sdk/gateway";
import { createTool } from "@mastra/core/tools";
import { embed } from "ai";
import { z } from "zod";
import { mongoVector } from "../vector_store";

/**
 * Creates a filtered vector query tool that only searches within specified documents
 */
export function createFilteredVectorQueryTool(fileIds: string[]) {
  return createTool({
    id: "filtered_vector_query",
    description: `Search for relevant information within the user's selected documents.
      This tool searches through the content of specific documents the user has chosen.
      Use this to find relevant context before answering questions about the documents.
      Always call this tool first when the user asks questions about their documents.`,
    inputSchema: z.object({
      query: z
        .string()
        .describe("The search query to find relevant document chunks"),
      topK: z
        .number()
        .optional()
        .default(5)
        .describe("Number of relevant chunks to retrieve (default: 5)"),
    }),
    execute: async ({ context }) => {
      try {
        const { query, topK = 5 } = context;

        // Generate embedding for the query
        const { embedding } = await embed({
          value: query,
          model: gateway.textEmbeddingModel(
            process.env.EMBEDDING_MODEL || "openai:text-embedding-3-small",
          ),
        });

        // Search vector store with filter for selected documents
        const results = await mongoVector.query({
          indexName: "embeddings",
          queryVector: embedding,
          topK,
          filter: {
            source_id: { $in: fileIds },
          },
        });

        if (!results || results.length === 0) {
          return {
            success: false,
            message: "No relevant information found in the selected documents.",
            query,
          };
        }

        // Format results for the agent
        const formattedResults = results
          .map((result, idx) => ({
            rank: idx + 1,
            content: result.metadata?.text || "",
            source: result.metadata?.fileName || "Unknown Document",
            relevance: result.score?.toFixed(3) || "N/A",
          }))
          .filter((r) => r.content.length > 0);

        return {
          success: true,
          query,
          documentsSearched: fileIds.length,
          resultsFound: formattedResults.length,
          results: formattedResults,
          message: `Found ${formattedResults.length} relevant chunks from ${fileIds.length} document(s).`,
        };
      } catch (error) {
        console.error("Filtered vector query error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          query: context.query,
        };
      }
    },
  });
}
