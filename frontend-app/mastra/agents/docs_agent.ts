import { gateway } from "@ai-sdk/gateway";
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { MongoDBStore, MongoDBVector } from "@mastra/mongodb";

const mongoVector = new MongoDBVector({
  uri: process.env.MONGODB_URI!, // MongoDB connection string
  dbName: process.env.MONGODB_DB_NAME!, // Database name,
  options: {},
});

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

const mongoStore = new MongoDBStore({
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
  name: "OpenAI Test Agent",
  instructions: `
        You are a test agent designed to assist with OpenAI-related queries. Provide accurate and concise information based on user questions.
`,
  model: gateway(process.env.AGENT_MODEL!),
  memory: new Memory({
    storage: mongoStore,
    vector: mongoVector,
    embedder: gateway.textEmbeddingModel(process.env.EMBEDDING_MODEL!),
    options: {
      lastMessages: 10,
      semanticRecall: {
        topK: 3,
        messageRange: 2,
      },
      threads: {
        generateTitle: false,
      },
    },
  }),
});
