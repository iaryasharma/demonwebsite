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
                ; (session as any).accessToken = t.accessToken
                ; (session as any).discordId = t.discordId
            return session
        },
    },
    pages: {
        signIn: "/dashboard",
    },
    secret: process.env.NEXTAUTH_SECRET,
}
