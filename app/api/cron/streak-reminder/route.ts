/**
 * GET /api/cron/streak-reminder
 * Vercel CRON: 毎日 UTC 14:00 (JST 23:00) に実行
 *
 * 対象: 今日まだ未アクティブ かつ ストリーク2日以上のユーザー
 * → Web Push でストリーク切れ直前通知を送信
 */

import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT ?? "mailto:admin@example.com";

export async function GET(req: NextRequest) {
  // Vercel CRON 認証
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.error("[streak-reminder] VAPID キー未設定");
    return NextResponse.json(
      { error: "VAPID キーが設定されていません" },
      { status: 500 }
    );
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);

  // 今日まだ未アクティブ かつ ストリーク2日以上のユーザーIDを取得
  const { data: atRiskUsers, error: streakError } = await supabase
    .from("user_streaks")
    .select("user_id, current_streak")
    .neq("last_activity_date", today)
    .gte("current_streak", 2);

  if (streakError) {
    console.error("[streak-reminder] streak fetch error:", streakError.message);
    return NextResponse.json({ error: "DB エラー" }, { status: 500 });
  }

  if (!atRiskUsers || atRiskUsers.length === 0) {
    return NextResponse.json({ sent: 0, message: "対象ユーザーなし" });
  }

  const userIds = atRiskUsers.map((u) => u.user_id);
  const streakMap = new Map(
    atRiskUsers.map((u) => [u.user_id, u.current_streak])
  );

  // 対象ユーザーのプッシュサブスクリプションを取得
  const { data: subscriptions, error: subError } = await supabase
    .from("push_subscriptions")
    .select("user_id, endpoint, p256dh, auth")
    .in("user_id", userIds);

  if (subError) {
    console.error("[streak-reminder] subscription fetch error:", subError.message);
    return NextResponse.json({ error: "DB エラー" }, { status: 500 });
  }

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({
      sent: 0,
      message: "プッシュ購読済みユーザーなし",
      at_risk_users: atRiskUsers.length,
    });
  }

  const results = await Promise.allSettled(
    subscriptions.map((sub) => {
      const streak = streakMap.get(sub.user_id) ?? 2;
      const payload = JSON.stringify({
        title: "ストリークが切れそうです",
        body: `${streak}日連続利用中！今日の利用で記録を継続してください。`,
        tag: "streak-reminder",
        data: { url: "/tool" },
      });

      return webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      );
    })
  );

  // 無効サブスクリプションを削除
  const expiredEndpoints: string[] = [];
  results.forEach((result, idx) => {
    if (
      result.status === "rejected" &&
      (result.reason as { statusCode?: number })?.statusCode === 410
    ) {
      expiredEndpoints.push(subscriptions[idx].endpoint);
    }
  });

  if (expiredEndpoints.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("endpoint", expiredEndpoints);
  }

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - sent;

  console.log(
    `[streak-reminder] sent=${sent} failed=${failed} expired_removed=${expiredEndpoints.length}`
  );

  return NextResponse.json({
    sent,
    failed,
    expired_removed: expiredEndpoints.length,
    at_risk_users: atRiskUsers.length,
  });
}
