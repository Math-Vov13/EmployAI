#!/usr/bin/env node

/**
 * Seed Admin User Script
 *
 * This script creates an initial admin user in the database.
 * Run with: node scripts/seed-admin.js
 */

const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const readline = require("readline");

// Load environment variables
require("dotenv").config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function hashPassword(password) {
  const saltRounds = 6;
  return await bcrypt.hash(password, saltRounds);
}

async function seedAdmin() {
  console.log("\n🌱 EmployAI Admin Seeder\n");
  console.log("This script will create an admin user in the database.\n");

  // Check environment variables
  if (!process.env.MONGODB_URI) {
    console.error("❌ Error: MONGODB_URI not found in environment variables");
    console.error("Please create a .env file with MONGODB_URI");
    process.exit(1);
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "employai";

  let client;

  try {
    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(MONGODB_DB_NAME);
    const usersCollection = db.collection("users");

    console.log("✅ Connected to database:", MONGODB_DB_NAME);
    console.log();

    // Get admin details from user
    const name = await question('Admin Name (e.g., "John Admin"): ');
    if (!name || name.trim().length === 0) {
      console.error("❌ Name is required");
      process.exit(1);
    }

    const email = await question('Admin Email (e.g., "admin@employai.com"): ');
    if (!email || !email.includes("@")) {
      console.error("❌ Valid email is required");
      process.exit(1);
    }

    // Check if email already exists
    const existingUser = await usersCollection.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      console.log("\n⚠️  User with this email already exists!");
      console.log("Current role:", existingUser.role);

      if (existingUser.role === "ADMIN") {
        console.log("✅ User is already an admin. No changes needed.");
        rl.close();
        await client.close();
        return;
      }

      const upgrade = await question(
        "\nUpgrade existing user to ADMIN? (yes/no): ",
      );
      if (upgrade.toLowerCase() === "yes" || upgrade.toLowerCase() === "y") {
        await usersCollection.updateOne(
          { email: email.toLowerCase() },
          {
            $set: {
              role: "ADMIN",
              updatedAt: new Date(),
            },
          },
        );
        console.log("\n✅ User upgraded to ADMIN successfully!");
        console.log("📧 Email:", email);
        console.log("👤 Name:", existingUser.name);
        console.log("🎭 Role: ADMIN");
      } else {
        console.log("❌ Cancelled");
      }

      rl.close();
      await client.close();
      return;
    }

    const password = await question("Admin Password (min 12 characters): ");
    if (!password || password.length < 12) {
      console.error("❌ Password must be at least 12 characters");
      process.exit(1);
    }

    const confirmPassword = await question("Confirm Password: ");
    if (password !== confirmPassword) {
      console.error("❌ Passwords do not match");
      process.exit(1);
    }

    console.log("\n🔐 Hashing password...");
    const hashedPassword = await hashPassword(password);

    // Create admin user
    const adminUser = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "ADMIN",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
    };

    console.log("💾 Creating admin user...");
    const result = await usersCollection.insertOne(adminUser);

    console.log("\n✅ Admin user created successfully!");
    console.log("");
    console.log("═══════════════════════════════════════════════");
    console.log("📧 Email:", email);
    console.log("👤 Name:", name);
    console.log("🆔 User ID:", result.insertedId);
    console.log("🎭 Role: ADMIN");
    console.log("═══════════════════════════════════════════════");
    console.log("");
    console.log("🎉 You can now sign in at: /admin/sign-in");
    console.log("");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  } finally {
    rl.close();
    if (client) {
      await client.close();
      console.log("🔌 Database connection closed");
    }
  }
}

// Run the seeder
seedAdmin().catch(console.error);
