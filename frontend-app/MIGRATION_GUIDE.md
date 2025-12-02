# Authentication Migration Guide

This guide will help you migrate from the old authentication system to the new Better Auth + OTP/MFA system.

## What's New

### ✨ Features Added

1. **Two-Factor Authentication (2FA/MFA)**
   - Email-based OTP verification
   - 6-digit codes valid for 10 minutes
   - OTP printed to terminal for development
   - Email delivery via Resend (optional)

2. **Dedicated Admin Login**
   - Separate admin login page at `/admin/sign-in`
   - Role verification (must be ADMIN)
   - Protected admin routes

3. **Improved Security**
   - Better Auth integration (dual tokens: access + refresh)
   - Proper admin route protection in middleware
   - Session-based authentication
   - Rate limiting built-in

4. **Better UX**
   - Auto-focus OTP inputs
   - Auto-submit on 6th digit
   - Paste support for OTP codes
   - Countdown timer for resend
   - Visual feedback for all states

## Migration Steps

### 1. Install Dependencies

Already completed! The following packages were installed:

- `better-auth` - Modern authentication library
- `resend` - Email delivery service

### 2. Update Environment Variables

Run the setup script:

```bash
node scripts/setup-env.js
```

Or manually add to your `.env` file:

```env
# Better Auth Configuration
BETTER_AUTH_SECRET="your-generated-secret-here"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

# Email Provider (Resend) - Optional
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

**Important**: If you don't configure Resend, OTP codes will only be printed to the terminal. This is fine for development!

### 3. Database Changes

**No migration needed!** The new system uses the existing:

- User collection structure
- Session system (Iron Session)
- All existing user data remains intact

### 4. New Routes

#### Added Routes:

- `/admin/sign-in` - Admin login with role verification + OTP
- `/api-client/auth/send-otp` - Send OTP to email
- `/api-client/auth/verify-otp` - Verify OTP code
- `/api-client/auth/admin/verify-credentials` - Verify admin credentials
- `/api-client/auth/admin/complete-signin` - Complete admin signin
- `/api-client/auth/verify-user-credentials` - Verify user credentials
- `/api-client/auth/user/complete-signin` - Complete user signin
- `/api-client/auth/[...all]` - Better Auth catch-all handler

#### Updated Routes:

- `/sign-in` - Now includes OTP verification step
- `/admin/*` - Now properly protected (requires ADMIN role)

### 5. Middleware Changes

The middleware (`middleware.ts`) now:

- Decrypts session to check role
- Redirects non-admins away from `/admin` routes
- Redirects admins to admin dashboard on login
- Separate auth pages: `/admin/sign-in` vs `/sign-in`

## Testing the New System

### Test Admin Login

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000/admin/sign-in

3. Enter admin credentials:
   - Email: your admin email
   - Password: your admin password

4. Check the terminal for OTP code:

   ```
   ==================================================
   🔐 OTP CODE GENERATED
   ==================================================
   Email: admin@example.com
   Code: 123456
   Expires: 3:45:30 PM
   ==================================================
   ```

5. Enter the 6-digit code

6. Should redirect to `/admin` dashboard

### Test User Login

1. Navigate to http://localhost:3000/sign-in

2. Enter user credentials

3. Check terminal for OTP

4. Enter OTP code

5. Should redirect to `/dashboard`

### Test Admin Protection

1. Login as a regular user

2. Try to access http://localhost:3000/admin

3. Should be redirected to `/dashboard?error=forbidden`

## Sign-Up Flow

The sign-up page still uses the old system. To add OTP to sign-up:

1. After user creates account, send OTP
2. Verify email before account activation
3. Then create session

(This can be implemented in a future update if needed)

## Troubleshooting

### OTP Not Received in Email

**Solution**: Check these:

1. Is `RESEND_API_KEY` set in `.env`?
2. Is `RESEND_FROM_EMAIL` a verified sender in Resend?
3. Check the terminal - OTP is always logged there for development

### "No OTP found for this email"

**Solution**:

- OTP expires after 10 minutes
- Request a new one using "Resend" button
- Check that email matches exactly (case-insensitive)

### Admin Routes Still Accessible

**Solution**:

- Clear browser cookies
- Restart the dev server
- Check that `SESSION_SECRET` is set in `.env`

### Middleware Errors

**Solution**:

- Ensure `SESSION_SECRET` is set
- Check that iron-session is installed
- Restart the development server

## What Was NOT Changed

To minimize risk, we kept:

- All existing user data and database structure
- The existing session system (Iron Session)
- All existing API endpoints (they still work)
- Sign-up flow (no OTP yet)
- Document upload/download functionality
- Chat/AI features
- Admin dashboard pages

## Rollback Plan

If you need to rollback:

1. Revert middleware changes
2. Revert sign-in pages to old versions
3. Remove OTP components
4. Remove new API routes

Git command:

```bash
git log --oneline  # Find commit before migration
git revert <commit-hash>
```

## Next Steps (Optional Enhancements)

1. **Add OTP to Sign-Up**
   - Verify email on registration
   - Prevent fake accounts

2. **Remember Me Option**
   - Extend session duration
   - Checkbox on login

3. **Email Templates**
   - Customize OTP email design
   - Add company branding

4. **Redis for OTP Storage**
   - Currently uses in-memory Map
   - Redis would persist across restarts

5. **SMS OTP Alternative**
   - Use Twilio for SMS delivery
   - User chooses email or SMS

6. **Backup Codes**
   - Generate recovery codes
   - Use when email unavailable

## Security Notes

🔒 **Best Practices Implemented:**

- OTP codes expire after 10 minutes
- Maximum 5 verification attempts
- Rate limiting on OTP generation
- Secure session cookies (httpOnly, sameSite)
- Password hashing with bcrypt
- Admin role verification before OTP

⚠️ **Security Recommendations:**

- Use strong `BETTER_AUTH_SECRET` (auto-generated)
- Enable HTTPS in production
- Configure Resend API key securely
- Regular security audits
- Monitor failed login attempts

## Support

For issues or questions:

1. Check the terminal for detailed error logs
2. Review the OTP printed in terminal
3. Verify all environment variables are set
4. Check the README.md for additional documentation

---

**Migration completed on**: December 2, 2025
**Better Auth version**: 1.4.4
**Status**: ✅ Ready for testing
