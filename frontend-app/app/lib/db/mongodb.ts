import { MongoClient, Db, Collection, GridFSBucket } from "mongodb";
import { UserDocument } from "./models/User";
import { DocumentDocument } from "./models/Document";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "employai";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  console.log("Connecting to MongoDB...");
  console.log(`MONGODB_URI: ${MONGODB_URI}`);
  const client = await MongoClient.connect(MONGODB_URI);
  console.log("Db connected", MONGODB_DB_NAME);
  const db = client.db(MONGODB_DB_NAME);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const { db } = await connectToDatabase();
  return db.collection<UserDocument>("users");
}

export async function getDocumentsCollection(): Promise<
  Collection<DocumentDocument>
> {
  const { db } = await connectToDatabase();
  return db.collection<DocumentDocument>("documents");
}

export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}

export async function getGridFSBucket(): Promise<GridFSBucket> {
  const { db } = await connectToDatabase();
  return new GridFSBucket(db, { bucketName: "documents" });
}
