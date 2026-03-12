import type { NextAuthOptions } from "next-auth"
import type { JWT } from "next-auth/jwt"
import DiscordProvider from "next-auth/providers/discord"

interface ExtendedToken extends JWT {
    accessToken?: string
    refreshToken?: string
    accessTokenExpires?: number
    discordId?: string
    error?: string
}

/**
 * Refresh an expired Discord OAuth2 access token using the refresh token.
 */
async function refreshAccessToken(token: ExtendedToken): Promise<ExtendedToken> {
    try {
        const url = "https://discord.com/api/v10/oauth2/token"
        const params = new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID!,
            client_secret: process.env.DISCORD_CLIENT_SECRET!,
            grant_type: "refresh_token",
            refresh_token: token.refreshToken!,
        })

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params,
        })

        const refreshedTokens = await response.json()

        if (!response.ok) {
            console.error("[Auth] Token refresh failed:", refreshedTokens)
            throw new Error("Failed to refresh access token")
        }

        console.log("[Auth] Successfully refreshed access token")

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
            error: undefined,
        }
    } catch (error) {
        console.error("[Auth] Error refreshing access token:", error)
        return {
            ...token,
            error: "RefreshAccessTokenError",
        }
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: "identify guilds",
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account, profile, trigger }) {
            const t = token as ExtendedToken

            // Initial sign in - save OAuth tokens
            if (account && profile) {
                console.log("[Auth] New sign-in, storing OAuth tokens")
                t.accessToken = account.access_token as string
                t.refreshToken = account.refresh_token as string
                t.accessTokenExpires = account.expires_at
                    ? account.expires_at * 1000
                    : Date.now() + (account.expires_in ?? 604800) * 1000 // Default 7 days
                t.discordId = (profile as any)?.id
                t.error = undefined
                return t
            }

            // Token hasn't expired yet, return as-is
            if (t.accessTokenExpires && Date.now() < t.accessTokenExpires) {
                return t
            }

            // Token has expired, try to refresh it
            console.log("[Auth] Access token expired, attempting refresh")
            if (!t.refreshToken) {
                console.error("[Auth] No refresh token available")
                t.error = "NoRefreshToken"
                return t
            }

            return refreshAccessToken(t)
        },
        async session({ session, token }) {
            const t = token as ExtendedToken
            // SECURITY: Do NOT expose accessToken to the client.
            // Only expose the discordId so the client knows who the user is.
            if (session.user) {
                ; (session.user as any).id = t.discordId
            }
            ; (session as any).discordId = t.discordId

            // If there's a token error, user should re-authenticate
            if (t.error) {
                ; (session as any).error = t.error
            }

            return session
        },
    },
    pages: {
        signIn: "/dashboard",
    },
    secret: process.env.NEXTAUTH_SECRET,
    // Session settings
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
}

/**
 * Extract the server-side-only access token from the session.
 * This must only be called from server-side code (API routes / server components).
 */
export function getAccessToken(session: any): string | null {
    // In Next-Auth, the full JWT (with accessToken) is available
    // via getServerSession -> the session callback runs server-side.
    // Since we removed accessToken from the session object sent to client,
    // we need a way to get it server-side. We add a helper that reads
    // from the token directly.
    return null // We'll use getToken() from next-auth/jwt instead
}
