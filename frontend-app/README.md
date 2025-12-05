# EmployAI - Employee Document Management & AI Assistant

An AI-powered document management system that helps employees understand and interact with company documents through an intelligent chatbot interface.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Current Implementation](#current-implementation)
- [Planned Migration](#planned-migration)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Database Models](#database-models)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Known Issues](#known-issues)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Testing](#testing)

## Overview

EmployAI is a web application that separates users into two main roles:

### Admin Features

- View all documents (APPROVED, PENDING, REJECTED statuses)
- Approve/reject uploaded documents
- Manage users (view online/offline status)
- Dashboard with comprehensive statistics
- Access to admin-only API endpoints

### User Features

- View APPROVED documents only
- Upload documents (automatically set to PENDING status)
- Download documents
- Chat with AI assistant about document content
- Personal dashboard

## Architecture

### Application Type

- **Framework**: Next.js 16.0.4 (App Router)
- **Runtime**: React 19.2.0
- **Language**: TypeScript 5

### Project Structure Pattern

```
app/
├── (client)/           # Client-side pages
│   ├── (auth)/        # Authentication pages (sign-in, sign-up)
│   ├── (admin)/       # Admin-only pages
│   └── (user)/        # User pages (dashboard, chat, documents)
├── (server)/          # Server-side routes
│   └── api-client/    # API routes
└── lib/               # Shared libraries
    ├── auth/          # Authentication logic
    ├── db/            # Database connections and models
    ├── storage/       # File storage (GridFS)
    └── utils/         # Utility functions
```

## Current Implementation

### Authentication System

**Current Stack**:

- **Session Management**: Iron Session (cookie-based)
  - Cookie name: `employai_session`
  - Max age: 30 minutes
  - Secure in production, httpOnly, sameSite: strict

- **Token-based Auth**: JWT (jsonwebtoken)
  - Used for API requests via Authorization header
  - Token expiration: 7 days
  - Payload includes: userId, email, role

- **Password Hashing**: bcrypt (6 rounds)

- **OAuth**: Google OAuth 2.0 integration (partial)

**Middleware**: `/home/saphirdev/EmployAI/frontend-app/middleware.ts`

- Basic session cookie check
- Redirects unauthenticated users to `/sign-in`
- Protected routes: `/dashboard`, `/documents`, `/chat`, `/admin`
- **CRITICAL ISSUE**: `/admin` route is NOT properly protected at middleware level

### Document Management

- **Storage**: MongoDB GridFS (for binary file storage)
- **Metadata**: Stored in `documents` collection
- **Status Flow**:
  - Admin uploads: Auto-approved (APPROVED)
  - User uploads: Requires approval (PENDING)
  - Admin can reject: (REJECTED)

### AI Chatbot (Mastra)

- **Agent**: OpenAI GPT-4.1-mini
- **Memory**: MongoDB-backed semantic memory
- **Vector Store**: MongoDB Vector (@mastra/mongodb)
- **Embeddings**: FastEmbed (@mastra/fastembed)
- **Features**:
  - Last 10 messages context
  - Semantic recall (top 3, range 2)
  - Conversation threading

## Planned Migration

### Target Stack

1. **Better Auth** (replacing Iron Session + JWT)
   - Modern authentication library for Next.js
   - Built-in session management
   - Better security practices

2. **Multi-Factor Authentication (MFA)**
   - Email-based OTP (One-Time Password)
   - Integration with Resend for email delivery

3. **Resend** (Email Service)
   - Sending OTP codes
   - Password reset emails
   - User notifications

4. **Keep**:
   - Next.js 16.0.4
   - MongoDB
   - Mastra AI Agent
   - Current UI/UX

## Project Structure

```
frontend-app/
├── app/
│   ├── (client)/
│   │   ├── (auth)/
│   │   │   ├── sign-in/page.tsx          # Login page
│   │   │   └── sign-up/page.tsx          # Registration page
│   │   ├── (admin)/
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx              # Admin dashboard
│   │   │   │   ├── documents/page.tsx    # Document management
│   │   │   │   ├── users/page.tsx        # User management
│   │   │   │   └── tags/page.tsx         # Tag management
│   │   │   └── layout.tsx                # Admin layout
│   │   └── (user)/
│   │       ├── dashboard/page.tsx         # User dashboard
│   │       ├── chat/[documentId]/page.tsx # Chat with AI
│   │       └── documents/[id]/page.tsx    # Document details
│   │
│   ├── (server)/api-client/              # API Routes (22 endpoints)
│   │   ├── auth/                         # Authentication endpoints
│   │   │   ├── login/route.tsx           # POST /api-client/auth/login
│   │   │   ├── register/route.tsx        # POST /api-client/auth/register
│   │   │   ├── logout/route.ts           # POST /api-client/auth/logout
│   │   │   ├── token/route.tsx           # Token management
│   │   │   └── google/                   # Google OAuth
│   │   ├── documents/                    # Document endpoints
│   │   │   ├── route.ts                  # GET, POST /api-client/documents
│   │   │   └── [id]/
│   │   │       ├── route.ts              # GET, PUT, DELETE /api-client/documents/:id
│   │   │       └── download/route.ts     # GET /api-client/documents/:id/download
│   │   ├── chat/                         # Chat endpoints
│   │   │   ├── route.tsx                 # GET /api-client/chat
│   │   │   ├── completion/route.tsx      # POST /api-client/chat/completion
│   │   │   └── history/route.tsx         # GET /api-client/chat/history
│   │   ├── users/                        # User endpoints
│   │   │   ├── me/route.tsx              # GET /api-client/users/me
│   │   │   └── [user_id]/route.tsx       # GET /api-client/users/:id
│   │   ├── admin/                        # Admin-only endpoints
│   │   │   ├── users/route.tsx           # GET, POST /api-client/admin/users
│   │   │   ├── users/[user_id]/route.tsx # Admin user management
│   │   │   ├── logs/route.tsx            # System logs
│   │   │   └── route.tsx                 # Admin API root
│   │   ├── tags/route.tsx                # Tag management
│   │   └── route.tsx                     # API root
│   │
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── middleware.ts             # Auth middleware helpers
│   │   │   ├── session.ts                # Iron Session management
│   │   │   ├── token.ts                  # JWT token utilities
│   │   │   ├── password.ts               # Password hashing (bcrypt)
│   │   │   ├── jwt.ts                    # JWT implementation (1 line)
│   │   │   ├── google-oauth.ts           # Google OAuth config
│   │   │   └── csrf.ts                   # CSRF protection
│   │   ├── db/
│   │   │   ├── mongodb.ts                # MongoDB connection
│   │   │   └── models/
│   │   │       ├── User.ts               # User model & schemas
│   │   │       ├── Document.ts           # Document model & schemas
│   │   │       ├── Chat.ts               # Chat model & schemas
│   │   │       ├── Role.ts               # Role model (empty)
│   │   │       └── Permission.ts         # Permission model (placeholder)
│   │   ├── storage/
│   │   │   ├── s3.ts                     # S3 integration (unused)
│   │   │   ├── s3-client.ts              # S3 client config
│   │   │   ├── upload.ts                 # Upload utilities
│   │   │   └── file-validation.ts        # File validation
│   │   └── utils/
│   │       ├── validation.ts             # Validation helpers
│   │       └── error.ts                  # Error handling
│   │
│   ├── layout.tsx                        # Root layout
│   ├── page.tsx                          # Landing page
│   └── globals.css                       # Global styles
│
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── MessageInput.tsx
│   │   └── MessageList.tsx
│   ├── documents/
│   │   ├── DocumentCard.tsx
│   │   ├── DocumentFilters.tsx
│   │   ├── DocumentList.tsx
│   │   └── DocumentUploadForm.tsx
│   └── ui/                               # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       └── ... (more UI components)
│
├── mastra/
│   └── agents/
│       └── docs_agent.ts                 # Mastra AI agent config
│
├── middleware.ts                         # Next.js middleware
├── next.config.ts                        # Next.js configuration
├── package.json                          # Dependencies
├── tsconfig.json                         # TypeScript config
└── .env                                  # Environment variables
```

## Technology Stack

### Core Dependencies

```json
{
  "next": "16.0.4",
  "react": "19.2.0",
  "react-dom": "19.2.0",
  "typescript": "^5"
}
```

### Authentication (Current)

```json
{
  "iron-session": "^8.0.4",
  "jsonwebtoken": "^9.0.2",
  "bcrypt": "^6.0.0"
}
```

### Database

```json
{
  "mongodb": "^7.0.0"
}
```

### AI & Chatbot (Mastra)

```json
{
  "@mastra/core": "^0.24.6",
  "@mastra/fastembed": "^0.10.7",
  "@mastra/libsql": "^0.16.3",
  "@mastra/loggers": "^0.10.19",
  "@mastra/memory": "^0.15.12",
  "@mastra/mongodb": "^0.14.10"
}
```

### UI Components

```json
{
  "@radix-ui/react-avatar": "^1.1.11",
  "@radix-ui/react-dialog": "^1.1.15",
  "@radix-ui/react-label": "^2.1.8",
  "@radix-ui/react-select": "^2.2.6",
  "lucide-react": "^0.555.0",
  "tailwindcss": "^4"
}
```

### Form Handling & Validation

```json
{
  "react-hook-form": "^7.66.1",
  "@hookform/resolvers": "^5.2.2",
  "zod": "^4.1.13"
}
```

### Storage (Configured but unused)

```json
{
  "@aws-sdk/client-s3": "^3.940.0",
  "@aws-sdk/s3-request-presigner": "^3.940.0"
}
```

### Dev Dependencies

```json
{
  "@jest/globals": "^30.2.0",
  "jest": "^30.2.0",
  "prettier": "3.6.2",
  "husky": "^9.1.7",
  "ts-jest": "^29.4.5"
}
```

## Database Models

### User Model

**Collection**: `users`
**Location**: `app/lib/db/models/User.ts`

```typescript
interface UserDocument {
  _id?: ObjectId;
  email: string; // Unique, lowercase
  password: string; // bcrypt hashed
  name: string; // Min 2 characters
  role: "USER" | "ADMIN";
  googleId?: string; // For OAuth
  picture?: string; // Profile picture URL
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}
```

**Password Requirements**:

- Minimum 12 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 digit
- At least 1 special character

### Document Model

**Collection**: `documents`
**Storage**: GridFS (`documents` bucket)
**Location**: `app/lib/db/models/Document.ts`

```typescript
interface DocumentDocument {
  _id?: ObjectId;
  title: string;
  fileId: ObjectId; // GridFS file ID
  filename: string; // Original filename
  mimetype: string;
  size: number; // Bytes
  metadata: {
    status: "APPROVED" | "PENDING" | "REJECTED";
    description?: string;
    tags?: string[];
    [key: string]: any;
  };
  creatorId: ObjectId; // User who uploaded
  createdAt: Date;
  updatedAt: Date;
}
```

**Document Status Logic**:

- Admin uploads: Automatically `APPROVED`
- User uploads: Set to `PENDING`
- Admin can change to `REJECTED`

### Chat Model

**Collection**: `chats`
**Location**: `app/lib/db/models/Chat.ts`

```typescript
interface ChatDocument {
  _id?: ObjectId;
  userId: ObjectId;
  documentId: ObjectId; // Chat context document
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

### Role & Permission Models

**Status**: Placeholders (not implemented)

- `app/lib/db/models/Role.ts` - Empty (1 line)
- `app/lib/db/models/Permission.ts` - Placeholder comment

## API Endpoints

### Authentication Endpoints

| Method | Endpoint                           | Auth    | Description               |
| ------ | ---------------------------------- | ------- | ------------------------- |
| POST   | `/api-client/auth/login`           | None    | Login with email/password |
| POST   | `/api-client/auth/register`        | None    | Create new user account   |
| POST   | `/api-client/auth/logout`          | Session | Destroy session           |
| POST   | `/api-client/auth/token`           | None    | Generate JWT token        |
| GET    | `/api-client/auth/google`          | None    | Google OAuth redirect     |
| GET    | `/api-client/auth/google/callback` | None    | Google OAuth callback     |

### Document Endpoints

| Method | Endpoint                             | Auth        | Description                       |
| ------ | ------------------------------------ | ----------- | --------------------------------- |
| GET    | `/api-client/documents`              | Required    | List documents (filtered by role) |
| POST   | `/api-client/documents`              | Required    | Upload document                   |
| GET    | `/api-client/documents/:id`          | Required    | Get document details              |
| PUT    | `/api-client/documents/:id`          | Owner/Admin | Update document metadata          |
| DELETE | `/api-client/documents/:id`          | Owner/Admin | Delete document                   |
| GET    | `/api-client/documents/:id/download` | Required    | Download document file            |

**Document Visibility Rules**:

- **Admin**: See all documents (any status)
- **User**: See APPROVED documents + own documents (any status)

### Chat Endpoints

| Method | Endpoint                      | Auth     | Description              |
| ------ | ----------------------------- | -------- | ------------------------ |
| GET    | `/api-client/chat`            | Required | Get user's chat sessions |
| POST   | `/api-client/chat/completion` | Required | Send message to AI       |
| GET    | `/api-client/chat/history`    | Required | Get chat history         |

### User Endpoints

| Method | Endpoint                | Auth        | Description              |
| ------ | ----------------------- | ----------- | ------------------------ |
| GET    | `/api-client/users/me`  | Required    | Get current user profile |
| GET    | `/api-client/users/:id` | Owner/Admin | Get user by ID           |

### Admin Endpoints

| Method | Endpoint                                     | Auth  | Description               |
| ------ | -------------------------------------------- | ----- | ------------------------- |
| GET    | `/api-client/admin/users`                    | Admin | List all users            |
| POST   | `/api-client/admin/users`                    | Admin | Create user (placeholder) |
| GET    | `/api-client/admin/users/:id`                | Admin | Get user details          |
| PUT    | `/api-client/admin/users/:id`                | Admin | Update user               |
| DELETE | `/api-client/admin/users/:id`                | Admin | Delete user               |
| GET    | `/api-client/admin/users/:id/roles`          | Admin | Get user roles            |
| POST   | `/api-client/admin/users/:id/roles/:role_id` | Admin | Assign role               |
| DELETE | `/api-client/admin/users/:id/roles/:role_id` | Admin | Remove role               |
| GET    | `/api-client/admin/logs`                     | Admin | System logs               |

### Tag Endpoints

| Method | Endpoint           | Auth     | Description                 |
| ------ | ------------------ | -------- | --------------------------- |
| GET    | `/api-client/tags` | Required | List tags (not implemented) |

## Authentication

### Current Implementation

#### Session-Based (Primary)

**File**: `app/lib/auth/session.ts`

```typescript
// Cookie Configuration
{
  cookieName: "employai_session",
  password: process.env.SESSION_SECRET,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
    maxAge: 30 * 60,  // 30 minutes
    path: "/"
  }
}
```

**Session Data**:

```typescript
interface SessionData {
  userId: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  isLoggedIn: boolean;
  googleId?: string;
}
```

#### Token-Based (Alternative)

**File**: `app/lib/auth/token.ts`

```typescript
// JWT Configuration
{
  secret: process.env.JWT_SECRET,
  expiresIn: "7d"
}
```

**Token Payload**:

```typescript
interface TokenPayload {
  userId: string;
  email: string;
  role: "USER" | "ADMIN";
}
```

**Usage**: Authorization header as `Bearer <token>`

#### Middleware

**File**: `app/lib/auth/middleware.ts`

**Functions**:

- `getAuthContext(request)` - Check session OR token
- `requireAuth(request)` - Require any authentication
- `requireAdmin(request)` - Require admin role
- `requireOwnership(request, resourceUserId)` - Check ownership

**Auth Priority**: Session first, then JWT token fallback

### Planned Implementation (Better Auth + MFA)

**Migration To**:

1. Install Better Auth
2. Configure email provider (Resend)
3. Implement OTP-based MFA
4. Migrate existing sessions
5. Update middleware
6. Add admin login page at `/admin/login`
7. Properly protect `/admin` routes

## Known Issues

### Critical

1. **Admin Route Not Protected**: `/admin` route accessible without proper role check in middleware (line 40-45 in `middleware.ts`)
2. **Missing Admin Login**: No dedicated admin login page
3. **JWT Secret Validation**: `app/lib/auth/jwt.ts` is essentially empty (1 line)

### Functionality Issues

4. **Some Endpoints Not Implemented**:
   - `POST /api-client/admin/users` - Returns placeholder
   - Tags API incomplete

5. **Google OAuth Incomplete**:
   - OAuth flow exists but not fully tested
   - Callback handling needs verification

6. **User Status Tracking**:
   - Online/offline/standby status not implemented
   - Admin dashboard shows 0 for all user statuses

7. **File Storage**:
   - S3 client configured but not used
   - All files stored in MongoDB GridFS

### Security Concerns

8. **Session Timeout**: Only 30 minutes (may be too short)
9. **No Rate Limiting**: APIs vulnerable to brute force
10. **No CSRF Protection**: CSRF file exists but not implemented
11. **No Email Verification**: Users can register with any email

### Code Quality

12. **Incomplete Models**:
    - `Role.ts` is empty
    - `Permission.ts` is a placeholder

13. **Test Coverage**:
    - Only 3 test files exist (auth tests)
    - No integration tests

14. **Error Handling**:
    - Generic error messages
    - No structured error responses

## Setup Instructions

### Prerequisites

- Node.js 20+
- MongoDB Atlas account (or local MongoDB 7.0+)
- OpenAI API key

### Installation

1. **Clone the repository**

```bash
cd /home/saphirdev/EmployAI/frontend-app
```

2. **Install dependencies**

```bash
npm install
# or
pnpm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your credentials (see Environment Variables section)

4. **Run development server**

```bash
npm run dev
```

5. **Open browser**

```
http://localhost:3000
```

### First-Time Setup

1. **Create Admin User**
   - Register through `/sign-up`
   - Manually update user in MongoDB:

   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "ADMIN" } },
   );
   ```

2. **Verify MongoDB Connection**
   - Check console for "Db connected" message
   - Verify collections: `users`, `documents`, `chats`

3. **Test Document Upload**
   - Login as admin
   - Upload a test document
   - Verify it appears in dashboard

## Environment Variables

### Required Variables

```bash
# MongoDB Configuration
MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority"
MONGODB_DB_NAME="employai"

# AI Agent (Mastra + OpenAI)
OPENAI_API_KEY="sk-..."

# Authentication
SESSION_SECRET="random-32-character-minimum-secret-key-here"
JWT_SECRET="another-random-32-character-secret-key-here"
```

### Optional Variables

```bash
# Google OAuth (if using)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api-client/auth/google/callback"

# AWS S3 (configured but not used)
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket"
```

### Generate Secrets

```bash
# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Development

### Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build          # Also runs prettier

# Start production server
npm start

# Run tests
npm test               # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage

# Code formatting
npm run prettier       # Format all files

# Linting
npm run lint
```

### Development Workflow

1. Make changes
2. Tests run automatically (if husky configured)
3. Format code: `npm run prettier`
4. Build: `npm run build`
5. Commit changes

### Hot Module Replacement

- Next.js supports HMR by default
- Pages auto-refresh on save
- API routes require server restart for some changes

## Testing

### Current Test Files

```
app/lib/auth/__tests__/
├── middleware-unit.test.ts
├── password.test.ts
└── token.test.ts

app/lib/db/models/__tests__/
├── Chat.test.ts
├── Document.test.ts
└── User.test.ts
```

### Run Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Configuration

- **Framework**: Jest 30.2.0
- **Environment**: Node
- **TypeScript**: ts-jest
- **Config**: `jest.config.js`

## Migration Roadmap

### Phase 1: Better Auth Setup

- [ ] Install Better Auth dependencies
- [ ] Configure Better Auth client
- [ ] Create auth configuration file
- [ ] Update environment variables

### Phase 2: Email Provider (Resend)

- [ ] Sign up for Resend account
- [ ] Configure Resend API key
- [ ] Create email templates
- [ ] Test email delivery

### Phase 3: MFA Implementation

- [ ] Implement OTP generation
- [ ] Create OTP verification UI
- [ ] Add email sending logic
- [ ] Test OTP flow

### Phase 4: Admin Protection

- [ ] Create `/admin/login` page
- [ ] Add admin-specific middleware
- [ ] Protect all `/admin` routes
- [ ] Add role-based redirects

### Phase 5: Migration

- [ ] Migrate existing sessions
- [ ] Update all auth imports
- [ ] Remove old auth code
- [ ] Update documentation

### Phase 6: Testing & Deployment

- [ ] Integration tests
- [ ] Security audit
- [ ] Performance testing
- [ ] Production deployment

## Contributing

This is a private project. For questions or issues, contact the development team.

## License

Proprietary - All rights reserved

---

**Last Updated**: December 2, 2025
**Version**: 0.1.0
**Status**: Development
