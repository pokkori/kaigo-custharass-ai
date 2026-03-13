import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const premium = req.cookies.get("premium")?.value;
  return NextResponse.json({ premium: premium === "1" || premium === "biz" });
}
