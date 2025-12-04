import { MongoDBVector } from "@mastra/mongodb";

export const mongoVector = new MongoDBVector({
  uri: process.env.MONGODB_URI!, // MongoDB connection string
  dbName: process.env.MONGODB_DB_NAME!, // Database name,
  options: {},
});