# OAuth Token Refresh Fix - March 12, 2026

## Problem Summary
After login, users experienced `CLIENT_FETCH_ERROR` and API calls to Discord returned 401 errors (`[User Guilds] Discord returned 401`). This occurred because:

1. **No token refresh logic**: Discord OAuth access tokens expire (typically after 7 days), but the application wasn't handling token refresh
2. **No expiry tracking**: The app didn't store the token expiration timestamp
3. **No error recovery**: When tokens expired, there was no mechanism to obtain new ones using the refresh token

## Changes Made

### 1. Enhanced NextAuth Configuration ([lib/auth.ts](lib/auth.ts))

**Added:**
- `refreshToken` storage in JWT
- `accessTokenExpires` timestamp tracking
- `refreshAccessToken()` function that uses Discord's OAuth2 token endpoint
- Automatic token refresh when expired (checked on every request)
- Error state (`RefreshAccessTokenError`) when refresh fails

**How it works:**
- On initial sign-in: Stores `accessToken`, `refreshToken`, and `accessTokenExpires`
- On subsequent requests: Checks if token is still valid
- If expired: Automatically calls Discord's `/oauth2/token` endpoint with the refresh token
- If refresh fails: Sets error state to prompt re-authentication

### 2. Improved Error Handling ([lib/permissions.ts](lib/permissions.ts))

**Enhanced `getAccessTokenFromRequest()`:**
- Added detailed logging when JWT token is missing
- Logs when JWT exists but has no accessToken field
- Better error diagnostics for debugging

**Enhanced `fetchUserGuilds()`:**
- Detailed logging of Discord API errors including status text
- Special handling for 401 errors with specific log message
- Attempts to log error response body for debugging

### 3. Client-Side Session Error Handling ([app/dashboard/page.tsx](app/dashboard/page.tsx))

**Added:**
- Detection of session errors (when token refresh fails)
- Disabled guild fetching when session has errors
- Beautiful error UI showing "Session Expired" message
- One-click re-authentication button

## How Token Refresh Works

```
┌─────────────────────────────────────────────────────────────┐
│ User Request → JWT Check                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Check if accessTokenExpires > now                       │
│     ├─ YES → Return existing accessToken                    │
│     └─ NO  → Token expired, proceed to step 2               │
│                                                             │
│  2. Check if refreshToken exists                            │
│     ├─ YES → Call Discord OAuth2 /token endpoint            │
│     │        with grant_type=refresh_token                  │
│     │        ├─ SUCCESS → Get new accessToken + refreshToken│
│     │        │            Update expiry time                │
│     │        │            Return new accessToken            │
│     │        └─ FAIL    → Set error="RefreshAccessTokenError"│
│     │                     User must re-authenticate          │
│     └─ NO  → Set error="NoRefreshToken"                     │
│              User must re-authenticate                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Testing Instructions

### Test 1: Fresh Login
1. Sign out completely
2. Sign in with Discord
3. Check browser console - should see `[Auth] New sign-in, storing OAuth tokens`
4. Dashboard should load with all guilds visible
5. No `[User Guilds] Discord returned 401` errors

### Test 2: Token Expiration (Simulated)
To test token refresh without waiting 7 days:

**Manual method:**
1. Open browser DevTools → Application → Cookies
2. Find the `next-auth.session-token` cookie
3. Decode its JWT payload (use jwt.io)
4. Note the expiry time is set correctly

**Or modify code temporarily for testing:**
```typescript
// In lib/auth.ts, change line ~88:
t.accessTokenExpires = Date.now() + 10000 // Expire in 10 seconds
```

Then:
1. Login
2. Wait 10+ seconds
3. Refresh the page or navigate to a new guild
4. Check logs - should see `[Auth] Access token expired, attempting refresh`
5. Should see `[Auth] Successfully refreshed access token`
6. Dashboard continues working normally

### Test 3: Failed Refresh (Simulated)
1. Login normally
2. Manually invalidate the refresh token in Discord Developer Portal
3. Wait for token to expire (or force expiry as above)
4. Try to access dashboard
5. Should see "Session Expired" screen with re-authentication button

## Environment Variables Required

Ensure these are set in `.env.local`:
```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
DISCORD_CLIENT_ID=your-client-id
DISCORD_CLIENT_SECRET=your-client-secret
DISCORD_BOT_TOKEN=your-bot-token
```

## Monitoring & Logs

### Success Indicators:
```
[Auth] New sign-in, storing OAuth tokens
[Auth] Successfully refreshed access token
[Bot Guilds] Fetched 83 guilds
[/api/guilds] userGuilds=10 botGuilds=83
```

### Warning Indicators:
```
[Auth] Access token expired, attempting refresh  ← Normal, not an error
[Auth] No JWT token found in request             ← User not signed in
```

### Error Indicators:
```
[Auth] Token refresh failed: ...                 ← Refresh token is invalid
[Auth] No refresh token available                ← Missing from JWT
[User Guilds] Token is invalid or expired        ← Discord rejected token
```

## Security Considerations

✅ **Access tokens never sent to client** - Only stored in HTTP-only JWT cookie
✅ **Refresh tokens never exposed** - Server-side only
✅ **Automatic token rotation** - New refresh tokens on each refresh
✅ **Graceful failure** - Prompts re-auth instead of breaking
✅ **CORS protection** - All API routes protected
✅ **Rate limiting** - 60 requests/min per IP

## Rollback Instructions

If issues occur, revert these files:
1. `lib/auth.ts` - Remove refresh logic, restore simple JWT callback
2. `lib/permissions.ts` - Remove enhanced logging
3. `app/dashboard/page.tsx` - Remove session error check

## Next Steps (Optional Enhancements)

1. **Background refresh**: Refresh tokens 5 minutes before expiry proactively
2. **Silent refresh**: Use iframe technique to refresh without user interaction
3. **Token revocation**: Implement sign-out endpoint that revokes Discord token
4. **Multi-tab sync**: Broadcast token refresh across browser tabs
5. **Metrics**: Track refresh success rate and failure patterns

---

**Changed Files:**
- `lib/auth.ts` - OAuth refresh logic
- `lib/permissions.ts` - Enhanced error logging  
- `app/dashboard/page.tsx` - Session error UI

**No database migrations required** ✓
**No breaking API changes** ✓
**Backward compatible** ✓
