import type { NextAuthOptions } from "next-auth"
import type { JWT } from "next-auth/jwt"
import DiscordProvider from "next-auth/providers/discord"

interface ExtendedToken extends JWT {
    accessToken?: string
    discordId?: string
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
        async jwt({ token, account, profile }) {
            const t = token as ExtendedToken
            if (account) {
                t.accessToken = account.access_token as string
                t.discordId = (profile as any)?.id
            }
            return t
        },
        async session({ session, token }) {
            const t = token as ExtendedToken
            // SECURITY: Do NOT expose accessToken to the client.
            // Only expose the discordId so the client knows who the user is.
            if (session.user) {
                ; (session.user as any).id = t.discordId
            }
            ; (session as any).discordId = t.discordId
            return session
        },
    },
    pages: {
        signIn: "/dashboard",
    },
    secret: process.env.NEXTAUTH_SECRET,
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
