/**
 * フリートライアルシーケンス管理
 * Supabase の trial_email_sequences テーブルを利用
 *
 * テーブルスキーマ（Supabase SQL Editor で実行してください）:
 * ---------------------------------------------------------
 * create table if not exists trial_email_sequences (
 *   id            uuid primary key default gen_random_uuid(),
 *   email         text not null,
 *   name          text,
 *   app_id        text not null default 'kaigo-custharass-ai',
 *   registered_at timestamptz not null default now(),
 *   last_login_at timestamptz,
 *   converted_at  timestamptz,
 *   day1_sent_at  timestamptz,
 *   day3_sent_at  timestamptz,
 *   day7_sent_at  timestamptz,
 *   day12_sent_at timestamptz,
 *   day14_sent_at timestamptz,
 *   created_at    timestamptz not null default now(),
 *   unique(email, app_id)
 * );
 * ---------------------------------------------------------
 */

import { getSupabaseAdmin } from "./supabase";

export const APP_ID = "kaigo-custharass-ai";

export interface TrialRecord {
  id: string;
  email: string;
  name: string | null;
  app_id: string;
  registered_at: string;
  last_login_at: string | null;
  converted_at: string | null;
  day1_sent_at: string | null;
  day3_sent_at: string | null;
  day7_sent_at: string | null;
  day12_sent_at: string | null;
  day14_sent_at: string | null;
}

/**
 * トライアル開始を記録する（重複は無視して既存レコードを返す）
 */
export async function registerTrialUser(
  email: string,
  name?: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("trial_email_sequences")
    .upsert(
      {
        email: email.toLowerCase().trim(),
        name: name?.trim() ?? null,
        app_id: APP_ID,
        registered_at: new Date().toISOString(),
      },
      {
        onConflict: "email,app_id",
        ignoreDuplicates: true,
      }
    );

  if (error) {
    console.error("[trial-sequences] registerTrialUser error:", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * ログイン日時を更新する（Day3メールのスキップ判定に使用）
 */
export async function updateLastLogin(email: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase
    .from("trial_email_sequences")
    .update({ last_login_at: new Date().toISOString() })
    .eq("email", email.toLowerCase().trim())
    .eq("app_id", APP_ID);
}

/**
 * 有料転換完了を記録する（以降のメール送信をスキップ）
 */
export async function markConverted(email: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase
    .from("trial_email_sequences")
    .update({ converted_at: new Date().toISOString() })
    .eq("email", email.toLowerCase().trim())
    .eq("app_id", APP_ID);
}

/**
 * 指定Dayのメール送信済みを記録する
 */
export async function markDaySent(
  email: string,
  day: 1 | 3 | 7 | 12 | 14
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const col = `day${day}_sent_at` as
    | "day1_sent_at"
    | "day3_sent_at"
    | "day7_sent_at"
    | "day12_sent_at"
    | "day14_sent_at";

  await supabase
    .from("trial_email_sequences")
    .update({ [col]: new Date().toISOString() })
    .eq("email", email.toLowerCase().trim())
    .eq("app_id", APP_ID);
}

/**
 * 本日送信すべきレコードを全件取得する
 * - converted_at が NULL（未転換）のものだけ対象
 * - Day数の計算は registered_at を基準とする
 */
export async function fetchPendingRecords(): Promise<TrialRecord[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("trial_email_sequences")
    .select("*")
    .eq("app_id", APP_ID)
    .is("converted_at", null)
    .order("registered_at", { ascending: true });

  if (error) {
    console.error(
      "[trial-sequences] fetchPendingRecords error:",
      error.message
    );
    return [];
  }
  return (data ?? []) as TrialRecord[];
}

/**
 * 登録からの経過日数を計算する
 */
export function daysSinceRegistration(registeredAt: string): number {
  const registered = new Date(registeredAt).getTime();
  const now = Date.now();
  return Math.floor((now - registered) / (1000 * 60 * 60 * 24));
}
