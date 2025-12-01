/**
 * Script to generate bcrypt password hashes for admin/test users
 * Run: npx tsx scripts/generate-password-hash.ts
 */

import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

async function generateHashes() {
  console.log("Generating password hashes with SALT_ROUNDS:", SALT_ROUNDS);
  console.log("==========================================\n");

  // Admin password: Admin123!
  const adminPassword = "Admin123!";
  const adminHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);
  console.log("Admin User:");
  console.log(`  Password: ${adminPassword}`);
  console.log(`  Hash: ${adminHash}`);
  console.log();

  // Test user password: User123!
  const userPassword = "User123!";
  const userHash = await bcrypt.hash(userPassword, SALT_ROUNDS);
  console.log("Test User:");
  console.log(`  Password: ${userPassword}`);
  console.log(`  Hash: ${userHash}`);
  console.log();

  // Verify the hashes work
  const adminVerify = await bcrypt.compare(adminPassword, adminHash);
  const userVerify = await bcrypt.compare(userPassword, userHash);

  console.log("Verification:");
  console.log(`  Admin hash verified: ${adminVerify ? "✓" : "✗"}`);
  console.log(`  User hash verified: ${userVerify ? "✓" : "✗"}`);
  console.log();

  console.log("Copy these hashes to init-mongo.js:");
  console.log("==========================================");
  console.log(`const bcryptHash = '${adminHash}'; // Admin123!`);
  console.log(`const userBcryptHash = '${userHash}'; // User123!`);
}

generateHashes().catch(console.error);
