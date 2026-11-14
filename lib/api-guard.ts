import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild, validateGuildId } from "@/lib/permissions"

export type GuildGuard = { ok: true; guildId: string } | { ok: false; response: NextResponse }

/**
 * One call for every guild-scoped API route: signed in (401), valid server ID (400), and the signed-in user
 * can manage that server (403). Always run it before touching the database.
 *
 * const guard = await guardGuild(request, context.params)
 * if (!guard.ok) return guard.response
 */
export async function guardGuild(request: Request, params: Promise<{ guildId: string }>): Promise<GuildGuard> {
    const accessToken = await getAccessTokenFromRequest(request)
    if (!accessToken) return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

    const { guildId } = await params
    if (!validateGuildId(guildId)) return { ok: false, response: NextResponse.json({ error: "Invalid guild ID" }, { status: 400 }) }

    if (!(await requireManageGuild(accessToken, guildId))) {
        return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
    }
    return { ok: true, guildId }
}
