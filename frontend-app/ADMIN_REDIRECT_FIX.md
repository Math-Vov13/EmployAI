# Admin Redirect & Session Fix

## Issues Fixed

### 1. ❌ **OTP Verification Not Redirecting**

**Problem**: After entering the correct OTP code, the page wasn't redirecting to `/admin`

**Root Cause**: Using `router.push()` didn't properly reload the page with new session cookies

**Solution**: Changed to `window.location.href` to force a full page reload

```typescript
// Before (didn't work)
router.push("/admin");

// After (works correctly)
window.location.href = "/admin";
```

### 2. ❌ **Authenticated Admin Could Access /admin/sign-in**

**Problem**: Admin with valid session could still access the sign-in page

**Root Cause**: Middleware logic was correct, but session cookie name wasn't consistent

**Solution**: Made session cookie name consistent across all files

- Updated `session.ts` to use `process.env.SESSION_COOKIE_NAME`
- Middleware already used the environment variable
- Both now use the same cookie name: `employai.session`

---

## Changes Made

### **1. Admin Sign-In Page** (`app/(client)/(auth)/admin/sign-in/page.tsx`)

```typescript
// Changed redirect method
const handleOTPVerified = async () => {
  // ... create session ...

  setStep("complete");
  // Use window.location.href to force full page reload with new session cookies
  setTimeout(() => {
    window.location.href = "/admin";
  }, 1000);
};
```

### **2. User Sign-In Page** (`app/(client)/(auth)/sign-in/page.tsx`)

```typescript
// Applied same fix for consistency
const handleOTPVerified = async () => {
  // ... create session ...

  setStep("complete");
  // Use window.location.href to force full page reload with new session cookies
  setTimeout(() => {
    window.location.href = "/dashboard";
  }, 1000);
};
```

### **3. Session Management** (`app/lib/auth/session.ts`)

```typescript
// Added validation
if (!process.env.SESSION_COOKIE_NAME) {
  throw new Error("SESSION_COOKIE_NAME n est pas definie en env");
}

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME;

// Updated getSession()
export async function getSession() {
  return getIronSession<SessionData>(cookieStore, {
    password: process.env.SESSION_SECRET!,
    cookieName: SESSION_COOKIE_NAME, // Now uses env var
    // ...
  });
}

// Updated createSession()
export async function createSession(...) {
  const session = await getIronSession<SessionData>(cookieStore, {
    password: process.env.SESSION_SECRET!,
    cookieName: SESSION_COOKIE_NAME, // Now uses env var
    // ...
  });
}
```

---

## How It Works Now

### **Authentication Flow**

#### **Step 1: Enter Credentials**

```
Admin enters email + password
↓
POST /api-client/auth/admin/verify-credentials
↓
Validates credentials and admin role
↓
Proceeds to OTP
```

#### **Step 2: OTP Verification**

```
Admin enters 6-digit OTP
↓
POST /api-client/auth/verify-otp
↓
Validates OTP code
↓
Calls onVerified()
```

#### **Step 3: Session Creation**

```
POST /api-client/auth/admin/complete-signin
↓
Creates Iron Session with session cookie
↓
Set-Cookie: employai.session=encrypted_data
↓
Returns success response
```

#### **Step 4: Redirect**

```
window.location.href = "/admin"
↓
Full page reload (picks up new cookies)
↓
Middleware reads session from cookie
↓
Allows access to /admin
```

### **Middleware Protection**

#### **Scenario 1: Admin with Valid Session Visits /admin/sign-in**

```typescript
// middleware.ts
if (pathname.startsWith("/admin/sign-in")) {
  if (isLoggedIn && isAdmin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return response;
}
```

**Result**: ✅ Redirected to `/admin` dashboard

#### **Scenario 2: Admin with Valid Session Visits /admin**

```typescript
// middleware.ts
if (pathname.startsWith("/admin")) {
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/sign-in", request.url));
  }
  if (!isAdmin) {
    return NextResponse.redirect(
      new URL("/dashboard?error=forbidden", request.url),
    );
  }
  return response; // ✅ Allow access
}
```

**Result**: ✅ Access granted

#### **Scenario 3: Unauthenticated User Visits /admin**

```typescript
if (pathname.startsWith("/admin")) {
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/sign-in", request.url)); // ✅
  }
}
```

**Result**: ✅ Redirected to `/admin/sign-in`

#### **Scenario 4: Regular User Visits /admin**

```typescript
if (pathname.startsWith("/admin")) {
  if (!isAdmin) {
    return NextResponse.redirect(
      new URL("/dashboard?error=forbidden", request.url),
    ); // ✅
  }
}
```

**Result**: ✅ Redirected to `/dashboard?error=forbidden`

---

## Testing the Fixes

### **Test 1: OTP Redirect**

```bash
# Start dev server
npm run dev

# Create admin if needed
npm run seed:admin

# Test flow:
1. Go to http://localhost:3000/admin/sign-in
2. Enter admin email + password
3. Enter OTP code (check terminal)
4. Should show "Authentication Successful" for 1 second
5. Should redirect to http://localhost:3000/admin ✅
```

### **Test 2: Already Logged-In Admin**

```bash
# After signing in successfully:
1. Try to visit http://localhost:3000/admin/sign-in
2. Should immediately redirect to /admin ✅

# Also test:
1. Close browser tab
2. Reopen and go to http://localhost:3000/admin
3. If "Remember Me" was checked: should stay logged in ✅
4. If "Remember Me" was NOT checked: should redirect to /admin/sign-in ✅
```

### **Test 3: Session Cookie**

```bash
# In browser DevTools:
1. Open Application/Storage → Cookies
2. Should see: employai.session
3. Value should be encrypted string
4. If Remember Me: Expires in ~7 days
5. If NOT Remember Me: Expires = Session ✅
```

### **Test 4: Middleware Protection**

```bash
# Test unauthorized access:
1. Clear cookies (sign out)
2. Try to access http://localhost:3000/admin
3. Should redirect to /admin/sign-in ✅

# Test regular user:
1. Sign in as regular user
2. Try to access http://localhost:3000/admin
3. Should redirect to /dashboard?error=forbidden ✅
```

---

## Environment Variables

Ensure these are set in `.env`:

```env
# Session Configuration
SESSION_SECRET="your-32-character-secret-here"
SESSION_COOKIE_NAME="employai.session"

# MongoDB
MONGODB_URI="mongodb+srv://..."
MONGODB_DB_NAME="employai"

# Other auth variables...
```

---

## Common Issues & Solutions

### **Issue 1: Still not redirecting after OTP**

**Check**:

- Browser console for JavaScript errors
- Network tab for failed requests
- Cookie is being set (Application → Cookies)

**Solution**:

```bash
# Clear all cookies and try again
# Or use incognito mode
```

### **Issue 2: "SESSION_COOKIE_NAME not defined" error**

**Check**: `.env` file has the variable

**Solution**:

```bash
# Add to .env
SESSION_COOKIE_NAME="employai.session"

# Restart dev server
npm run dev
```

### **Issue 3: Keeps asking to sign in**

**Check**:

- Cookie is being created (DevTools → Application → Cookies)
- SESSION_SECRET is consistent (don't change it)
- Browser isn't blocking cookies

**Solution**:

```bash
# Verify env vars
echo $SESSION_SECRET
echo $SESSION_COOKIE_NAME

# Check browser cookie settings
# Allow cookies for localhost
```

### **Issue 4: Can still access /admin/sign-in when logged in**

**Check**:

- Session cookie name matches in middleware and session.ts
- Both use `process.env.SESSION_COOKIE_NAME`

**Solution**:

```bash
# Verify cookie names match
grep -r "employai.session" app/lib/auth/
grep -r "SESSION_COOKIE_NAME" middleware.ts

# Should all use process.env.SESSION_COOKIE_NAME
```

---

## Technical Details

### **Why `window.location.href` Instead of `router.push()`?**

**`router.push()`** (Client-side):

- Changes URL without full page reload
- Uses React Router's client-side navigation
- May not pick up new cookies immediately
- Can cause session state issues

**`window.location.href`** (Full reload):

- Forces complete page reload
- Browser fetches all resources fresh
- Picks up new cookies immediately
- Middleware runs on fresh request
- ✅ More reliable for auth flows

### **Session Cookie Details**

```typescript
{
  name: "employai.session",
  value: "encrypted_iron_session_data",
  httpOnly: true,      // ✅ Not accessible via JavaScript
  secure: true,        // ✅ HTTPS only (in production)
  sameSite: "strict",  // ✅ CSRF protection
  maxAge: 604800,      // 7 days (if Remember Me)
  path: "/"            // ✅ Available to all routes
}
```

### **Iron Session Encryption**

- Session data is encrypted using `SESSION_SECRET`
- Data includes: userId, email, name, role, isLoggedIn, googleId
- Cannot be tampered with (crypto signature verification)
- Even if cookie is intercepted, data is encrypted

---

## Summary

✅ **Fixed Issues**:

1. OTP verification now properly redirects to /admin
2. Authenticated admins are redirected away from /admin/sign-in
3. Session cookie name is consistent across all files
4. Full page reload ensures cookies are picked up correctly

✅ **Improvements**:

- Better session management
- More consistent cookie handling
- Proper environment variable usage
- Reliable authentication flow

✅ **Security**:

- HttpOnly cookies (JavaScript can't access)
- Encrypted session data
- CSRF protection via SameSite
- Secure cookies in production

---

## Next Steps

1. ✅ Test the complete sign-in flow
2. ✅ Verify middleware redirects work
3. ✅ Check Remember Me functionality
4. ✅ Test session persistence
5. ✅ Verify admin dashboard access

Your authentication system should now work flawlessly! 🎉
