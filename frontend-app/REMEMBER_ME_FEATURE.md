# Remember Me Feature Documentation

## Overview

The "Remember Me" feature allows users to choose whether their session should persist after closing the browser or expire immediately.

**Implementation Date**: December 2, 2025

---

## How It Works

### User Experience

When signing in (both user and admin), there's a checkbox labeled **"Remember me for 7 days"**:

- **Unchecked (Default)**: Session expires when the browser is closed
- **Checked**: Session persists for 7 days, even after closing the browser

### Technical Implementation

The feature uses Iron Session cookies with dynamic `maxAge` values:

```typescript
// Remember Me = false (default)
maxAge: undefined; // Session cookie - expires when browser closes

// Remember Me = true
maxAge: 7 * 24 * 60 * 60; // 604800 seconds = 7 days
```

---

## Files Modified

### 1. User Sign-In Page

**File**: `app/(client)/(auth)/sign-in/page.tsx`

**Changes**:

- Added `rememberMe` state (default: `false`)
- Added checkbox UI below password field
- Passes `rememberMe` to `/api-client/auth/user/complete-signin` endpoint

```tsx
const [rememberMe, setRememberMe] = useState(false);

// In the form:
<div className="flex items-center">
  <input
    id="remember-me"
    type="checkbox"
    checked={rememberMe}
    onChange={(e) => setRememberMe(e.target.checked)}
  />
  <label htmlFor="remember-me">Remember me for 7 days</label>
</div>;

// In handleOTPVerified:
body: JSON.stringify({ email, rememberMe });
```

### 2. Admin Sign-In Page

**File**: `app/(client)/(auth)/admin/sign-in/page.tsx`

**Changes**: Same as user sign-in

- Added `rememberMe` state
- Added checkbox UI
- Passes `rememberMe` to `/api-client/auth/admin/complete-signin`

### 3. Session Module

**File**: `app/lib/auth/session.ts`

**Changes**:

- Updated `createSession()` function signature to accept `rememberMe: boolean` parameter
- Dynamic `maxAge` calculation based on `rememberMe` flag
- Creates session-specific Iron Session instance with custom cookie options

```typescript
export async function createSession(
  userId: string,
  email: string,
  name: string,
  role: "USER" | "ADMIN",
  googleId?: string,
  rememberMe: boolean = false, // NEW PARAMETER
) {
  const maxAge = rememberMe ? 7 * 24 * 60 * 60 : undefined;

  const session = await getIronSession<SessionData>(cookieStore, {
    // ... other options
    cookieOptions: {
      // ... other options
      maxAge: maxAge, // Dynamic based on rememberMe
    },
  });

  // ... set session data and save
}
```

### 4. User Complete Sign-In Endpoint

**File**: `app/(server)/api-client/auth/user/complete-signin/route.ts`

**Changes**:

- Accepts `rememberMe` parameter from request body
- Passes `rememberMe` to `createSession()`

```typescript
const { email, rememberMe = false } = body;

await createSession(
  user._id!.toString(),
  user.email,
  user.name,
  user.role,
  user.googleId,
  rememberMe, // NEW PARAMETER
);
```

### 5. Admin Complete Sign-In Endpoint

**File**: `app/(server)/api-client/auth/admin/complete-signin/route.ts`

**Changes**: Same as user endpoint

- Accepts `rememberMe` parameter
- Passes to `createSession()`

---

## Session Behavior

### Session Cookie (Remember Me = false)

```
Cookie: employai_session=...
Attributes:
  - HttpOnly: true
  - Secure: true (in production)
  - SameSite: strict
  - Path: /
  - MaxAge: undefined ← Expires when browser closes
```

**Behavior**:

- ✅ Session valid until browser/tab is closed
- ✅ Lost on browser restart
- ✅ Secure against XSS (httpOnly)
- ✅ Secure against CSRF (sameSite: strict)

### Persistent Cookie (Remember Me = true)

```
Cookie: employai_session=...
Attributes:
  - HttpOnly: true
  - Secure: true (in production)
  - SameSite: strict
  - Path: /
  - MaxAge: 604800 ← 7 days (in seconds)
```

**Behavior**:

- ✅ Session valid for 7 days
- ✅ Persists across browser restarts
- ✅ Secure against XSS (httpOnly)
- ✅ Secure against CSRF (sameSite: strict)
- ✅ Auto-expires after 7 days

---

## Testing Guide

### Test 1: Default Behavior (Unchecked)

1. Go to `/sign-in` or `/admin/sign-in`
2. Enter credentials
3. **Leave checkbox unchecked**
4. Complete OTP verification
5. Close the browser completely
6. Reopen browser
7. Navigate to `/dashboard` or `/admin`

**Expected**: Should redirect to login page (session lost)

### Test 2: Remember Me (Checked)

1. Go to `/sign-in` or `/admin/sign-in`
2. Enter credentials
3. **Check "Remember me for 7 days"**
4. Complete OTP verification
5. Close the browser completely
6. Reopen browser
7. Navigate to `/dashboard` or `/admin`

**Expected**: Should stay logged in (session persists)

### Test 3: Expiration After 7 Days

1. Sign in with "Remember me" checked
2. Wait 7 days (or modify system clock)
3. Try to access protected route

**Expected**: Session expired, redirected to login

### Test 4: Manual Logout

1. Sign in with "Remember me" checked
2. Click logout
3. Session should be destroyed regardless of remember me

**Expected**: Logged out, session cleared

---

## Security Considerations

### ✅ Implemented Security Features

1. **HttpOnly Cookie**: JavaScript cannot access the session cookie
2. **Secure Flag**: Cookie only sent over HTTPS in production
3. **SameSite=Strict**: Prevents CSRF attacks
4. **Session Encryption**: Iron Session encrypts all session data
5. **No Sensitive Data**: Only user ID and metadata stored in session

### ⚠️ Important Notes

1. **7-Day Limit**: Keep sessions to 7 days maximum to balance UX and security
2. **Forced Logout**: Consider implementing "Force logout all devices" feature
3. **Activity Tracking**: Consider logging last active time
4. **IP Validation**: Could add IP-based validation (not implemented)
5. **Device Tracking**: Could track devices (not implemented)

### 🔐 Best Practices

1. **Always use HTTPS in production** - Cookies marked as `Secure`
2. **Rotate secrets regularly** - Update `SESSION_SECRET` periodically
3. **Monitor for suspicious activity** - Log login attempts
4. **Implement account lockout** - After X failed attempts
5. **Add session management UI** - Let users see/revoke active sessions

---

## Future Enhancements

### Priority 1: Session Management

- [ ] Show active sessions in user dashboard
- [ ] Allow users to revoke sessions
- [ ] Show last login time and IP
- [ ] "Logout all devices" button

### Priority 2: Advanced Security

- [ ] Track device fingerprint
- [ ] Detect suspicious logins (new location/device)
- [ ] Email notifications for new logins
- [ ] Optional IP-based session validation

### Priority 3: UX Improvements

- [ ] "This is a public device" mode (never remember)
- [ ] Custom session duration (1 day, 7 days, 30 days)
- [ ] Show session expiry countdown
- [ ] "Keep me logged in" alternative label

### Priority 4: Analytics

- [ ] Track remember me usage rate
- [ ] Monitor session duration analytics
- [ ] Session revocation reasons
- [ ] Login pattern analysis

---

## API Contract

### POST /api-client/auth/user/complete-signin

**Request Body**:

```json
{
  "email": "user@example.com",
  "rememberMe": false // Optional, defaults to false
}
```

**Response**:

```json
{
  "success": true,
  "message": "Sign-in complete"
}
```

**Cookie Set**:

```
Set-Cookie: employai_session=<encrypted_data>; HttpOnly; Secure; SameSite=Strict; Path=/; MaxAge=<varies>
```

### POST /api-client/auth/admin/complete-signin

Same contract as user endpoint.

---

## Troubleshooting

### Issue: Session Lost Even With Remember Me Checked

**Possible Causes**:

1. Browser in private/incognito mode
2. Browser set to clear cookies on exit
3. Server restarted (sessions may be lost if not using persistent store)
4. Cookie blocked by browser settings

**Solution**:

- Check browser cookie settings
- Verify `employai_session` cookie exists and has `MaxAge`
- Check browser developer tools → Application → Cookies

### Issue: Session Persists When Shouldn't

**Possible Causes**:

1. Checkbox was checked during login
2. Old session still active
3. Cache issue

**Solution**:

- Clear browser cookies
- Check if checkbox is unchecked
- Verify cookie has no `MaxAge` attribute

### Issue: Session Expires Before 7 Days

**Possible Causes**:

1. Server clock mismatch
2. Cookie cleared by browser
3. Session secret changed

**Solution**:

- Check server time is correct
- Verify `SESSION_SECRET` hasn't changed
- Check browser cookie retention settings

---

## Code Flow Diagram

```
┌─────────────────┐
│  User Sign In   │
│   /sign-in      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ Enter credentials           │
│ [✓] Remember me for 7 days  │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ POST /verify-credentials    │
│ (email, password)           │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ POST /send-otp              │
│ (email)                     │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ User enters OTP code        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ POST /verify-otp            │
│ (email, code)               │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ POST /complete-signin       │
│ (email, rememberMe: true)   │ ← Remember Me passed here
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ createSession()             │
│ maxAge = 7 days             │ ← Session duration set
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Set-Cookie: employai_session│
│ MaxAge=604800               │ ← Cookie with 7-day expiry
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Redirect to /dashboard      │
│ Session persists 7 days     │
└─────────────────────────────┘
```

---

## Changelog

### v1.0.0 - December 2, 2025

- ✅ Initial implementation
- ✅ Added checkbox to user sign-in
- ✅ Added checkbox to admin sign-in
- ✅ Dynamic session duration based on checkbox
- ✅ 7-day persistent sessions
- ✅ Session cookies when unchecked
- ✅ Documentation created

---

**Author**: Claude Code (Anthropic)
**Last Updated**: December 2, 2025
**Status**: ✅ Production Ready
