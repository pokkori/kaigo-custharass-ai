/**
 * POST /api/push/subscribe
 * Web Push サブスクリプションを Supabase に保存
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface PushSubscriptionBody {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PushSubscriptionBody;

    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return NextResponse.json(
        { error: "endpoint / keys.p256dh / keys.auth は必須です" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // upsert: endpoint が同じなら上書き
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: body.userId ?? null,
        endpoint: body.endpoint,
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
      },
      { onConflict: "endpoint" }
    );

    if (error) {
      console.error("[push/subscribe] Supabase error:", error.message);
      return NextResponse.json(
        { error: "サブスクリプション保存に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[push/subscribe] unexpected error:", err);
    return NextResponse.json({ error: "不正なリクエスト" }, { status: 400 });
  }
}

/**
 * DELETE /api/push/subscribe
 * サブスクリプション解除
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = (await req.json()) as { endpoint: string };

    if (!body.endpoint) {
      return NextResponse.json({ error: "endpoint は必須です" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    await supabase
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", body.endpoint);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[push/subscribe DELETE] unexpected error:", err);
    return NextResponse.json({ error: "不正なリクエスト" }, { status: 400 });
  }
}
