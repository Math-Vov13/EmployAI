import { Mastra } from "@mastra/core";
import { testAgent } from "./agents/docs_agent";
// TODO
// Tools:
// getFileByName()
// getFilesList()
// fetchFileWithEmbeddings() [built-in]
// Websearch

export const mastra = new Mastra({
  agents: { testAgent },
});
