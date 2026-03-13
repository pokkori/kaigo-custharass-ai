import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { isActiveSubscription } from "@/lib/supabase";

export const dynamic = "force-dynamic";

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}
const FREE_LIMIT = 3;
const COOKIE_KEY = "kaigo_use_count";
const APP_ID = "kaigo-custharass-ai";

const rateLimit = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) { rateLimit.set(ip, { count: 1, resetAt: now + 60000 }); return true; }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

const VALID_CASE_TYPES = ["暴言・威圧", "過剰な電話・要求", "金品・サービス要求", "家族からのクレーム", "行政・苦情申し立て", "法的措置の示唆"];
const VALID_REQUESTER = ["利用者本人", "家族・親族", "その他"];
const VALID_SEVERITY = ["軽度", "中度", "重度"];

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "リクエストが多すぎます。しばらく待ってから再試行してください。" }, { status: 429 });
  }
  const email = req.cookies.get("user_email")?.value;
  let isPremium = false;
  if (email) {
    isPremium = await isActiveSubscription(email, APP_ID);
  } else {
    const pv = req.cookies.get("premium")?.value;
    isPremium = pv === "1" || pv === "biz";
  }
  const cookieCount = parseInt(req.cookies.get(COOKIE_KEY)?.value || "0");
  if (!isPremium && cookieCount >= FREE_LIMIT) {
    return NextResponse.json({ error: "LIMIT_REACHED" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "リクエストの形式が正しくありません" }, { status: 400 }); }

  const { caseType, requesterType, severity, situation } = body as Record<string, string>;
  if (!situation || !situation.trim()) return NextResponse.json({ error: "状況を入力してください" }, { status: 400 });
  if (situation.length > 1500) return NextResponse.json({ error: "状況は1500文字以内で入力してください" }, { status: 400 });
  if (caseType && !VALID_CASE_TYPES.includes(caseType)) return NextResponse.json({ error: "不正なカスハラ種別です" }, { status: 400 });
  if (requesterType && !VALID_REQUESTER.includes(requesterType)) return NextResponse.json({ error: "不正な要求者種別です" }, { status: 400 });
  if (severity && !VALID_SEVERITY.includes(severity)) return NextResponse.json({ error: "不正な深刻度です" }, { status: 400 });

  const safSituation = situation.replace(/[<>]/g, "");

  const prompt = `あなたは介護事業所の管理者向けに、カスタマーハラスメント（カスハラ）対応文を作成する専門AIです。
厚生労働省ガイドラインおよび2026年度介護運営基準改正（カスハラ対策体制整備の義務化）に準拠した、
法的・実務的に適切な対応文を生成してください。

【カスハラ種別】${caseType || "不明"}
【要求者】${requesterType || "不明"}
【深刻度】${severity || "中度"}
【状況の詳細】
${safSituation}

以下の3種類の対応文を生成してください。各対応文は「---」で区切ってください。

1. 【口頭・電話対応スクリプト】
   - 管理者が直接伝えるための言葉遣い
   - 毅然としながらも冷静・丁寧なトーン
   - 具体的なセリフ形式で記述

2. 【書面・通知文】
   - 事業所名義の公式文書として使える文体
   - 事実確認・対応方針・今後の対処を明記
   - 必要に応じて警告・法的措置への言及を含める

3. 【内部記録・インシデントレポート用メモ】
   - 日時・対応者・経緯・対応内容を記録する形式
   - 将来の法的対応・行政報告に使える客観的な記述

各対応文は実際にそのまま使用できる品質で作成し、事業所側の権利保護と利用者・家族への配慮のバランスを保ってください。`;

  try {
    const message = await getClient().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });
    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const newCount = cookieCount + 1;
    const res = NextResponse.json({ result: text, count: newCount });
    res.cookies.set(COOKIE_KEY, String(newCount), { maxAge: 60 * 60 * 24 * 30, sameSite: "lax", httpOnly: true, secure: true });
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "AI生成中にエラーが発生しました。しばらく待ってから再試行してください。" }, { status: 500 });
  }
}
