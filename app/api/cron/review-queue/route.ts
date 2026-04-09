/**
 * GET /api/cron/review-queue
 * Vercel CRON: 毎日 UTC 00:00 (JST 09:00) に実行
 *
 * 審査待機中サービスのタスクキュー処理
 * - KOMOJU/AppStore審査中のサービスに対して
 *   SEOコンテンツ生成・SNS投稿・LP改善を自動実行
 *
 * 使い方:
 * 1. 審査提出時に review_queue テーブルに登録（service, expected_date, tasks）
 * 2. このcronが毎日確認して期限前タスクを実行
 * 3. 審査完了後はステータスを completed に更新
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";
import { notifyCronResult } from "@/lib/cron-notify";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5分（複数サービスのバッチ処理）

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 審査待機中に実行するタスク定義
const REVIEW_TASKS = {
  seo_meta: (service: string) =>
    `${service}サービスの SEO メタタイトル・ディスクリプション10パターンを生成してください。キーワード密度・CTR最適化を考慮して。`,
  sns_posts: (service: string) =>
    `${service}サービスのX(Twitter)投稿文を10本生成。ハッシュタグ3本・絵文字なし・140文字以内。`,
  lp_improvements: (service: string) =>
    `${service}のランディングページ改善提案を5つ。CTAボタン文言・ヘッダーコピー・社会的証明の観点で。`,
};

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const now = new Date();

  // 審査待機中の未処理タスクを取得
  const { data: queueItems, error } = await supabase
    .from("review_queue")
    .select("*")
    .eq("status", "pending")
    .lte("run_after", now.toISOString())
    .limit(10);

  if (error || !queueItems?.length) {
    return NextResponse.json({
      processed: 0,
      message: error?.message || "処理対象なし",
    });
  }

  // Claude Batch API で一括コンテンツ生成
  const requests = queueItems.flatMap((item) => {
    const tasks = item.tasks as string[];
    return tasks.map((task: string) => ({
      custom_id: `${item.id}_${task}`,
      params: {
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: [
          {
            role: "user" as const,
            content:
              REVIEW_TASKS[task as keyof typeof REVIEW_TASKS]?.(
                item.service_name
              ) ?? task,
          },
        ],
      },
    }));
  });

  let batchId: string | null = null;
  try {
    // Message Batches API で一括送信（50%コスト削減）
    const batch = await anthropic.messages.batches.create({ requests });
    batchId = batch.id;

    // バッチIDをDBに保存（結果は別cronで取得）
    for (const item of queueItems) {
      await supabase
        .from("review_queue")
        .update({
          status: "batch_submitted",
          batch_id: batchId,
          submitted_at: now.toISOString(),
        })
        .eq("id", item.id);
    }
  } catch (e) {
    console.error("[review-queue] Batch API error:", e);
  }

  const result = {
    ok: batchId !== null,
    processed: queueItems.length,
    batch_id: batchId,
    tasks_submitted: requests.length,
  };
  await notifyCronResult("介護カスハラAI review-queue", result);
  return NextResponse.json(result);
}
