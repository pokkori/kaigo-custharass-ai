import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

// 介護カスハラ関連SEOキーワードリスト（週次ローテーション）
const SEO_TOPICS = [
  { keyword: "介護施設 カスタマーハラスメント 対策", slug: "kaigo-kasuhara-taisaku" },
  { keyword: "介護職員 理不尽クレーム 対応マニュアル", slug: "kaigo-claim-manual" },
  { keyword: "カスハラ 義務化 2026年 介護", slug: "kasuhara-gimuuka-2026" },
  { keyword: "訪問介護 カスハラ 事例", slug: "houmon-kaigo-kasuhara" },
  { keyword: "介護施設 クレーム記録 方法", slug: "kaigo-claim-kiroku" },
  { keyword: "IT導入補助金 介護 AI", slug: "it-hojo-kaigo-ai" },
  { keyword: "介護士 精神的疲弊 カスハラ 離職", slug: "kaigo-burnout-kasuhara" },
  { keyword: "特養 老健 カスタマーハラスメント", slug: "tokuyou-rouken-kasuhara" },
];

async function generateSeoArticle(topic: { keyword: string; slug: string }): Promise<{
  title: string;
  content: string;
  meta_description: string;
  faq_json: string;
}> {
  const prompt = `あなたは介護業界のSEO専門ライターです。以下のキーワードで、Google検索上位を狙うSEO記事を作成してください。

【ターゲットキーワード】${topic.keyword}

【要件】
- 文字数: 1500〜2000文字
- H2見出しを3〜4個含める
- 統計データ・具体例を含める（厚労省・介護労働安定センターのデータを参照）
- 末尾に「介護カスハラAI」への自然な導線を入れる（URL: https://kaigo-custharass-ai.vercel.app）
- FAQ（よくある質問）を3問作成する（JSON-LD用）
- HTML形式で出力（<h2>,<p>,<ul>,<li>タグのみ使用）

【出力フォーマット（JSON）】
{
  "title": "記事タイトル（30〜40文字）",
  "meta_description": "メタディスクリプション（120文字以内）",
  "content": "本文HTML",
  "faq_json": "[{\"question\":\"Q1\",\"answer\":\"A1\"},{\"question\":\"Q2\",\"answer\":\"A2\"},{\"question\":\"Q3\",\"answer\":\"A3\"}]"
}

JSONのみ出力。余計な説明不要。`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("JSON parse failed");
  return JSON.parse(jsonMatch[0]);
}

export async function GET(req: NextRequest) {
  // Vercel CRON認証
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    // 今週のトピックを選択（週番号でローテーション）
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const topic = SEO_TOPICS[weekNumber % SEO_TOPICS.length];

    // 既に同スラッグの記事があればスキップ
    const { data: existing } = await supabase
      .from("seo_articles")
      .select("id")
      .eq("slug", topic.slug)
      .single();

    if (existing) {
      return NextResponse.json({ skipped: true, slug: topic.slug });
    }

    // 記事生成
    const article = await generateSeoArticle(topic);

    // Supabaseに保存
    const { error } = await supabase.from("seo_articles").insert({
      slug: topic.slug,
      keyword: topic.keyword,
      title: article.title,
      meta_description: article.meta_description,
      content: article.content,
      faq_json: article.faq_json,
      published: true,
      published_at: new Date().toISOString(),
    });

    if (error) throw error;

    return NextResponse.json({ success: true, slug: topic.slug, title: article.title });
  } catch (error) {
    console.error("SEO content cron error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
