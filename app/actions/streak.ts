"use server";

import { getSupabaseAdmin } from "@/lib/supabase";

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakFreezeCount: number;
  isNewDay: boolean;
  milestoneReached: number | null;
}

const MILESTONES = [7, 14, 30, 100];

/**
 * ストリーク更新 Server Action
 * - 今日がまだ未アクティブなら current_streak をインクリメント
 * - 最終アクティビティ日から2日以上経過していたらリセット
 * - freeze_count が1以上あれば1日スキップを救済
 */
export async function updateStreak(userId: string): Promise<StreakResult> {
  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);

  // 既存レコードを取得（なければ新規作成）
  const { data: existing } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!existing) {
    // 初回 → INSERT
    const { data: inserted } = await supabase
      .from("user_streaks")
      .insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: today,
        streak_freeze_count: 0,
      })
      .select()
      .single();

    return {
      currentStreak: 1,
      longestStreak: 1,
      lastActivityDate: today,
      streakFreezeCount: 0,
      isNewDay: true,
      milestoneReached: null,
    };
  }

  const last = existing.last_activity_date as string | null;

  // 今日すでにアクティブ → そのまま返す
  if (last === today) {
    return {
      currentStreak: existing.current_streak,
      longestStreak: existing.longest_streak,
      lastActivityDate: last,
      streakFreezeCount: existing.streak_freeze_count,
      isNewDay: false,
      milestoneReached: null,
    };
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const dayBefore = new Date(Date.now() - 172800000).toISOString().slice(0, 10);

  let newStreak = existing.current_streak;
  let newFreezeCount = existing.streak_freeze_count;

  if (last === yesterday) {
    // 連続継続
    newStreak += 1;
  } else if (last === dayBefore && existing.streak_freeze_count > 0) {
    // 1日スキップ、フリーズで救済
    newStreak += 1;
    newFreezeCount -= 1;
  } else {
    // リセット
    newStreak = 1;
  }

  const newLongest = Math.max(existing.longest_streak, newStreak);

  // マイルストーン判定（前回のストリークと今回の差分でちょうど到達したか）
  const prevStreak = existing.current_streak;
  const milestoneReached =
    MILESTONES.find((m) => prevStreak < m && newStreak >= m) ?? null;

  await supabase
    .from("user_streaks")
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_activity_date: today,
      streak_freeze_count: newFreezeCount,
    })
    .eq("user_id", userId);

  return {
    currentStreak: newStreak,
    longestStreak: newLongest,
    lastActivityDate: today,
    streakFreezeCount: newFreezeCount,
    isNewDay: true,
    milestoneReached: milestoneReached ?? null,
  };
}

/**
 * デイリーミッション完了 + ストリーク更新
 * @param missionType 例: "generate_response" | "copy_document" | "share_result"
 */
export async function completeDailyMission(
  userId: string,
  missionType: string
): Promise<{ xpEarned: number; streakResult: StreakResult }> {
  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);

  // ミッションレコードをupsert
  const { data: mission } = await supabase
    .from("daily_missions")
    .select("*")
    .eq("user_id", userId)
    .eq("mission_date", today)
    .eq("mission_type", missionType)
    .single();

  let xpEarned = 0;

  if (!mission) {
    // 初回 → INSERT
    await supabase.from("daily_missions").insert({
      user_id: userId,
      mission_date: today,
      mission_type: missionType,
      target_count: 1,
      current_count: 1,
      completed: true,
      reward_xp: 10,
      completed_at: new Date().toISOString(),
    });
    xpEarned = 10;
  } else if (!mission.completed) {
    const newCount = mission.current_count + 1;
    const completed = newCount >= mission.target_count;
    await supabase
      .from("daily_missions")
      .update({
        current_count: newCount,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq("id", mission.id);
    if (completed) xpEarned = mission.reward_xp;
  }

  // ストリークも同時に更新
  const streakResult = await updateStreak(userId);

  return { xpEarned, streakResult };
}

/**
 * ユーザーのストリーク情報を取得（読み取り専用）
 */
export async function getStreakInfo(userId: string): Promise<StreakResult> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!data) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      streakFreezeCount: 0,
      isNewDay: false,
      milestoneReached: null,
    };
  }

  return {
    currentStreak: data.current_streak,
    longestStreak: data.longest_streak,
    lastActivityDate: data.last_activity_date,
    streakFreezeCount: data.streak_freeze_count,
    isNewDay: false,
    milestoneReached: null,
  };
}
