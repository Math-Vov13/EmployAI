import { createTool } from "@mastra/core";
import { PinoLogger } from "@mastra/loggers";
import { getJson } from "serpapi";
import z from "zod";

const logger = new PinoLogger({ name: "WebSearchTool" });

export const websearchTool = createTool({
  id: "websearch",
  description:
    "Perform a web search and return relevant results. Useful for answering questions about current events or general knowledge. Ps: This tool uses SerpAPI to fetch search results from Google.",
  inputSchema: z.object({
    query: z.string().describe("The search query to look up on the web"),
    engine: z.string().optional().default("google"),
    numResults: z
      .number()
      .optional()
      .default(5)
      .describe("The number of search results to return"),
  }),
  execute: async ({ context, writer }) => {
    const startTime = Date.now();
    logger.info("[WebSearchTool] Tool called", {
      query: context.query,
      numResults: context.numResults,
    });

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      logger.error("[WebSearchTool] Missing SERPAPI_KEY environment variable");
      throw new Error("Missing SERPAPI_KEY environment variable.");
    }

    await writer?.write({
      type: "custom-event",
      status: "pending",
    });

    logger.debug("[WebSearchTool] Fetching results from SerpAPI", {
      query: context.query,
    });

    try {
      // Fetch search results from SerpAPI (https://serpapi.com/search-api)
      const response = await getJson({
        engine: context.engine || "google",
        api_key: apiKey,
        q: context.query,
        location: "Austin, Texas",
        num: context.numResults || 5,
      });

      await writer?.write({
        type: "custom-event",
        status: "success",
      });

      const organic = (response.organic_results ?? []).map((r: any) => ({
        title: r.title ?? "",
        url: r.link ?? "",
        snippet: r.snippet ?? "",
      }));

      const duration = Date.now() - startTime;
      logger.info("[WebSearchTool] Tool completed successfully", {
        query: context.query,
        resultsCount: organic.length,
        durationMs: duration,
      });

      return {
        query: context.query,
        results: organic,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("[WebSearchTool] Tool execution failed", {
        query: context.query,
        error: error instanceof Error ? error.message : String(error),
        durationMs: duration,
      });
      throw error;
    }
  },
});