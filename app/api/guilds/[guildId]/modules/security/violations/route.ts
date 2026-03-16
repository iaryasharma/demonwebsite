import { NextResponse } from "next/server";
import SecurityViolation from "@/lib/models/SecurityViolation";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const { guildId } = await params;
    
    const violations = await SecurityViolation.find({ guildId }).sort({ createdAt: -1 }).limit(100);
    return NextResponse.json(violations);
  } catch (error) {
    console.error("Error fetching security violations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
