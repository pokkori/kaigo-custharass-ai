/**
 * LINE Messaging API Webhook - 介護カスハラAI
 * POST /api/line/webhook
 *
 * 介護カスハラAI専用: Day0ウェルカムメッセージに東京都奨励金訴求を含める
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const SERVICE_URL = "https://kaigo-custharass-ai.vercel.app";
const SERVICE_NAME = "介護カスハラAI";
const APP_ID = "kaigo-custharass-ai";

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret) return false;
  const hash = crypto
    .createHmac("SHA256", secret)
    .update(rawBody)
    .digest("base64");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

async function sendLineMessage(userId: string, text: string): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return;
  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      to: userId,
      messages: [{ type: "text", text }],
    }),
  });
  if (!res.ok) {
    console.error(`[LINE] push failed: ${res.status} ${await res.text()}`);
  }
}

async function registerLineUser(userId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const nextSendAt = new Date();
  nextSendAt.setDate(nextSendAt.getDate() + 1);

  const { error } = await supabase.from("line_step_users").upsert(
    {
      line_user_id: userId,
      app_id: APP_ID,
      step: 0,
      next_send_at: nextSendAt.toISOString(),
      created_at: new Date().toISOString(),
    },
    { onConflict: "line_user_id,app_id" }
  );
  if (error) console.error("[LINE] Supabase upsert error:", error.message);
}

const DAY0_MESSAGE = `【${SERVICE_NAME}】にご登録ありがとうございます。

介護施設の7割がカスハラに悩んでいます。AIが対応記録・報告書・再発防止策を即座に生成し、職員を守ります。

まず無料でお試しください:
${SERVICE_URL}

IT導入補助金2026を活用すると実質¥7,450/月〜導入可能です。
詳細はこちら: ${SERVICE_URL}/legal

ご質問はこのLINEにお気軽にどうぞ。`;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text();
  const signature = req.headers.get("x-line-signature") ?? "";

  if (!signature || !verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let parsed: { events?: LineEvent[] };
  try {
    parsed = JSON.parse(rawBody) as { events?: LineEvent[] };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  for (const event of parsed.events ?? []) {
    if (event.type === "follow" && event.source?.userId) {
      await Promise.allSettled([
        sendLineMessage(event.source.userId, DAY0_MESSAGE),
        registerLineUser(event.source.userId),
      ]);
    }
  }

  return NextResponse.json({ ok: true });
}

interface LineEvent {
  type: string;
  source?: { userId?: string };
}
