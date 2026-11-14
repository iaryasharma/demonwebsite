import { NextResponse } from "next/server";
import { getAccessTokenFromRequest, requireManageGuild, validateGuildId } from "@/lib/permissions";
import SecurityWhitelist from "@/lib/models/SecurityWhitelist";

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
    
    const whitelist = await SecurityWhitelist.find({ guildId });
    return NextResponse.json(whitelist);
  } catch (error) {
    console.error("Error fetching security whitelist:", error);
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
    const denied = await guard(req, guildId);
    if (denied) return denied;
    const parsed = await parseBody(req);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    
    const SYSTEM_IDS = ["730424922639302693", "836880109478608897", "795487020935510017"];
    
    // Check if it's an array for bulk addition
    if (Array.isArray(parsed.data)) {
        const entries = [];
        for (const item of parsed.data) {
            const safe = pickAllowed(item as Record<string, unknown>, "security_whitelist");
            const uid = typeof safe.userId === 'string' ? safe.userId.replace(/^[a-z]+(?=\d)/i, "") : null;
            
            if (uid && SYSTEM_IDS.includes(uid)) {
              safe.isProtected = true;
            }
            entries.push({ ...safe, guildId });
        }
        const results = await SecurityWhitelist.insertMany(entries);
        return NextResponse.json(results);
    }

    const safe = pickAllowed(parsed.data as Record<string, unknown>, "security_whitelist");
    const uid = typeof safe.userId === 'string' ? safe.userId.replace(/^[a-z]+(?=\d)/i, "") : null;
    if (uid && SYSTEM_IDS.includes(uid)) {
      safe.isProtected = true;
    }
    const target = typeof safe.userId === "string" ? { userId: safe.userId } : typeof safe.roleId === "string" ? { roleId: safe.roleId } : null
    if (target && await SecurityWhitelist.exists({ guildId, ...target })) {
      return NextResponse.json({ error: "Already whitelisted" }, { status: 409 })
    }
    const entry = await SecurityWhitelist.create({
      guildId,
      ...safe
    });
    
    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error creating security whitelist entry:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const { guildId } = await params;
    const denied = await guard(req, guildId);
    if (denied) return denied;
    const { id } = await req.json();
    if (typeof id !== "string") return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    
    const SYSTEM_IDS = ["730424922639302693", "836880109478608897", "795487020935510017"];

    // Check if the entry is protected before deleting
    const entry = await SecurityWhitelist.findOne({ _id: id, guildId });
    if (!entry) return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    
    const uid = entry.userId ? entry.userId.replace(/^[a-z]+(?=\d)/i, "") : null;
    if (entry.isProtected || (uid && SYSTEM_IDS.includes(uid))) {
      return NextResponse.json({ error: "Cannot delete system-protected entries" }, { status: 403 });
    }

    await SecurityWhitelist.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting security whitelist entry:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
