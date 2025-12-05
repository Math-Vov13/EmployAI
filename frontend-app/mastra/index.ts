import { Mastra } from "@mastra/core";
import { testAgent } from "./agents/docs_agent";

export const mastra = new Mastra({
  agents: { testAgent },
});
