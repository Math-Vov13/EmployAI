import { Collection, Db, GridFSBucket, MongoClient } from "mongodb";
import { ChatDocument } from "./models/Chat";
import { DocumentDocument } from "./models/Document";
import { TagDocument } from "./models/Tag";
import { UserDocument } from "./models/User";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME!;

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }
  const client = await MongoClient.connect(MONGODB_URI);
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

export async function getChatsCollection(): Promise<Collection<ChatDocument>> {
  const { db } = await connectToDatabase();
  return db.collection<ChatDocument>("chats");
}

export async function getTagsCollection(): Promise<Collection<TagDocument>> {
  const { db } = await connectToDatabase();
  return db.collection<TagDocument>("tags");
}
