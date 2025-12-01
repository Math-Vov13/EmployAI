// MongoDB Initialization Script
// This script runs when MongoDB container starts for the first time

// Switch to admin database to create root user
db = db.getSiblingDB('admin');

// Create root admin user for MongoDB
db.createUser({
  user: 'admin',
  pwd: 'admin123',
  roles: [
    {
      role: 'root',
      db: 'admin'
    }
  ]
});

print(' MongoDB root user created');

// Switch to application database
db = db.getSiblingDB('employai');

// Create application user with read/write access
db.createUser({
  user: 'employai_user',
  pwd: 'employai_password',
  roles: [
    {
      role: 'readWrite',
      db: 'employai'
    }
  ]
});

print(' Application database user created');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'role', 'createdAt'],
      properties: {
        email: {
          bsonType: 'string',
          description: 'Email must be a string and is required'
        },
        password: {
          bsonType: 'string',
          description: 'Password hash must be a string and is required'
        },
        name: {
          bsonType: 'string',
          description: 'Name must be a string'
        },
        role: {
          enum: ['USER', 'ADMIN'],
          description: 'Role must be either USER or ADMIN'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Created date is required'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Updated date'
        },
        lastLogin: {
          bsonType: 'date',
          description: 'Last login date'
        }
      }
    }
  }
});

print(' Users collection created');

db.createCollection('documents', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'fileId', 'filename', 'mimetype', 'size', 'creatorId', 'createdAt'],
      properties: {
        title: {
          bsonType: 'string',
          description: 'Title must be a string and is required'
        },
        fileId: {
          bsonType: 'objectId',
          description: 'GridFS file ID is required'
        },
        filename: {
          bsonType: 'string',
          description: 'Filename must be a string and is required'
        },
        mimetype: {
          bsonType: 'string',
          description: 'MIME type must be a string and is required'
        },
        size: {
          bsonType: 'number',
          description: 'File size must be a number and is required'
        },
        metadata: {
          bsonType: 'object',
          description: 'Additional metadata'
        },
        creatorId: {
          bsonType: 'objectId',
          description: 'Creator user ID is required'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Created date is required'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Updated date'
        }
      }
    }
  }
});

print(' Documents collection created');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ createdAt: -1 });

print(' User indexes created');

db.documents.createIndex({ creatorId: 1 });
db.documents.createIndex({ createdAt: -1 });
db.documents.createIndex({ 'metadata.status': 1 });
db.documents.createIndex({ title: 'text', 'metadata.description': 'text' });

print(' Document indexes created');

// Create admin user for the application
// Password: Admin123! (hashed with bcrypt, 12 rounds)
const bcryptHash = '$2b$12$wMjj0jjdL1ZTtDseDtYiaei5PQx1e1dTd4B7cTOQQbJpU0ZcjyUbG'; // Admin123!

db.users.insertOne({
  email: 'admin@employai.com',
  password: bcryptHash,
  name: 'Admin User',
  role: 'ADMIN',
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLogin: new Date()
});

print(' Admin user created (admin@employai.com / Admin123!)');

// Create a test regular user
// Password: User123! (hashed with bcrypt, 12 rounds)
const userBcryptHash = '$2b$12$ILohyzCCl6MIbCcp5Mp4reuG3prOjlrRcnHpTekE0c0RtuF1Puv0G'; // User123!

db.users.insertOne({
  email: 'user@employai.com',
  password: userBcryptHash,
  name: 'Test User',
  role: 'USER',
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLogin: new Date()
});

print(' Test user created (user@employai.com / User123!)');

print('');
print('========================================');
print('<� MongoDB Initialization Complete!');
print('========================================');
print('');
print('=� Admin Account:');
print('   Email: admin@employai.com');
print('   Password: Admin123!');
print('');
print('=� Test User Account:');
print('   Email: user@employai.com');
print('   Password: User123!');
print('');
print('= MongoDB Credentials:');
print('   Root User: admin');
print('   Root Password: admin123');
print('   App User: employai_user');
print('   App Password: employai_password');
print('');
print('=�  Database: employai');
print('========================================');
