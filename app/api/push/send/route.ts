/**
 * POST /api/push/send
 * 指定ユーザー（または全員）に Web Push 通知を送信
 * 認証: CRON_SECRET ヘッダーまたは内部呼び出し専用
 */

import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// VAPID 設定
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT ?? "mailto:admin@example.com";

interface SendPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  /** 特定ユーザーIDのみに送る場合 */
  userId?: string;
}

export async function POST(req: NextRequest) {
  // 認証チェック
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!vapidPublicKey || !vapidPrivateKey) {
    return NextResponse.json(
      { error: "VAPID キーが設定されていません" },
      { status: 500 }
    );
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  let payload: SendPayload;
  try {
    payload = (await req.json()) as SendPayload;
  } catch {
    return NextResponse.json({ error: "不正なリクエストボディ" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // サブスクリプション一覧を取得
  let query = supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth");

  if (payload.userId) {
    query = query.eq("user_id", payload.userId);
  }

  const { data: subscriptions, error } = await query;

  if (error) {
    console.error("[push/send] Supabase fetch error:", error.message);
    return NextResponse.json({ error: "DB エラー" }, { status: 500 });
  }

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ sent: 0, message: "送信対象なし" });
  }

  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    tag: payload.tag ?? "kaigo-notification",
    data: { url: payload.url ?? "/" },
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        notificationPayload
      )
    )
  );

  // 410 Gone（無効なサブスクリプション）を削除
  const expiredEndpoints: string[] = [];
  results.forEach((result, idx) => {
    if (
      result.status === "rejected" &&
      result.reason?.statusCode === 410
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

  return NextResponse.json({
    sent,
    failed,
    expired_removed: expiredEndpoints.length,
  });
}
