# Transcript API Security Documentation

## Overview
The transcript creation API is designed to securely receive HTML transcripts from your Discord bot hosted separately from the website. This document explains the security measures in place.

## Security Architecture

### 1. **Bearer Token Authentication** ✅
The API endpoint requires a Bearer token for authentication:

**API Endpoint:** `POST /api/guilds/[guildId]/tickets/[ticketId]/transcript`

**Authentication Check:**
```typescript
const authHeader = request.headers.get("authorization")
const botToken = process.env.BOT_TOKEN

if (!authHeader || !botToken || authHeader !== `Bearer ${botToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
```

**Bot Request:**
```javascript
const response = await fetch(`${webhookUrl}/api/guilds/${guildId}/tickets/${ticketId}/transcript`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BOT_TOKEN}`
    },
    body: JSON.stringify({ html, channelId, messageCount, generatedBy })
});
```

### 2. **Environment Variable Protection**
- The `BOT_TOKEN` is stored in environment variables (`.env` files)
- Never committed to version control
- Both bot and website must have the same token configured
- Token is validated on every request

### 3. **Data Validation**
The API validates all incoming data:
```typescript
- Requires: html, channelId, generatedBy
- Verifies ticket exists in database
- Confirms ticket belongs to the specified guild
- Generates unique transcript IDs
```

### 4. **Guild Verification**
```typescript
// Verify ticket exists
const ticket = await Ticket.findByTicketId(ticketId)
if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
}

// Verify guild ownership
if (ticket.guildId !== guildId) {
    return NextResponse.json({ error: "Ticket does not belong to this guild" }, { status: 400 })
}
```

## Why This Is Secure

### ❌ Without Authorization Token
If someone tries to call the API without the token:
```bash
curl -X POST https://demonbot.vercel.app/api/guilds/.../transcript \
  -H "Content-Type: application/json" \
  -d '{"html": "...", ...}'

# Result: 401 Unauthorized
```

### ✅ With Valid Token (Bot Only)
Only requests with the correct Bearer token can create transcripts:
```bash
curl -X POST https://demonbot.vercel.app/api/guilds/.../transcript \
  -H "Authorization: Bearer YOUR_SECRET_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"html": "...", ...}'

# Result: 201 Created
```

## Best Practices

### 1. **Strong Token Generation**
Generate a strong, random token for `BOT_TOKEN`:
```bash
# Example: Generate a secure random token
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. **Token Rotation**
If you suspect your token has been compromised:
1. Generate a new token
2. Update `.env` files on both bot and website
3. Restart both services
4. Old token becomes invalid immediately

### 3. **Environment File Security**
Ensure `.env` files are:
- Added to `.gitignore`
- Not committed to version control
- Only accessible to authorized deployment environments
- Properly configured on hosting platforms (Vercel, Railway, etc.)

### 4. **Monitoring**
Monitor your API logs for:
- Repeated 401 Unauthorized responses (potential attack)
- Unusual transcript creation patterns
- Requests from unexpected sources

## Configuration Files

### Bot `.env` (demon-v5/.env)
```env
BOT_TOKEN=your-discord-bot-token-here
DISCORD_CLIENT_ID=your-client-id
DISCORD_CLIENT_SECRET=your-client-secret
MONGO_URI=your-mongodb-connection-string
```

### Website `.env.local` (demonwebsite/.env.local)
```env
BOT_TOKEN=your-discord-bot-token-here
NEXTAUTH_URL=https://demonbot.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret
DISCORD_CLIENT_ID=your-client-id
DISCORD_CLIENT_SECRET=your-client-secret
MONGODB_URI=your-mongodb-connection-string
```

**Important:** The `BOT_TOKEN` must match on both sides!

## Transcript Viewing Security

### Public Transcript Pages
Transcripts are viewable at `/transcript/[transcriptId]` but require:
1. **Discord Authentication:** User must be logged in via Discord
2. **Session Validation:** Active NextAuth session required
3. **Beautiful Auth Prompt:** Unauthenticated users see a Discord-branded login prompt

### Code Implementation:
```typescript
const { data: session, status } = useSession()

if (status === "loading") {
    return <LoadingState />
}

if (!session) {
    return <DiscordLoginPrompt />
}

// Show transcript
return <div dangerouslySetInnerHTML={{ __html: transcript.html }} />
```

## Additional Security Layers

### 1. **Rate Limiting** (Optional Enhancement)
You can add rate limiting to the transcript API:
```typescript
import { rateLimit } from "@/lib/rate-limit"

const limiter = rateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 500,
})

export async function POST(request: Request) {
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous"
    
    try {
        await limiter.check(10, ip) // 10 requests per minute
    } catch {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }
    
    // Continue with authentication...
}
```

### 2. **IP Whitelisting** (Advanced)
For extra security, whitelist your bot server's IP:
```typescript
const ALLOWED_IPS = process.env.BOT_SERVER_IPS?.split(',') || []

const clientIp = request.headers.get("x-forwarded-for") ?? "unknown"
if (ALLOWED_IPS.length > 0 && !ALLOWED_IPS.includes(clientIp)) {
    return NextResponse.json({ error: "Unauthorized IP" }, { status: 403 })
}
```

### 3. **Request Signature Verification** (Advanced)
Add HMAC signature verification for extra security:
```typescript
// Bot signs the request
const crypto = require('crypto')
const signature = crypto
    .createHmac('sha256', process.env.BOT_TOKEN)
    .update(JSON.stringify(payload))
    .digest('hex')

// Include in header
headers['X-Signature'] = signature

// Website verifies signature
const expectedSignature = crypto
    .createHmac('sha256', process.env.BOT_TOKEN)
    .update(bodyText)
    .digest('hex')

if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
}
```

## Deployment Checklist

✅ Bot and website have matching `BOT_TOKEN` in their `.env` files
✅ `.env` files are in `.gitignore`
✅ Environment variables configured on hosting platforms
✅ Bot token is strong and randomly generated
✅ API endpoint only accessible via HTTPS
✅ Transcript viewing requires Discord authentication
✅ Database properly secured with authentication

## Threat Model

| Attack Vector | Mitigation |
|--------------|------------|
| Unauthorized transcript creation | Bearer token authentication |
| Token theft from source code | Environment variables, not in git |
| Brute force token guessing | Use 256-bit random tokens |
| Man-in-the-middle attacks | HTTPS only (Vercel provides this) |
| Cross-guild transcript injection | Guild ID validation in database |
| Viewing others' transcripts | Discord auth + unique IDs |
| API abuse/spam | Rate limiting (optional) |

## Conclusion

Your transcript API is **already secured** with Bearer token authentication. As long as:
1. `BOT_TOKEN` is kept secret
2. Token is strong and random
3. Environment variables are properly configured
4. `.env` files are not committed to git

...the API cannot be abused by external parties. Only your bot with the correct token can create transcripts.

---

**Questions or Concerns?** Review this document and verify:
- Both `.env` files have `BOT_TOKEN` configured
- Token is not exposed in source code
- API returns 401 when called without the token
