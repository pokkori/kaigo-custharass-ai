/**
 * フリートライアル → 有料転換メールシーケンス CRON
 * Vercel CRON で毎日1回実行（vercel.json に設定）
 *
 * GET /api/cron/email-sequence
 * Authorization: Bearer CRON_SECRET
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  fetchPendingRecords,
  markDaySent,
  daysSinceRegistration,
} from "@/lib/trial-sequences";
import {
  buildDay1Email,
  buildDay3Email,
  buildDay7Email,
  buildDay12Email,
  buildDay14Email,
} from "@/lib/email-sequences";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Vercel Pro: 最大60秒

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "noreply@example.com";

// Day3は「最終ログインが登録後1日以内」の場合のみ送信（ログイン済みユーザーはスキップ）
function shouldSendDay3(record: Awaited<ReturnType<typeof fetchPendingRecords>>[number]): boolean {
  if (!record.last_login_at) return true; // 一度もログインしていない
  const lastLogin = new Date(record.last_login_at).getTime();
  const registered = new Date(record.registered_at).getTime();
  const hoursSinceRegistration = (lastLogin - registered) / (1000 * 60 * 60);
  // 登録後24時間以内にログインした場合はスキップ（アクティブユーザーには送らない）
  return hoursSinceRegistration > 24;
}

export async function GET(req: NextRequest) {
  // CRONシークレット認証（Vercel CRONからのみ受け付ける）
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: { email: string; day: number; status: "sent" | "skipped" | "error"; reason?: string }[] = [];

  try {
    const records = await fetchPendingRecords();

    for (const record of records) {
      const days = daysSinceRegistration(record.registered_at);

      // ---------- Day1 ----------
      // 通常は登録直後に送るが、CRONで拾えなかった分をフォロー（Day0〜1）
      if (days <= 1 && !record.day1_sent_at) {
        try {
          const { subject, html } = buildDay1Email({
            email: record.email,
            name: record.name ?? undefined,
          });
          await resend.emails.send({
            from: FROM_EMAIL,
            to: record.email,
            subject,
            html,
          });
          await markDaySent(record.email, 1);
          results.push({ email: record.email, day: 1, status: "sent" });
        } catch (err) {
          results.push({ email: record.email, day: 1, status: "error", reason: String(err) });
        }
        continue;
      }

      // ---------- Day3 ----------
      if (days >= 3 && days <= 4 && !record.day3_sent_at) {
        if (!shouldSendDay3(record)) {
          await markDaySent(record.email, 3);
          results.push({ email: record.email, day: 3, status: "skipped", reason: "active user" });
          continue;
        }
        try {
          const { subject, html } = buildDay3Email({
            email: record.email,
            name: record.name ?? undefined,
          });
          await resend.emails.send({
            from: FROM_EMAIL,
            to: record.email,
            subject,
            html,
          });
          await markDaySent(record.email, 3);
          results.push({ email: record.email, day: 3, status: "sent" });
        } catch (err) {
          results.push({ email: record.email, day: 3, status: "error", reason: String(err) });
        }
        continue;
      }

      // ---------- Day7 ----------
      if (days >= 7 && days <= 8 && !record.day7_sent_at) {
        try {
          const { subject, html } = buildDay7Email({
            email: record.email,
            name: record.name ?? undefined,
          });
          await resend.emails.send({
            from: FROM_EMAIL,
            to: record.email,
            subject,
            html,
          });
          await markDaySent(record.email, 7);
          results.push({ email: record.email, day: 7, status: "sent" });
        } catch (err) {
          results.push({ email: record.email, day: 7, status: "error", reason: String(err) });
        }
        continue;
      }

      // ---------- Day12 ----------
      if (days >= 12 && days <= 13 && !record.day12_sent_at) {
        try {
          const { subject, html } = buildDay12Email({
            email: record.email,
            name: record.name ?? undefined,
          });
          await resend.emails.send({
            from: FROM_EMAIL,
            to: record.email,
            subject,
            html,
          });
          await markDaySent(record.email, 12);
          results.push({ email: record.email, day: 12, status: "sent" });
        } catch (err) {
          results.push({ email: record.email, day: 12, status: "error", reason: String(err) });
        }
        continue;
      }

      // ---------- Day14 ----------
      if (days >= 14 && days <= 15 && !record.day14_sent_at) {
        try {
          const { subject, html } = buildDay14Email({
            email: record.email,
            name: record.name ?? undefined,
          });
          await resend.emails.send({
            from: FROM_EMAIL,
            to: record.email,
            subject,
            html,
          });
          await markDaySent(record.email, 14);
          results.push({ email: record.email, day: 14, status: "sent" });
        } catch (err) {
          results.push({ email: record.email, day: 14, status: "error", reason: String(err) });
        }
      }
    }

    const sentCount = results.filter((r) => r.status === "sent").length;
    const errorCount = results.filter((r) => r.status === "error").length;

    console.log(
      `[email-sequence CRON] processed=${records.length} sent=${sentCount} errors=${errorCount}`
    );

    return NextResponse.json({
      ok: true,
      processed: records.length,
      sent: sentCount,
      skipped: results.filter((r) => r.status === "skipped").length,
      errors: errorCount,
      results,
    });
  } catch (err) {
    console.error("[email-sequence CRON] fatal error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
