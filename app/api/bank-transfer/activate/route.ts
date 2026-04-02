import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Resend はモジュールレベルで初期化せず、API_KEY がない環境でのクラッシュを防ぐ
function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@example.com";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return new NextResponse(buildHtml("エラー", "tokenとemailは必須です。", false), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const supabase = getSupabaseAdmin();

  // トークンとメールで申し込みレコードを検索
  const { data, error: fetchError } = await supabase
    .from("bank_transfer_applications")
    .select("*")
    .eq("activation_token", token)
    .eq("email", email.toLowerCase())
    .eq("app_id", "kaigo-cusharass-ai")
    .single();

  if (fetchError || !data) {
    return new NextResponse(buildHtml("エラー", "申し込み情報が見つかりませんでした。トークンまたはメールアドレスが正しくありません。", false), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (data.is_active) {
    return new NextResponse(buildHtml("確認", `${data.email} はすでにアクティベート済みです。`, true), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // is_active を true に更新
  const { error: updateError } = await supabase
    .from("bank_transfer_applications")
    .update({
      is_active: true,
      activated_at: new Date().toISOString(),
    })
    .eq("activation_token", token)
    .eq("email", email.toLowerCase());

  if (updateError) {
    console.error("[bank-transfer/activate] update error:", updateError.message);
    return new NextResponse(buildHtml("エラー", "アクティベートに失敗しました。もう一度お試しください。", false), {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // ユーザーにアクティベーション完了メール送信
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: "【介護カスハラAI】アカウントが有効化されました",
      html: buildActivationEmailHtml({ name: data.name, planLabel: data.plan_label }),
    });
  } catch (emailErr) {
    console.error("[bank-transfer/activate] email send error:", emailErr);
    // メール失敗はアクティベート自体は成功として扱う
  }

  return new NextResponse(
    buildHtml("アクティベート完了", `${data.name} 様（${data.email}）のアカウントを有効化しました。`, true),
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

function buildHtml(title: string, message: string, success: boolean): string {
  const color = success ? "#0f766e" : "#dc2626";
  const bg = success ? "#f0fdf4" : "#fef2f2";
  const border = success ? "#6ee7b7" : "#fca5a5";
  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><title>${title} - 介護カスハラAI 管理</title></head>
<body style="font-family: sans-serif; background: #f9fafb; padding: 40px; text-align: center;">
  <div style="max-width: 480px; margin: 0 auto; background: ${bg}; border: 1px solid ${border}; border-radius: 12px; padding: 32px;">
    <h1 style="color: ${color}; font-size: 22px; margin-bottom: 12px;">${title}</h1>
    <p style="color: #374151; font-size: 15px;">${message}</p>
    <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">介護カスハラAI 管理画面</p>
  </div>
</body>
</html>`;
}

function buildActivationEmailHtml(params: { name: string; planLabel: string }): string {
  const { name, planLabel } = params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kaigo-cusharass-ai.vercel.app";
  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><title>アカウント有効化完了</title></head>
<body style="font-family: sans-serif; color: #222; background: #f9fafb; padding: 24px;">
  <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.07);">
    <h1 style="font-size: 20px; color: #0f766e; margin-bottom: 4px;">アカウントが有効化されました</h1>
    <p style="color: #555; font-size: 14px; margin-bottom: 24px;">介護カスハラAI</p>

    <p>${name} 様</p>
    <p>ご入金を確認いたしました。${planLabel}のアカウントが有効化されました。</p>
    <p>以下からサービスをご利用いただけます:</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${appUrl}/tool" style="background: #0f766e; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
        介護カスハラAIを使う →
      </a>
    </div>

    <p style="font-size: 13px; color: #6b7280;">ご不明な点は <a href="mailto:${FROM_EMAIL}" style="color: #0f766e;">${FROM_EMAIL}</a> までお問い合わせください。</p>
    <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
    <p style="font-size: 12px; color: #9ca3af; margin: 0;">介護カスハラAI | 本AIは参考情報の提供を目的としています。</p>
  </div>
</body>
</html>`;
}
