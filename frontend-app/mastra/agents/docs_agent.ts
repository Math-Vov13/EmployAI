import { gateway } from "@ai-sdk/gateway";
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { MongoDBStore } from "@mastra/mongodb";
import { vectorQueryTool } from "../tools/vectors_tool";
import { websearchTool } from "../tools/websearch_tool";
import { mongoVector } from "../vector_store";

// Construire l'URI MongoDB avec les paramètres requis
const buildMongoUri = () => {
  const baseUri = process.env.MONGODB_URI!;
  // Ajouter les paramètres de connexion si non présents
  const hasParams = baseUri.includes("?");
  if (!hasParams) {
    return `${baseUri}?retryWrites=true&w=majority`;
  }
  return baseUri;
};

export const mongoStore = new MongoDBStore({
  url: buildMongoUri(),
  dbName: process.env.MONGODB_DB_NAME!,
  options: {
    appName: "ClusterEmployAI",
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  },
});

export const testAgent = new Agent({
  name: "Employee Document Assistant",
  instructions: `
You are a helpful AI assistant working within an enterprise environment. Your primary role is to help employees find and understand information from their company documents.

## Your Capabilities
- Search and retrieve relevant information from the employee's document database
- Answer questions about company policies, procedures, and guidelines
- Help locate specific documents or information within documents
- Provide concise summaries of document content when requested
- Search the web for additional context when internal documents are insufficient

## Guidelines
- Always be friendly, professional, and concise in your responses
- When answering questions, cite the source document when possible
- If you cannot find the requested information in the available documents, clearly state this
- Protect confidential information and only share data the employee is authorized to access
- If a question is outside your scope, politely redirect the user to the appropriate resource
- Use the vector search tool to find relevant documents before answering questions
- Prioritize accuracy over speed - verify information before responding

## Response Format
- Keep responses clear and to the point
- Use bullet points or numbered lists for complex information
- Provide document references when applicable
- Ask clarifying questions if the user's request is ambiguous
`,
  model: gateway(process.env.AGENT_MODEL!),
  memory: new Memory({
    storage: mongoStore,
    vector: mongoVector,
    embedder: gateway.textEmbeddingModel(process.env.EMBEDDING_MODEL_CACHE!),
    options: {
      lastMessages: 10,
      semanticRecall: {
        topK: 3,
        messageRange: 2,
      },
      threads: {
        generateTitle: true,
      },
    },
  }),
  tools: { vectorQueryTool, websearchTool },
});
