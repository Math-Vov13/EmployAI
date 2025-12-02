# Admin User Seeder

This document explains how to create admin users in the EmployAI system.

## Overview

EmployAI is a closed system for employers and employees only. There is no public sign-up page. All users must be created manually by administrators.

## Creating Your First Admin User

### Prerequisites

1. MongoDB connection configured in `.env` file
2. Node.js installed
3. All dependencies installed (`npm install`)

### Step 1: Run the Seed Script

```bash
npm run seed:admin
```

### Step 2: Follow the Interactive Prompts

The script will ask for:

1. **Admin Name**: Full name (e.g., "John Admin")
2. **Admin Email**: Email address (e.g., "admin@employai.com")
3. **Password**: Secure password (minimum 12 characters)
4. **Confirm Password**: Re-enter password for confirmation

### Example Session

```
🌱 EmployAI Admin Seeder

This script will create an admin user in the database.

🔌 Connecting to MongoDB...
✅ Connected to database: employai

Admin Name (e.g., "John Admin"): John Doe
Admin Email (e.g., "admin@employai.com"): admin@company.com
Admin Password (min 12 characters): ************
Confirm Password: ************

🔐 Hashing password...
💾 Creating admin user...

✅ Admin user created successfully!

═══════════════════════════════════════════════
📧 Email: admin@company.com
👤 Name: John Doe
🆔 User ID: 507f1f77bcf86cd799439011
🎭 Role: ADMIN
═══════════════════════════════════════════════

🎉 You can now sign in at: /admin/sign-in

🔌 Database connection closed
```

## Features

### ✅ Email Validation
- Checks if email is already registered
- Offers to upgrade existing users to ADMIN role

### ✅ Password Security
- Minimum 12 characters required
- Automatically hashed using bcrypt
- Password confirmation to prevent typos

### ✅ Safe Execution
- Won't create duplicate admins
- Validates all inputs before creating user
- Clear error messages

## Upgrading Existing User to Admin

If you run the script with an email that already exists:

```
⚠️  User with this email already exists!
Current role: USER

Upgrade existing user to ADMIN? (yes/no):
```

Type `yes` to upgrade the user to admin role.

## Password Requirements

- **Minimum length**: 12 characters
- **Recommended**: Use a mix of:
  - Uppercase letters (A-Z)
  - Lowercase letters (a-z)
  - Numbers (0-9)
  - Special characters (!@#$%^&*)

## Signing In

After creating an admin user:

1. Navigate to: `/admin/sign-in`
2. Enter your email and password
3. Verify the OTP code sent to your email (or check terminal in development)
4. Access the admin dashboard at `/admin`

## Adding Regular Users

Since there's no sign-up page, regular users must be added by:

1. **Database directly**: Insert into MongoDB `users` collection
2. **Future admin panel**: User management interface (coming soon)
3. **Contact system administrator**: For manual user creation

### User Document Structure

```javascript
{
  name: "User Name",
  email: "user@company.com",
  password: "bcrypt_hashed_password",
  role: "USER", // or "ADMIN"
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLogin: null
}
```

## Troubleshooting

### Error: MONGODB_URI not found
```
❌ Error: MONGODB_URI not found in environment variables
```
**Solution**: Create a `.env` file with your MongoDB connection string:
```env
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/"
MONGODB_DB_NAME="employai"
```

### Error: Password must be at least 12 characters
```
❌ Password must be at least 12 characters
```
**Solution**: Use a longer, more secure password.

### Error: Passwords do not match
```
❌ Passwords do not match
```
**Solution**: Ensure you type the same password both times.

### Error: Valid email is required
```
❌ Valid email is required
```
**Solution**: Enter a properly formatted email address with @ symbol.

## Security Notes

⚠️ **Important Security Considerations**:

1. **Never commit passwords**: Don't save passwords in code or version control
2. **Use strong passwords**: Minimum 12 characters with mixed case and special characters
3. **Limit admin accounts**: Only create admin accounts for trusted personnel
4. **Rotate passwords**: Regularly update admin passwords
5. **Monitor access**: Review admin activity logs regularly
6. **Environment variables**: Keep `.env` file secure and never commit it

## Multiple Admins

You can create multiple admin users by running the seed script multiple times with different email addresses.

```bash
# First admin
npm run seed:admin
# Email: admin1@company.com

# Second admin
npm run seed:admin
# Email: admin2@company.com
```

## Next Steps

After creating your first admin:

1. ✅ Sign in to admin dashboard
2. ✅ Configure system settings
3. ✅ Review user management
4. ✅ Set up email provider (Resend) for OTP delivery
5. ✅ Configure Google OAuth (optional)

## Support

For issues or questions:
- Check the main README.md
- Review AUTH_IMPLEMENTATION_SUMMARY.md
- Contact the development team
