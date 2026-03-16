import { NextResponse } from "next/server";
import SecurityConfig from "@/lib/models/SecurityConfig";
import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Need to confirm authOptions location

export async function GET(
  req: Request,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const { guildId } = await params;
    
    let config = await SecurityConfig.findOne({ guildId });
    if (!config) {
      config = await SecurityConfig.create({ guildId });
    }
    
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching security config:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { parseBody, pickAllowed } from "@/lib/api-helpers";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const { guildId } = await params;
    const parsed = await parseBody(req);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    
    const safe = pickAllowed(parsed.data as Record<string, unknown>, "security_config");
    
    const config = await SecurityConfig.findOneAndUpdate(
      { guildId },
      { $set: safe },
      { new: true, upsert: true }
    );

    // If securityLogChannelId was updated, sync it to Logging model as well
    if (safe.securityLogChannelId) {
        const Logging = (await import("@/lib/models/Logging")).default;
        await Logging.findOneAndUpdate(
            { guildId },
            { 
                $set: { 
                    "channels.security": safe.securityLogChannelId,
                    "eventChannels.securityViolation": safe.securityLogChannelId // Sync granular too
                } 
            },
            { upsert: true }
        );
    }
    
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error updating security config:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
