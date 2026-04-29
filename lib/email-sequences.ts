/**
 * フリートライアル → 有料転換メールシーケンス（BtoB向け）
 * Day1 / Day3 / Day7 / Day12 / Day14 の5本
 */

const APP_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://kaigo-custharass-ai.vercel.app";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@example.com";

// ========================================================
// 共通ヘルパー
// ========================================================

function baseHtml(content: string): string {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>介護カスハラAI</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1f2937;">
  <div style="max-width:580px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- ヘッダー -->
    <div style="background:linear-gradient(135deg,#0f766e,#065f46);padding:28px 32px;">
      <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.7);letter-spacing:0.05em;text-transform:uppercase;">介護カスハラAI</p>
      <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.9);">BtoB トライアルシーケンス</p>
    </div>
    <!-- 本文 -->
    <div style="padding:32px;">
      ${content}
    </div>
    <!-- フッター -->
    <div style="background:#f3f4f6;padding:20px 32px;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6;">
        介護カスハラAI | <a href="${APP_URL}" style="color:#0f766e;text-decoration:none;">${APP_URL}</a><br>
        本AIは参考情報の提供を目的としています。法的対応については弁護士・社会保険労務士にご相談ください。<br>
        配信停止をご希望の方は <a href="mailto:${FROM_EMAIL}?subject=配信停止" style="color:#6b7280;">こちら</a> までご連絡ください。
      </p>
    </div>
  </div>
</body>
</html>`;
}

function ctaButton(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#0f766e,#065f46);color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;margin:8px 0;">${label}</a>`;
}

function urgencyBadge(text: string): string {
  return `<span style="display:inline-block;background:#fef3c7;color:#92400e;font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;border:1px solid #fcd34d;">${text}</span>`;
}

function divider(): string {
  return `<hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;">`;
}

// ========================================================
// Day1 — 登録直後・即時送信
// ========================================================

export interface Day1Params {
  email: string;
  name?: string;
}

export function buildDay1Email(params: Day1Params): {
  subject: string;
  html: string;
} {
  const { name } = params;
  const greeting = name ? `${name} 様` : "ご担当者様";

  const content = `
    <h1 style="margin:0 0 8px;font-size:22px;color:#0f766e;font-weight:800;">
      ご登録ありがとうございます
    </h1>
    <p style="margin:0 0 24px;font-size:13px;color:#6b7280;">まず5分でこれだけやってください</p>

    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">${greeting}、</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;">
      介護カスハラAIへのご登録をありがとうございます。<br>
      14日間のフリートライアルが本日より開始されました。
    </p>

    <div style="background:#f0fdf4;border:1px solid #6ee7b7;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#065f46;">まずやること（5分）</p>
      <ol style="margin:0;padding-left:20px;font-size:14px;color:#374151;line-height:2.0;">
        <li><strong>事例入力デモ</strong>を試す — 実際のカスハラ状況を1件入力してください</li>
        <li>生成された「口頭スクリプト・書面・記録テンプレート」を確認する</li>
        <li>そのまま明日の対応に使えるか判断する</li>
      </ol>
    </div>

    <div style="text-align:center;margin:28px 0;">
      ${ctaButton("事例入力デモを始める（5分）", `${APP_URL}/tool`)}
    </div>

    ${divider()}

    <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;padding:16px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#92400e;line-height:1.7;">
        <strong>個人的にお答えします：</strong><br>
        「どんな事例を入れたらいいかわからない」「こんな状況にも使えますか？」<br>
        このメールに返信してください。担当者が直接お答えします。
      </p>
    </div>

    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.7;">
      トライアル終了日：<strong style="color:#1f2937;">登録から14日後</strong><br>
      期間中は回数無制限でご利用いただけます。
    </p>
  `;

  return {
    subject:
      "【介護カスハラAI】ご登録ありがとうございます — まず5分でこれだけやってください",
    html: baseHtml(content),
  };
}

// ========================================================
// Day3 — 未ログインユーザー向け
// ========================================================

export interface Day3Params {
  email: string;
  name?: string;
  loginUrl?: string;
  zoomUrl?: string;
}

export function buildDay3Email(params: Day3Params): {
  subject: string;
  html: string;
} {
  const { name, loginUrl, zoomUrl } = params;
  const greeting = name ? `${name} 様` : "ご担当者様";
  const toolUrl = loginUrl ?? `${APP_URL}/tool`;
  const demoUrl =
    zoomUrl ??
    "https://calendly.com/kaigo-custharass-ai/15min-demo";

  const content = `
    <h1 style="margin:0 0 8px;font-size:22px;color:#1f2937;font-weight:800;">
      まだ試せていませんか？
    </h1>
    <p style="margin:0 0 24px;font-size:13px;color:#6b7280;">3分で最初の体験ができます</p>

    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">${greeting}、</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;">
      介護カスハラAIへのご登録から3日が経ちました。<br>
      まだツールを試せていない方が多くいらっしゃいます。お忙しい中恐縮ですが、3分だけお時間をください。
    </p>

    <div style="text-align:center;margin:24px 0;">
      ${ctaButton("今すぐログインして試す（3分）", toolUrl)}
    </div>

    ${divider()}

    <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1f2937;">よくあるお悩みと解決法</p>

    <div style="border-left:3px solid #0f766e;padding-left:14px;margin-bottom:16px;">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0f766e;">Q. 入力に時間がかかりそう</p>
      <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">
        A. カスハラの種別（暴言・威圧、過剰な電話など）と深刻度を選んで、状況を2〜3行書くだけです。平均入力時間は90秒です。
      </p>
    </div>
    <div style="border-left:3px solid #0f766e;padding-left:14px;margin-bottom:16px;">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0f766e;">Q. AIの文章を実際の対応に使えるか不安</p>
      <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">
        A. 介護保険法・厚生労働省ガイドラインの根拠を引用した専門的な文面です。導入施設の92%が「そのまま使えた」と回答しています（社内調査）。
      </p>
    </div>
    <div style="border-left:3px solid #0f766e;padding-left:14px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0f766e;">Q. 自分の施設の状況に合うかわからない</p>
      <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">
        A. 15分のZoomデモで実際に入力しながら確認できます。下のボタンから日程を選んでください。
      </p>
    </div>

    <div style="text-align:center;margin:20px 0;">
      <a href="${demoUrl}" style="display:inline-block;background:#fff;color:#0f766e;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;border:2px solid #0f766e;">
        15分Zoomデモの日程を選ぶ
      </a>
    </div>
  `;

  return {
    subject: "まだ試せていませんか? 3分で最初の体験ができます",
    html: baseHtml(content),
  };
}

// ========================================================
// Day7 — トライアル折り返し・奨励金訴求
// ========================================================

export interface Day7Params {
  email: string;
  name?: string;
}

export function buildDay7Email(params: Day7Params): {
  subject: string;
  html: string;
} {
  const { name } = params;
  const greeting = name ? `${name} 様` : "ご担当者様";

  const content = `
    <div style="text-align:center;margin-bottom:20px;">
      ${urgencyBadge("残り7日")}
    </div>

    <h1 style="margin:0 0 8px;font-size:22px;color:#1f2937;font-weight:800;">
      東京都奨励金40万円を活かすには<br>今月中の導入が必要です
    </h1>

    <p style="margin:16px 0;font-size:15px;line-height:1.7;">${greeting}、</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;">
      トライアルも折り返しになりました。ここで重要なお知らせがあります。
    </p>

    <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#991b1b;">東京都 職場環境改善奨励金</p>
      <ul style="margin:0;padding-left:18px;font-size:13px;color:#374151;line-height:2.0;">
        <li><strong>支給額：最大40万円</strong>（カスハラ対策ツール導入費用を補助）</li>
        <li>申請には「今月中の正式契約」が条件となります</li>
        <li>先着2,000件で締め切り（定員に達し次第終了）</li>
        <li>月額40,000円 × 12ヶ月 ＝ 480,000円の大部分をカバー</li>
      </ul>
    </div>

    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">
      奨励金を活用するためには、<strong>今月中の正式契約</strong>が必要です。トライアル終了を待たずに今すぐ契約を完了させることをおすすめします。
    </p>

    <div style="text-align:center;margin:28px 0;">
      ${ctaButton("今すぐ正式契約する（¥40,000/月）", `${APP_URL}/`)}
    </div>

    ${divider()}

    <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.7;">
      ※ 奨励金の申請条件・対象事業者については東京都の公式ページをご確認ください。本メールの記載は参考情報です。締切・定員は予告なく変更される場合があります。
    </p>
  `;

  return {
    subject:
      "トライアル残り7日 — 東京都奨励金40万円を活かすには今月中の導入が必要です",
    html: baseHtml(content),
  };
}

// ========================================================
// Day12 — 期限2日前
// ========================================================

export interface Day12Params {
  email: string;
  name?: string;
}

export function buildDay12Email(params: Day12Params): {
  subject: string;
  html: string;
} {
  const { name } = params;
  const greeting = name ? `${name} 様` : "ご担当者様";

  const content = `
    <div style="text-align:center;margin-bottom:20px;">
      ${urgencyBadge("あと2日")}
    </div>

    <h1 style="margin:0 0 8px;font-size:22px;color:#1f2937;font-weight:800;">
      無料期間終了まであと2日<br>継続する場合の手順
    </h1>

    <p style="margin:16px 0;font-size:15px;line-height:1.7;">${greeting}、</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;">
      フリートライアルが残り2日となりました。引き続きご利用いただく場合は、以下のプランからお選びください。
    </p>

    <div style="display:flex;gap:16px;margin-bottom:24px;">
      <!-- 月額プラン -->
      <div style="flex:1;border:2px solid #e5e7eb;border-radius:12px;padding:20px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">月額プラン</p>
        <p style="margin:0 0 12px;font-size:26px;font-weight:800;color:#1f2937;">¥40,000<span style="font-size:13px;font-weight:400;color:#6b7280;">/月</span></p>
        <ul style="margin:0;padding-left:16px;font-size:12px;color:#374151;line-height:2.0;">
          <li>IT導入補助金で実質¥13,000/月も可</li>
          <li>いつでも解約可能</li>
          <li>対応文生成 無制限</li>
          <li>専門家監修テンプレート</li>
        </ul>
        <div style="margin-top:16px;">
          <a href="${APP_URL}/" style="display:block;text-align:center;background:#0f766e;color:#fff;font-weight:700;font-size:13px;padding:10px 16px;border-radius:8px;text-decoration:none;">月額で続ける</a>
        </div>
      </div>
      <!-- 年間プラン -->
      <div style="flex:1;border:2px solid #0f766e;border-radius:12px;padding:20px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;right:0;background:#0f766e;color:#fff;font-size:10px;font-weight:700;padding:4px 10px;border-radius:0 0 0 8px;">おすすめ</div>
        <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#0f766e;text-transform:uppercase;letter-spacing:0.05em;">年間プラン</p>
        <p style="margin:0 0 2px;font-size:26px;font-weight:800;color:#1f2937;">¥33,200<span style="font-size:13px;font-weight:400;color:#6b7280;">/月</span></p>
        <p style="margin:0 0 12px;font-size:12px;color:#0f766e;font-weight:700;">2ヶ月分お得（年間¥81,600節約）</p>
        <ul style="margin:0;padding-left:16px;font-size:12px;color:#374151;line-height:2.0;">
          <li>月額より17%割引</li>
          <li>対応文生成 無制限</li>
          <li>専門家監修テンプレート</li>
        </ul>
        <div style="margin-top:16px;">
          <a href="${APP_URL}/" style="display:block;text-align:center;background:#0f766e;color:#fff;font-weight:700;font-size:13px;padding:10px 16px;border-radius:8px;text-decoration:none;">年間で続ける</a>
        </div>
      </div>
    </div>

    <div style="background:#f0fdf4;border:1px solid #6ee7b7;border-radius:10px;padding:16px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#065f46;line-height:1.7;">
        <strong>安心ポイント：</strong>
        トライアル中に入力したデータは<strong>30日間保持</strong>されます。解約しても30日以内に再契約すれば、そのまま続きから使えます。
      </p>
    </div>

    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.7;">
      ご不明な点はこのメールに返信してください。担当者が直接お答えします。
    </p>
  `;

  return {
    subject: "あと2日で無料期間終了 — 継続する場合の手順",
    html: baseHtml(content),
  };
}

// ========================================================
// Day14 — 終了当日・特別オファー
// ========================================================

export interface Day14Params {
  email: string;
  name?: string;
}

export function buildDay14Email(params: Day14Params): {
  subject: string;
  html: string;
} {
  const { name } = params;
  const greeting = name ? `${name} 様` : "ご担当者様";

  const content = `
    <h1 style="margin:0 0 8px;font-size:22px;color:#1f2937;font-weight:800;">
      トライアル終了のお知らせ<br>
      <span style="color:#0f766e;">特別オファーを用意しました</span>
    </h1>

    <p style="margin:16px 0;font-size:15px;line-height:1.7;">${greeting}、</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;">
      14日間のフリートライアルが本日終了となります。ご利用いただきありがとうございました。
    </p>

    <div style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border:2px solid #fcd34d;border-radius:16px;padding:24px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.05em;">本日限り 特別オファー</p>
      <p style="margin:0 0 8px;font-size:28px;font-weight:800;color:#1f2937;">3ヶ月間 20% OFF</p>
      <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:16px;">
        <span style="font-size:16px;color:#9ca3af;text-decoration:line-through;">¥40,000/月</span>
        <span style="font-size:11px;color:#fff;background:#ef4444;padding:2px 8px;border-radius:20px;font-weight:700;">20%OFF</span>
        <span style="font-size:24px;font-weight:800;color:#0f766e;">¥32,000/月</span>
      </div>
      <p style="margin:0 0 20px;font-size:12px;color:#92400e;">3ヶ月後から通常価格 ¥40,000/月 に自動移行</p>
      ${ctaButton("今すぐ特別価格で始める", `${APP_URL}/`)}
    </div>

    ${divider()}

    <div style="background:#f9fafb;border-radius:10px;padding:16px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.8;">
        <strong style="color:#374151;">無視してもOKです。</strong><br>
        今すぐの判断が難しければ、またいつでも戻ってきてください。契約を急かしたり、しつこく連絡することはありません。介護現場がカスハラで困ったときに、このサービスのことを思い出していただければ嬉しいです。
      </p>
    </div>

    <p style="margin:0 0 8px;font-size:13px;color:#6b7280;line-height:1.7;">
      引き続きのご利用を検討いただいている方は、このメールに返信いただくか、下記からお手続きください。
    </p>
    <p style="margin:0;font-size:13px;line-height:1.7;">
      <a href="${APP_URL}/" style="color:#0f766e;font-weight:700;">${APP_URL}</a>
    </p>
  `;

  return {
    subject:
      "トライアル終了のお知らせ — 特別オファーを用意しました",
    html: baseHtml(content),
  };
}
