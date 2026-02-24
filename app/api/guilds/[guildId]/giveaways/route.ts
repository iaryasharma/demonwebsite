import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Giveaway from "@/lib/models/Giveaway"

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ guildId: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session || !(session as any).accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guildId } = await params

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
