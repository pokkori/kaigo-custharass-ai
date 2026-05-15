import { Resend } from "resend";
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

async function saveToSupabase(name: string, email: string, subject: string, message: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await supabase.from("contact_submissions").insert({
      name, email, subject: subject || null, message,
      service: "kaigo-custharass-ai",
      created_at: new Date().toISOString(),
    });
  } catch {
    // テーブル未作成などのエラーは無視
  }
}

async function generateAutoReply(name: string, message: string): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: `あなたは「介護カスハラAI」のサポート担当です。以下の問い合わせに対して、丁寧な自動一次返信メール本文を日本語で作成してください。

【問い合わせ者】${name} 様
【内容】${message}

以下の条件を守ること:
- 200〜300文字程度
- 担当者が内容を確認し2営業日以内に返信する旨を伝える
- 補助金・デモ・料金の問い合わせであれば、その点に触れる
- HTMLタグなし・プレーンテキストのみ
- 書き出しは「${name} 様」から始める
- 締めは「介護カスハラAI サポートチーム」`,
        },
      ],
    });
    const content = response.content[0];
    return content.type === "text" ? content.text : "";
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "必須項目が未入力です" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "メールアドレスの形式が正しくありません" }, { status: 400 });
    }

    // 常にSupabaseに保存（メール設定に依存しない）
    await saveToSupabase(name, email, subject || "", message);

    if (process.env.RESEND_API_KEY) {
      // 管理者への通知
      await resend.emails.send({
        from: "noreply@resend.dev",
        to: process.env.SUPPORT_EMAIL || "support@example.com",
        subject: `[お問い合わせ] ${subject || "お問い合わせ"}`,
        html: `<h2>新しいお問い合わせ</h2><p><strong>氏名:</strong> ${name}</p><p><strong>メール:</strong> ${email}</p><p><strong>件名:</strong> ${subject || "（なし）"}</p><p><strong>内容:</strong><br>${message.replace(/\n/g, "<br>")}</p>`,
      });

      // Claude AI による自動一次返信生成
      const aiReply = await generateAutoReply(name, message);
      const replyBody = aiReply
        ? aiReply
        : `${name} 様\n\nお問い合わせいただきありがとうございます。\n内容を確認の上、2営業日以内にご返信いたします。\n\n介護カスハラAI サポートチーム`;

      await resend.emails.send({
        from: "noreply@resend.dev",
        to: email,
        subject: "お問い合わせを受け付けました【介護カスハラAI】",
        html: `<pre style="font-family:sans-serif;white-space:pre-wrap;">${replyBody}</pre>`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "送信に失敗しました" }, { status: 500 });
  }
}
