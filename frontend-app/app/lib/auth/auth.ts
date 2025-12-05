import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is not defined in environment variables");
}

if (!process.env.BETTER_AUTH_URL) {
  throw new Error("BETTER_AUTH_URL is not defined in environment variables");
}

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "employai";

// Create MongoDB client for Better Auth
const mongoClient = new MongoClient(MONGODB_URI);

export const auth = betterAuth({
  // Database adapter
  database: mongodbAdapter(mongoClient.db(MONGODB_DB_NAME)),

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // We'll use OTP instead
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache for 5 minutes
    },
  },

  // Advanced session configuration with dual tokens
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookiePrefix: "employai",
    crossSubDomainCookies: {
      enabled: false,
    },
  },

  // Account configuration
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  // User configuration
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "USER",
        input: false, // Don't allow users to set this directly
      },
      name: {
        type: "string",
        required: true,
      },
      picture: {
        type: "string",
        required: false,
      },
      lastLogin: {
        type: "date",
        required: false,
      },
    },
    changeEmail: {
      enabled: true,
    },
    deleteUser: {
      enabled: true,
    },
  },

  // Security
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  // Trusted origins
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    "http://localhost:3000",
  ],

  // Rate limiting
  rateLimit: {
    enabled: true,
    window: 60, // 1 minute
    max: 10, // 10 requests per minute
    storage: "memory", // We'll use memory for now, can upgrade to Redis later
  },
});

export type Session = typeof auth.$Infer.Session;
