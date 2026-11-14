import { NextResponse } from "next/server";
import { getAccessTokenFromRequest, requireManageGuild, validateGuildId } from "@/lib/permissions";
import SecurityViolation from "@/lib/models/SecurityViolation";

async function guard(req: Request, guildId: string) {
  const accessToken = await getAccessTokenFromRequest(req);
  if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!validateGuildId(guildId)) return NextResponse.json({ error: "Invalid guild ID" }, { status: 400 });
  if (!(await requireManageGuild(accessToken, guildId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const { guildId } = await params;
    const denied = await guard(req, guildId);
    if (denied) return denied;
    
    const violations = await SecurityViolation.find({ guildId }).sort({ createdAt: -1 }).limit(100);
    return NextResponse.json(violations);
  } catch (error) {
    console.error("Error fetching security violations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
