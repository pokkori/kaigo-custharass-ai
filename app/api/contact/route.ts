import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "support@resend.dev",
        to: process.env.SUPPORT_EMAIL || "support@example.com",
        subject: `[お問い合わせ] ${subject || "お問い合わせ"}`,
        html: `<h2>新しいお問い合わせ</h2><p><strong>氏名:</strong> ${name}</p><p><strong>メール:</strong> ${email}</p><p><strong>件名:</strong> ${subject || "（なし）"}</p><p><strong>内容:</strong><br>${message.replace(/\n/g, "<br>")}</p>`,
      });

      await resend.emails.send({
        from: "support@resend.dev",
        to: email,
        subject: "お問い合わせを受け付けました",
        html: `<p>${name} 様</p><p>お問い合わせいただきありがとうございます。</p><p>内容を確認の上、<strong>2営業日以内</strong>にご返信いたします。</p><br><p>【お問い合わせ内容】</p><p>${message.replace(/\n/g, "<br>")}</p>`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "送信に失敗しました" }, { status: 500 });
  }
}
