# Transcript Integration Setup

This guide explains how to integrate the Discord bot's HTML transcript functionality with the website.

## Overview

When staff generate transcripts using `/ticket transcript` or the Transcript button, the bot will:
1. Generate an HTML transcript of the ticket conversation
2. Save it to the website database via API
3. Provide a shareable link to view the transcript online

## Required Environment Variables

### Bot (.env)

Add these variables to your bot's `.env` file:

```env
# Bot Token (used for API authentication)
BOT_TOKEN=your-bot-token-here
```

**Note:** The website URL is hardcoded to `https://demonbot.vercel.app` in the bot code.

### Website (.env.local)

Add this variable to your website's `.env.local` file:

```env
# Bot Token (must match the bot's token for authentication)
BOT_TOKEN=your-bot-token-here
```

## How It Works

### 1. Transcript Generation

When a staff member uses `/ticket transcript` command:
- Bot fetches ticket messages
- Generates styled HTML transcript
- POSTs transcript to website API: `/api/guilds/{guildId}/tickets/{ticketId}/transcript`
- Receives back a transcript URL: `https://yourdomain.com/transcript/{transcriptId}`
- Displays link in Discord embed and log channel

### 2. Viewing Transcripts

Users can view transcripts by:
- Clicking the "View Online" link in Discord
- Accessing the URL directly: `/transcript/{transcriptId}`
- Viewing from the dashboard tickets page (shows transcript link on closed tickets)

**Authentication Required:** Users must be signed in with Discord to view transcripts. Unauthenticated users will see a login prompt.

### 3. Security

- API endpoint requires bot token authentication
- Transcripts require Discord authentication to view (login required)
- No sensitive Discord tokens or user data in transcripts
- Transcripts are stored permanently in MongoDB
- Website URL is hardcoded to `https://demonbot.vercel.app` in the bot

## API Endpoints

### POST `/api/guilds/{guildId}/tickets/{ticketId}/transcript`

Save a new transcript.

**Authentication:** Bearer token (bot token)

**Request Body:**
```json
{
  "html": "<html>...</html>",
  "channelId": "123456789",
  "messageCount": 50,
  "generatedBy": "userId"
}
```

**Response:**
```json
{
  "success": true,
  "transcriptId": "transcript-1234567890-abcdef",
  "transcriptUrl": "https://yourdomain.com/transcript/transcript-1234567890-abcdef"
}
```

### GET `/api/transcripts/{transcriptId}`

Get transcript data (public endpoint).

**Response:**
```json
{
  "transcriptId": "transcript-1234567890-abcdef",
  "ticketId": "ticket-1234567890",
  "html": "<html>...</html>",
  "messageCount": 50,
  "generatedAt": "2026-03-12T..."
}
```

## Database Models

### Transcript Model

Located at: `lib/models/Transcript.ts`

```typescript
{
  transcriptId: string       // Unique ID
  guildId: string           // Guild ID
  ticketId: string          // Ticket ID
  channelId: string         // Channel ID
  html: string              // Full HTML content
  messageCount: number      // Number of messages
  generatedBy: string       // User who generated it
  generatedAt: Date         // Generation timestamp
}
```

### Ticket Model Update

The `Ticket` model includes:
```typescript
{
  transcriptURL: string | null  // Link to web transcript
}
```

## Testing

1. **Start the website:**
   ```bash
   npm run dev
   ```

2. **Start the bot:**
   ```bash
   node index.js
   ```

3. **Create a test ticket in Discord**

4. **Generate transcript:**
   - Use `/ticket transcript` command
   - Or click the "Transcript" button

5. **Verify:**
   - Bot should show "View Online" link in embed
   - Click link to view transcript in browser
   - Check dashboard tickets page for transcript link

## Troubleshooting

### "Failed to save transcript to website"

- Verify website is running and accessible at `https://demonbot.vercel.app`
- Check `BOT_TOKEN` matches in both `.env` files
- Look at bot console for specific error

### Transcript link returns 404

- Verify transcript was saved (check bot console)
- Check MongoDB connection
- Ensure transcript ID in URL is correct

### Authorization errors

- Verify `BOT_TOKEN` environment variable is set correctly in both bot and website
- Ensure Authorization header format: `Bearer <token>`

### "Authentication Required" when viewing transcript

- This is expected behavior - transcripts require Discord login
- Click "Sign in with Discord" to authenticate
- After login, transcript will be displayed

## Features Implemented

- ✅ HTML transcript generation with Discord styling
- ✅ Website database storage via API
- ✅ Shareable public links with authentication required
- ✅ Discord login requirement for viewing transcripts
- ✅ Transcript links in Discord embeds and dashboard
- ✅ Secure API authentication using bot token
- ✅ Permanent MongoDB storage

## Future Enhancements

- [ ] Auto-generate transcripts on ticket close
- [ ] Transcript download as PDF
- [ ] Search within transcripts
- [ ] Transcript retention policies
- [ ] Role-based access control for transcripts
