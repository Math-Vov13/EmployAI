import { gateway } from "@ai-sdk/gateway";
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { MongoDBStore } from "@mastra/mongodb";
import { vectorQueryTool } from "../tools/vectors_tool";
import { websearchTool } from "../tools/websearch_tool";
import { mongoVector } from "../vector_store";

// Construire l'URI MongoDB avec les paramètres requis
const buildMongoUri = () => {
  const baseUri = process.env.MONGODB_URI;
  if (!baseUri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }
  // Ajouter les paramètres de connexion si non présents
  const hasParams = baseUri.includes("?");
  if (!hasParams) {
    return `${baseUri}?retryWrites=true&w=majority`;
  }
  return baseUri;
};

// Mastra Memory Storage:
// This creates separate collections (e.g., "threads", "messages") for agent memory
// This is DIFFERENT from the custom "chats" collection used for UI display
// - Mastra collections: Internal agent conversation context
// - Custom chats collection: User-facing chat history for the UI
// NOTE: If MongoDB connection fails, the agent will fallback to no-memory mode
export const mongoStore = new MongoDBStore({
  url: buildMongoUri(),
  dbName: process.env.MONGODB_DB_NAME || "employai",
  options: {
    appName: "ClusterEmployAI",
    serverSelectionTimeoutMS: 5000, // Reduced timeout for faster failure
    connectTimeoutMS: 5000,
    socketTimeoutMS: 5000,
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

## User data
username: {{user_name}}
user email: {{user_email}}
company: EmployAI
company website: https://employai.com
company description: EmployAI is a platform that enables businesses to create AI-powered assistants using their own data to improve customer support, sales, and internal operations.

## Response Format
- Keep responses clear and to the point
- Use bullet points or numbered lists for complex information
- Provide document references when applicable
- Ask clarifying questions if the user's request is ambiguous
`,
  model: gateway(process.env.AGENT_MODEL || "anthropic:claude-3-5-sonnet-20241022"),
  memory: new Memory({
    storage: mongoStore,
    vector: mongoVector,
    embedder: gateway.textEmbeddingModel(process.env.EMBEDDING_MODEL_CACHE || "openai:text-embedding-3-small"),
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
