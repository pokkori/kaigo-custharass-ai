/**
 * LINE Messaging API Webhook - 介護カスハラAI
 * POST /api/line/webhook
 *
 * follow: Day0ウェルカムメッセージ + line_step_users登録
 * message: キーワード自動応答（資料希望/料金/補助金/デモ/導入事例/義務化）
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const SERVICE_URL = "https://kaigo-custharass-ai.vercel.app";
const SERVICE_NAME = "介護カスハラAI";
const APP_ID = "kaigo-btob";

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret) return false;
  const hash = crypto.createHmac("SHA256", secret).update(rawBody).digest("base64");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

async function pushMessage(userId: string, text: string): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return;
  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ to: userId, messages: [{ type: "text", text }] }),
  });
  if (!res.ok) console.error(`[LINE] push failed: ${res.status}`);
}

async function replyMessage(replyToken: string, text: string): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return;
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ replyToken, messages: [{ type: "text", text }] }),
  });
}

async function registerLineUser(userId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const nextSendAt = new Date();
  nextSendAt.setDate(nextSendAt.getDate() + 1);
  const { error } = await supabase.from("line_step_users").upsert(
    { line_user_id: userId, app_id: APP_ID, step: 0, next_send_at: nextSendAt.toISOString(), created_at: new Date().toISOString() },
    { onConflict: "line_user_id,app_id" }
  );
  if (error) console.error("[LINE] upsert error:", error.message);
}

async function logLead(userId: string, keyword: string, action: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from("line_leads").insert({ line_user_id: userId, keyword, action, app_id: APP_ID }).catch(() => {});
}

const DAY0_MESSAGE = `【${SERVICE_NAME}】にご登録ありがとうございます。

2026年10月、カスタマーハラスメント対応が全介護事業者に義務化されます（改正労働施策総合推進法 第30条の7）。

介護カスハラAIは記録・分析・警告書生成をAIが行い、対応を2分で完了します。

デジタル化・AI導入補助金2026（最大450万円補助）の対象になりえます。
1次申請締切：2026年5月12日（残りわずか）

まず無料でお試しください:
${SERVICE_URL}

【よく使われるキーワード】
「資料希望」「補助金」「料金」「デモ」「導入事例」

ご質問はこのLINEにお気軽にどうぞ。`;

// キーワード→自動応答マップ
const KEYWORD_MAP: Array<{ keywords: string[]; response: string; tag: string }> = [
  {
    keywords: ["資料希望", "資料", "パンフレット", "詳しく"],
    tag: "shiryo",
    response: `【介護カスハラAI 資料案内】

資料はWebサイトでご確認いただけます:
${SERVICE_URL}

担当者が施設規模・所在地をお伺いし、補助金の個別試算を無料で行います。

施設名・サービス種別・職員数・都道府県をこのLINEへご返信ください。`,
  },
  {
    keywords: ["補助金", "助成金", "IT補助金", "補助"],
    tag: "hojyokin",
    response: `【デジタル化・AI導入補助金2026】

上限：最大450万円
補助率：1/2〜4/5（事業規模により異なります）
対象：クラウドSaaS月額（最大2年分）

介護カスハラAI（¥29,800/月）は補助対象になりえます（審査あり）。

1次申請締切：2026年5月12日 17:00

弊社で申請サポート（無料）を行っています。
「申請希望」とご返信いただければ担当者が折り返します。`,
  },
  {
    keywords: ["料金", "価格", "費用", "いくら"],
    tag: "price",
    response: `【料金プラン】

スタンダード：¥29,800/月
（カスハラ記録・警告書生成・AI分析・義務化対応チェック 全機能込み）

デジタル化・AI導入補助金2026適用後：
最大4/5補助で実質¥5,960〜¥14,900/月（審査あり）

まずは14日間完全無料体験（カード登録不要）をお試しください:
${SERVICE_URL}`,
  },
  {
    keywords: ["デモ", "demo", "体験", "見せて", "使ってみ"],
    tag: "demo_request",
    response: `【30分無料デモのご予約】

実際のカスハラ事案を入力して、警告書が30秒で生成される様子をご覧いただけます。

下記より日時をお選びください（オンライン・ZoomまたはMeet）:
${SERVICE_URL}/contact

または「デモ希望・○月○日△時」とご返信ください。
担当者より確認のご連絡をいたします。`,
  },
  {
    keywords: ["導入事例", "事例", "実績", "使っている"],
    tag: "case",
    response: `【導入施設の声】

特養A（東京都・職員42名）:
「警告書を1枚送ったらクレームがピタリと止まった」（施設長）

通所介護B（神奈川県・職員18名）:
「補助金で月¥5,960で導入。2ヶ月で問題が解決した」（管理者）

詳細はWebサイトをご確認ください:
${SERVICE_URL}`,
  },
  {
    keywords: ["義務化", "法律", "法令", "施行"],
    tag: "gimuuka",
    response: `【2026年10月 カスハラ対策義務化】

改正労働施策総合推進法 第30条の7
2026年10月1日施行（厚労省カスハラ防止指針：2026年2月26日公布済み）

全事業主に義務付けられる対応:
1. カスハラ方針の明文化
2. 相談窓口の設置
3. 職員への研修実施
4. 被害職員へのケア体制

未対応の場合：行政指導→勧告→社名公表のリスク

今すぐ対策を始めるには:
${SERVICE_URL}`,
  },
  {
    keywords: ["申請希望", "申請したい", "補助金申請"],
    tag: "apply",
    response: `【補助金申請サポート（無料）について】

担当者がご連絡します。
以下をお知らせいただけますか？

1. 施設名
2. サービス種別（特養・デイサービス等）
3. 職員数（おおよそで可）
4. 所在地（市区町村まで）
5. ご連絡先メールアドレス

申請締切：2026年5月12日 17:00
お急ぎの場合はお早めにご連絡ください。`,
  },
];

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
    const userId = event.source?.userId;
    if (!userId) continue;

    if (event.type === "follow") {
      await Promise.allSettled([
        pushMessage(userId, DAY0_MESSAGE),
        registerLineUser(userId),
      ]);
      continue;
    }

    if (event.type === "message" && event.message?.type === "text" && event.replyToken) {
      const text = (event.message.text ?? "").trim();
      let replied = false;

      for (const entry of KEYWORD_MAP) {
        if (entry.keywords.some((kw) => text.includes(kw))) {
          await Promise.allSettled([
            replyMessage(event.replyToken, entry.response),
            logLead(userId, entry.keywords[0], entry.tag),
          ]);
          replied = true;
          break;
        }
      }

      // キーワード未一致: デフォルト応答
      if (!replied) {
        await replyMessage(
          event.replyToken,
          `ご連絡ありがとうございます。\n\n「資料希望」「補助金」「料金」「デモ」「導入事例」「義務化」とお送りいただくと詳細をご案内します。\n\nお急ぎの場合はこちらからお問い合わせください:\n${SERVICE_URL}/contact`
        );
      }
    }
  }

  return NextResponse.json({ ok: true });
}

interface LineEvent {
  type: string;
  source?: { userId?: string };
  replyToken?: string;
  message?: { type?: string; text?: string };
}
