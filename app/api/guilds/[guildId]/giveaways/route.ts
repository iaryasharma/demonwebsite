import { NextResponse } from "next/server"
import { getAccessTokenFromRequest, requireManageGuild } from "@/lib/permissions"
import { connectToDatabase } from "@/lib/mongodb"
import Giveaway from "@/lib/models/Giveaway"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ guildId: string }> }
) {
    const accessToken = await getAccessTokenFromRequest(request)
    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guildId } = await params

    if (!(await requireManageGuild(accessToken, guildId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        await connectToDatabase()

        const giveaways = await Giveaway.find({ guildId })
            .sort({ isActive: -1, endTime: -1 })
            .select("-__v")
            .lean()

        return NextResponse.json(giveaways)
    } catch (error) {
        console.error("Error fetching giveaways:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
