/**
 * Script to create an admin user in MongoDB
 *
 * Usage:
 * 1. Make sure MONGODB_URI is set in your .env file
 * 2. Run: npx ts-node scripts/create-admin.ts
 */

import { config } from "dotenv";
import { MongoClient } from "mongodb";
import * as bcrypt from "bcrypt";
import * as readline from "readline";
import * as path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
config({ path: path.resolve(__dirname, "../.env") });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
};

async function createAdminUser() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error("❌ Error: MONGODB_URI not found in environment variables");
    console.error("Please set MONGODB_URI in your .env file");
    process.exit(1);
  }

  console.log("🔧 Creating Admin User\n");

  const email = await question("Enter admin email: ");
  const password = await question("Enter admin password: ");
  const name = await question("Enter admin name: ");

  if (!email || !password || !name) {
    console.error("❌ All fields are required");
    rl.close();
    process.exit(1);
  }

  try {
    console.log("\n⏳ Connecting to MongoDB...");
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db("employai");
    const usersCollection = db.collection("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      console.error(`❌ Error: User with email ${email} already exists`);

      const shouldUpdate = await question(
        "\nDo you want to update this user to ADMIN role? (yes/no): ",
      );

      if (
        shouldUpdate.toLowerCase() === "yes" ||
        shouldUpdate.toLowerCase() === "y"
      ) {
        await usersCollection.updateOne(
          { email: email.toLowerCase() },
          {
            $set: {
              role: "ADMIN",
              updatedAt: new Date(),
            },
          },
        );
        console.log("✅ User role updated to ADMIN successfully!");
      }

      await client.close();
      rl.close();
      process.exit(0);
    }

    // Hash password
    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    console.log("📝 Creating admin user...");
    const result = await usersCollection.insertOne({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name,
      role: "ADMIN",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date(),
    });

    console.log("\n✅ Admin user created successfully!");
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${name}`);
    console.log(`🔑 Role: ADMIN`);
    console.log(`🆔 User ID: ${result.insertedId}`);

    await client.close();
    rl.close();
  } catch (error) {
    console.error("\n❌ Error creating admin user:", error);
    rl.close();
    process.exit(1);
  }
}

createAdminUser();
