import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Guild from "@/lib/models/Guild"
import { User } from "@/lib/models/User"
import fs from "fs"
import path from "path"

export const dynamic = "force-dynamic"

function getCommandCount() {
    try {
        const jsonPath = path.join(process.cwd(), "json", "commands_list.json")
        if (fs.existsSync(jsonPath)) {
            const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"))
            if (typeof data.summary?.totalCommands === "number") {
                return data.summary.totalCommands
            }
            if (Array.isArray(data.commands)) {
                return data.commands.filter((c: { developerOnly?: boolean; category?: string }) =>
                    !c.developerOnly && c.category !== "developer"
                ).length
            }
            if (data.categories && typeof data.categories === "object") {
                return Object.entries(data.categories)
                    .filter(([cat]) => cat !== "developer")
                    .reduce((sum, [, cmds]) => sum + (Array.isArray(cmds) ? cmds.length : 0), 0)
            }
            if (Array.isArray(data)) return data.length
        }
        return 150
    } catch {
        return 150
    }
}

export async function GET() {
    try {
        await connectToDatabase()

        // Count servers (guilds in DB)
        // Matching botstats.js logic: Total guilds the bot is serving (in DB)
        const serverCount = await Guild.countDocuments()

        // Count users in DB
        // Matching botstats.js logic: Sum of all members (duplicates allowed between guilds)
        // Since each User document represents a member in a specific guild,
        // countDocuments() on User collection gives the total member count across all guilds.
        const totalMembersInDB = await User.countDocuments()

        // Actual command count from sources
        const commandCount = getCommandCount()

        return NextResponse.json({
            servers: serverCount,
            users: totalMembersInDB,
            commands: commandCount,
        })
    } catch (error) {
        console.error("Error fetching bot stats:", error)
        return NextResponse.json({
            servers: 1200,
            users: 250000,
            commands: 150,
            error: "Failed to fetch live stats",
        })
    }
}
