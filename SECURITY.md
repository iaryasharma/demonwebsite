# Security Documentation

## Overview
This document outlines the security measures implemented in the Demon Bot Dashboard to protect the Discord bot token and prevent unauthorized access.

## 🔒 Critical Security Measures

### 1. Bot Token Protection
✅ **IMPLEMENTED**
- Bot token is stored as `DISCORD_BOT_TOKEN` (NOT `NEXT_PUBLIC_*`)
- Token is ONLY accessible server-side via `process.env.DISCORD_BOT_TOKEN`
- Token is NEVER exposed in API responses
- Token is NEVER sent to the client/browser
- Error messages sanitized to not reveal token configuration status

### 2. Authentication & Authorization
✅ **IMPLEMENTED**
- NextAuth.js OAuth2 with Discord provider
- All API routes (except public ones) require authentication via middleware
- Guild-specific routes verify user has `MANAGE_GUILD` or `ADMINISTRATOR` permissions
- Middleware enforces authentication on `/api/guilds/*` routes
- Dashboard routes require valid session

**Public API Routes** (no auth required):
- `/api/auth/*` - NextAuth endpoints
- `/api/bot-stats` - Public stats widget (rate-limited)

### 3. CORS Protection
✅ **IMPLEMENTED**
- Middleware enforces CORS allowlist
- Only allowed origins in production:
  - Your production URL (`process.env.NEXTAUTH_URL`)
  - `https://demonbot.vercel.app`
- Development: `http://localhost:3000`
- Rejects cross-origin requests from unknown origins with 403

### 4. Rate Limiting
✅ **IMPLEMENTED**
- In-memory sliding window rate limiter
- Limits per category:
  - Auth routes: 10 req/min
  - Stats routes: 20 req/min
  - Guild routes: 60 req/min
  - Default: 30 req/min
- Keyed by IP address + route category
- Returns 429 with `Retry-After` header when exceeded

### 5. Input Validation & Sanitization
✅ **IMPLEMENTED**
- **Guild ID validation**: Snowflake regex (`/^\d{17,20}$/`)
- **NoSQL injection prevention**: `hasMongoOperators()` blocks `$where`, `$regex`, etc.
- **Body size limits**: 10KB max for most routes, 5KB for webhooks
- **Field allowlisting**: `pickAllowed()` prevents mass-assignment attacks
- **String sanitization**: Strips null bytes and control characters
- **MongoDB ObjectId validation**: 24-char hex pattern check

### 6. Security Headers
✅ **IMPLEMENTED** (via `next.config.mjs` and middleware)
```
Content-Security-Policy
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), ...
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-XSS-Protection: 1; mode=block
```

### 7. API Response Security
✅ **IMPLEMENTED**
- No caching on API routes (`Cache-Control: no-store`)
- No indexing of API routes (`X-Robots-Tag: noindex, nofollow`)
- Generic error messages (don't leak implementation details)
- Errors logged server-side only, not exposed to client

## 🔐 Environment Variables

### Required Variables
```env
# Discord OAuth2 (for user authentication)
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# Discord Bot Token (CRITICAL - NEVER EXPOSE)
DISCORD_BOT_TOKEN=your_bot_token_here

# NextAuth.js
NEXTAUTH_SECRET=random_32_char_string
NEXTAUTH_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb+srv://...
```

### Variable Security Rules
1. ✅ Never prefix secrets with `NEXT_PUBLIC_`
2. ✅ Use different tokens for dev/staging/production
3. ✅ Rotate secrets regularly
4. ✅ Never commit `.env` files to git
5. ✅ Use platform-specific secret managers (Vercel Env Vars)

## 🚫 Common Attack Vectors - PROTECTED

### 1. Bot Token Theft via API
**Attack**: User calls API hoping to get bot token in response  
**Protection**: 
- Token never returned in any API response
- Token only used server-side for Discord API calls
- Error messages don't reveal token status

### 2. Unauthorized Guild Access
**Attack**: User tries to access guild they don't manage  
**Protection**:
- `requireManageGuild()` verifies user has permissions
- Uses user's OAuth access token to check Discord permissions
- Guild ID validated as snowflake before database queries

### 3. NoSQL Injection
**Attack**: User sends `{"$where": "malicious_code"}` in API body  
**Protection**:
- `hasMongoOperators()` recursively checks for `$` operators
- Rejects entire request if operators found
- Input sanitization strips dangerous characters

### 4. Mass Assignment
**Attack**: User sends extra fields to overwrite protected properties  
**Protection**:
- `pickAllowed()` uses strict allowlists per model
- Only whitelisted fields are written to database
- Extra fields silently dropped

### 5. Cross-Site Request Forgery (CSRF)
**Attack**: Malicious site submits forged requests  
**Protection**:
- NextAuth has built-in CSRF protection
- CORS enforcement blocks cross-origin API calls
- Same-site cookies by default

### 6. Brute Force Authentication
**Attack**: Automated login attempts  
**Protection**:
- Rate limiting on `/api/auth/*` (10 req/min)
- NextAuth session-based auth (no passwords to brute force)
- OAuth2 flow delegates to Discord's security

### 7. Webhook URL Abuse
**Attack**: User tries to execute arbitrary webhooks  
**Protection**:
- Webhook URLs validated with regex
- Must match `https://discord.com/api/webhooks/\d+/.+`
- Rate limited to 5 sends per guild per minute
- Payload size limited to 5KB

## 📋 Security Checklist for Deployment

### Before Production
- [ ] All environment variables set in platform dashboard (Vercel/etc)
- [ ] `NEXTAUTH_SECRET` is cryptographically random (32+ chars)
- [ ] `DISCORD_BOT_TOKEN` is NOT prefixed with `NEXT_PUBLIC_`
- [ ] Production URLs added to CORS allowlist in middleware
- [ ] `.env` files added to `.gitignore`
- [ ] No bot token in git history (if leaked, rotate immediately)

### Monitoring
- [ ] Set up error logging (e.g., Sentry)
- [ ] Monitor rate limit hits (unusual patterns)
- [ ] Review server logs for `[SECURITY]` prefixed errors
- [ ] Monitor Discord API rate limits

### Regular Maintenance
- [ ] Rotate `DISCORD_BOT_TOKEN` every 6 months
- [ ] Rotate `NEXTAUTH_SECRET` yearly
- [ ] Update dependencies for security patches
- [ ] Review and update CORS allowlist as needed

## 🛡️ Incident Response

### If Bot Token is Compromised
1. **IMMEDIATELY** regenerate token in Discord Developer Portal
2. Update `DISCORD_BOT_TOKEN` in production environment
3. Invalidate all active sessions (optional)
4. Review access logs for suspicious activity
5. Check git history - if token was committed, consider the repo tainted

### If Unauthorized Access Detected
1. Check rate limit logs for IP patterns
2. Review middleware auth logs
3. Verify user permissions in Discord
4. Consider temporarily blocking problematic IPs (infrastructure level)

## 🔍 Code Review Guidelines

When reviewing PRs, ensure:
1. No `process.env` variables with `NEXT_PUBLIC_` prefix for secrets
2. All new API routes have authentication checks
3. User input is validated before database operations
4. No secrets logged to console
5. Error messages don't reveal system internals
6. New routes added to rate limit categories if needed

## 📚 Additional Resources

- [Next.js Security Best Practices](https://nextjs.org/docs/pages/building-your-application/configuring/security-headers)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Discord Developer Best Practices](https://discord.com/developers/docs/topics/oauth2#bot-vs-user-accounts)
- [NextAuth.js Security](https://next-auth.js.org/configuration/options#security)

## ⚡ Quick Reference

### Checking Auth in API Route
```typescript
import { getAccessTokenFromRequest, requireManageGuild } from "@/lib/permissions"

export async function GET(request: Request, { params }: { params: Promise<{ guildId: string }> }) {
    const accessToken = await getAccessTokenFromRequest(request)
    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guildId } = await params
    
    if (!(await requireManageGuild(accessToken, guildId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    // Your route logic here
}
```

### Using Bot Token Safely
```typescript
const token = process.env.DISCORD_BOT_TOKEN
if (!token) {
    console.error("[SECURITY] DISCORD_BOT_TOKEN not configured")
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 })
}

// Use token only for Discord API calls
const res = await fetch(`https://discord.com/api/v10/...`, {
    headers: { Authorization: `Bot ${token}` }
})
// NEVER return token in response
```

## 📞 Contact

For security concerns or to report vulnerabilities, please contact:
- Create a private security advisory on GitHub
- Email: [your-security-email@domain.com]

---

**Last Updated**: March 12, 2026  
**Security Review**: Completed
