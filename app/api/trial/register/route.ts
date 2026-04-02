/**
 * フリートライアル登録エンドポイント
 * POST /api/trial/register
 *
 * メールアドレス（と任意の名前）を受け取り:
 * 1. Supabase の trial_email_sequences に登録
 * 2. Day1メールを即時送信
 *
 * フロントエンドの「無料で試す」フォームから呼ぶ
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { registerTrialUser, markDaySent } from "@/lib/trial-sequences";
import { buildDay1Email } from "@/lib/email-sequences";

export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "noreply@example.com";

// シンプルなレート制限（IP単位・1分10件）
const rateLimit = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "リクエストが多すぎます。しばらくしてから再試行してください。" },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストの形式が正しくありません" },
      { status: 400 }
    );
  }

  const { email, name } = body as { email?: string; name?: string };

  // バリデーション
  if (
    !email ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return NextResponse.json(
      { error: "正しいメールアドレスを入力してください" },
      { status: 400 }
    );
  }
  if (name && typeof name === "string" && name.length > 100) {
    return NextResponse.json(
      { error: "お名前は100文字以内で入力してください" },
      { status: 400 }
    );
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedName =
    typeof name === "string" ? name.trim() : undefined;

  // Supabase に登録（重複は無視）
  const { ok, error: dbError } = await registerTrialUser(
    normalizedEmail,
    normalizedName
  );
  if (!ok) {
    console.error("[trial/register] DB error:", dbError);
    // DBエラーでもメール送信は続行（ベストエフォート）
  }

  // Day1メール即時送信
  try {
    const { subject, html } = buildDay1Email({
      email: normalizedEmail,
      name: normalizedName,
    });
    await resend.emails.send({
      from: FROM_EMAIL,
      to: normalizedEmail,
      subject,
      html,
    });
    await markDaySent(normalizedEmail, 1);
  } catch (err) {
    console.error("[trial/register] Day1 email error:", err);
    // メール失敗はユーザーには返さない（登録自体は成功）
  }

  return NextResponse.json({ ok: true });
}
