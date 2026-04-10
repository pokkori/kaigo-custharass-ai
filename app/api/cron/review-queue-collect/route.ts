/**
 * GET /api/cron/review-queue-collect
 * Vercel CRON: 毎時 UTC xx:30 に実行（バッチ結果収集）
 *
 * Claude Batch API の結果をポーリングして Supabase に保存
 * バッチ送信後の非同期結果取得パターン実装
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";
import { notifyCronResult } from "@/lib/cron-notify";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // batch_submitted 状態のアイテムを取得
  const { data: pending } = await supabase
    .from("review_queue")
    .select("id, batch_id, service_name, tasks")
    .eq("status", "batch_submitted")
    .not("batch_id", "is", null)
    .limit(5);

  if (!pending?.length) {
    return NextResponse.json({ collected: 0 });
  }

  let collected = 0;
  const processedBatchIds = new Set<string>();

  for (const item of pending) {
    if (processedBatchIds.has(item.batch_id)) continue;
    processedBatchIds.add(item.batch_id);

    try {
      const batch = await anthropic.messages.batches.retrieve(item.batch_id);

      if (batch.processing_status !== "ended") {
        continue; // まだ処理中
      }

      // 結果を収集
      const results: Record<string, string> = {};
      for await (const result of await anthropic.messages.batches.results(
        item.batch_id
      )) {
        if (result.result.type === "succeeded") {
          const content = result.result.message.content[0];
          if (content.type === "text") {
            results[result.custom_id] = content.text;
          }
        }
      }

      // DB に保存して完了マーク
      await supabase
        .from("review_queue")
        .update({
          status: "completed",
          results: results,
          completed_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      collected++;
    } catch (e) {
      console.error(`[review-queue-collect] batch ${item.batch_id} error:`, e);
    }
  }

  await notifyCronResult("review-queue-collect", { ok: true, collected }, { silent_on_success: collected === 0 });
  return NextResponse.json({ collected });
}
