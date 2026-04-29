/**
 * LINE ステップ配信 CRON - 介護カスハラAI
 * GET /api/cron/line-step
 * Vercel CRON: "0 0 * * *" (毎日 09:00 JST)
 *
 * 介護カスハラAI専用シーケンス（BtoB向け・東京都奨励金・IT補助金訴求）
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SERVICE_URL = "https://kaigo-custharass-ai.vercel.app";
const SERVICE_NAME = "介護カスハラAI";
const PERSONAL_PRICE = "¥2,980";
const APP_ID = "kaigo-custharass-ai";

interface StepDef {
  step: number;
  nextStep: number | null;
  daysUntilNext: number;
  message: string;
}

const STEPS: StepDef[] = [
  {
    step: 1,
    nextStep: 2,
    daysUntilNext: 2,
    message: `【${SERVICE_NAME}】昨日のカスハラ対応はいかがでしたか？

介護施設の7割がカスハラに悩んでいます。AIが対応記録・報告書を即座に生成し、職員を守ります。

何度でも無料でお試しください:
${SERVICE_URL}`,
  },
  {
    step: 2,
    nextStep: 3,
    daysUntilNext: 1,
    message: `【${SERVICE_NAME}】実際の利用施設の声をご紹介します。

「AIが生成した対応記録を使ったら、弁護士からも『これで十分』と言われた」（特養 / 施設長）

月額プランなら記録・報告書・再発防止策の作成が無制限で${PERSONAL_PRICE}/月:
${SERVICE_URL}/pricing`,
  },
  {
    step: 3,
    nextStep: 4,
    daysUntilNext: 2,
    message: `【${SERVICE_NAME}】無料体験はお試しいただけましたか？

カスハラ事案の対応記録をAIが生成します。まだの方はこちら:
${SERVICE_URL}

月額プランではカスハラ判定・対応スクリプト・報告書が無制限生成できます。`,
  },
  {
    step: 4,
    nextStep: 5,
    daysUntilNext: 2,
    message: `【${SERVICE_NAME}】無料体験、あと3日です。

今週中にお申し込みいただくと、通常${PERSONAL_PRICE}/月が初月20%OFFになります。

この機会にぜひご検討ください:
${SERVICE_URL}/pricing?coupon=LINE20`,
  },
  {
    step: 5,
    nextStep: 6,
    daysUntilNext: 3,
    message: `【${SERVICE_NAME}】個別のZoom相談を無料で承っています。

「施設全体への導入を検討したい」「IT導入補助金の申請方法を聞きたい」など、お気軽にご相談ください:
${SERVICE_URL}/contact

担当者が個別に対応します。`,
  },
  {
    step: 6,
    nextStep: null,
    daysUntilNext: 0,
    message: `【${SERVICE_NAME}】重要なご案内です。

IT導入補助金2026（最大450万円）を活用すると、${SERVICE_NAME}の導入費用を最大3/4補助してもらえます。実質¥7,450/月〜導入可能です。

申請サポートも行っています。お早めにご相談ください:
${SERVICE_URL}/contact`,
  },
];

async function sendLineMessage(userId: string, text: string): Promise<boolean> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return false;
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
  return res.ok;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const now = new Date();

  const { data: users, error } = await supabase
    .from("line_step_users")
    .select("id, line_user_id, step, next_send_at")
    .lte("next_send_at", now.toISOString())
    .lt("step", 6)
    .eq("app_id", APP_ID)
    .order("next_send_at", { ascending: true })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: { userId: string; step: number; status: string }[] = [];

  for (const user of users ?? []) {
    const stepDef = STEPS.find((s) => s.step === (user.step as number) + 1);
    if (!stepDef) continue;

    const sent = await sendLineMessage(user.line_user_id as string, stepDef.message);
    const nextSendAt =
      stepDef.nextStep !== null && stepDef.daysUntilNext > 0
        ? new Date(now.getTime() + stepDef.daysUntilNext * 86400 * 1000).toISOString()
        : null;

    await supabase
      .from("line_step_users")
      .update({ step: stepDef.step, next_send_at: nextSendAt, updated_at: now.toISOString() })
      .eq("id", user.id);

    results.push({ userId: user.line_user_id as string, step: stepDef.step, status: sent ? "sent" : "error" });
  }

  return NextResponse.json({ processed: results.length, results, executedAt: now.toISOString() });
}
