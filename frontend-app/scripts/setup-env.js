#!/usr/bin/env node

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

console.log("🔐 EmployAI Environment Setup\n");
console.log("=".repeat(50));

// Generate secrets
const betterAuthSecret = crypto.randomBytes(32).toString("base64url");
const sessionSecret = crypto.randomBytes(32).toString("base64");
const jwtSecret = crypto.randomBytes(32).toString("hex");

console.log("\nGenerated Secrets:");
console.log("─".repeat(50));
console.log("\nBETTER_AUTH_SECRET:");
console.log(betterAuthSecret);
console.log("\nSESSION_SECRET (legacy):");
console.log(sessionSecret);
console.log("\nJWT_SECRET (legacy):");
console.log(jwtSecret);
console.log("\n" + "─".repeat(50));

// Check if .env exists
const envPath = path.join(__dirname, "..", ".env");
const envExamplePath = path.join(__dirname, "..", ".env.example");

if (!fs.existsSync(envPath)) {
  console.log("\n⚠️  No .env file found. Creating from .env.example...");

  if (fs.existsSync(envExamplePath)) {
    let envContent = fs.readFileSync(envExamplePath, "utf8");

    // Replace placeholders with generated values
    envContent = envContent.replace(
      /BETTER_AUTH_SECRET=".*"/,
      `BETTER_AUTH_SECRET="${betterAuthSecret}"`,
    );
    envContent = envContent.replace(
      /SESSION_SECRET=".*"/,
      `SESSION_SECRET="${sessionSecret}"`,
    );
    envContent = envContent.replace(
      /JWT_SECRET=".*"/,
      `JWT_SECRET="${jwtSecret}"`,
    );

    fs.writeFileSync(envPath, envContent);
    console.log("✅ Created .env file with generated secrets");
  } else {
    console.log("❌ .env.example not found!");
  }
} else {
  console.log("\n✅ .env file exists");
  console.log("\n📝 Manual Steps Required:");
  console.log("─".repeat(50));
  console.log("\n1. Copy the generated secrets above");
  console.log("2. Update your .env file with:");
  console.log("   - BETTER_AUTH_SECRET");
  console.log("   - BETTER_AUTH_URL (http://localhost:3000 for development)");
  console.log("   - NEXT_PUBLIC_BETTER_AUTH_URL (same as above)");
  console.log("\n3. Optional: Add Resend configuration:");
  console.log("   - RESEND_API_KEY (get from https://resend.com)");
  console.log("   - RESEND_FROM_EMAIL (your verified sender email)");
  console.log("\n4. Existing configuration:");
  console.log("   - MONGODB_URI");
  console.log("   - MONGODB_DB_NAME");
  console.log("   - OPENAI_API_KEY");
}

console.log("\n" + "=".repeat(50));
console.log("\n💡 Next Steps:");
console.log("─".repeat(50));
console.log("\n1. Update your .env file with the required variables");
console.log("2. If using Resend, sign up at https://resend.com");
console.log("3. Run: npm run dev");
console.log("4. Test admin login at: http://localhost:3000/admin/sign-in");
console.log("5. Test user login at: http://localhost:3000/sign-in");
console.log("\n" + "=".repeat(50) + "\n");
