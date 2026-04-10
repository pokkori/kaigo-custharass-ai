/**
 * cron-notify.ts
 * Vercel Cron 実行結果をSlack通知するユーティリティ
 */
export async function notifyCronResult(
  cronName: string,
  result: { ok: boolean; [key: string]: unknown },
  options: { silent_on_success?: boolean } = {}
): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const { silent_on_success = false } = options;
  if (result.ok && silent_on_success) return;

  const icon = result.ok ? "✅" : "❌";
  const timestamp = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  const details = Object.entries(result)
    .filter(([k]) => k !== "ok")
    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v).slice(0, 50) : v}`)
    .join(" / ");

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `${icon} ${cronName} (${timestamp})\n${details}` }),
    });
  } catch {
    console.error(`[cron-notify] Slack通知失敗: ${cronName}`);
  }
}
