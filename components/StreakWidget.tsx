"use client";

import { useEffect, useState } from "react";

// ローカルストレージキー（Supabase未認証ユーザー向けフォールバック）
const LOCAL_KEY = "kaigo_streak_v2";

interface LocalStreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  streakFreezeCount: number;
}

function loadLocalStreak(): LocalStreakData {
  if (typeof window === "undefined") {
    return { currentStreak: 0, longestStreak: 0, lastActivityDate: "", streakFreezeCount: 0 };
  }
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return { currentStreak: 0, longestStreak: 0, lastActivityDate: "", streakFreezeCount: 0 };
    return JSON.parse(raw);
  } catch {
    return { currentStreak: 0, longestStreak: 0, lastActivityDate: "", streakFreezeCount: 0 };
  }
}

function updateLocalStreak(): LocalStreakData {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const dayBefore = new Date(Date.now() - 172800000).toISOString().slice(0, 10);
  const data = loadLocalStreak();

  if (data.lastActivityDate === today) return data;

  let newStreak = data.currentStreak;
  let newFreeze = data.streakFreezeCount;

  if (data.lastActivityDate === yesterday) {
    newStreak += 1;
  } else if (data.lastActivityDate === dayBefore && data.streakFreezeCount > 0) {
    newStreak += 1;
    newFreeze -= 1;
  } else {
    newStreak = 1;
  }

  const updated: LocalStreakData = {
    currentStreak: newStreak,
    longestStreak: Math.max(data.longestStreak, newStreak),
    lastActivityDate: today,
    streakFreezeCount: newFreeze,
  };

  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
  } catch { /* noop */ }

  return updated;
}

interface Milestone {
  days: number;
  label: string;
  color: string;
}

const MILESTONES: Milestone[] = [
  { days: 7, label: "7日", color: "#CD7F32" },
  { days: 14, label: "14日", color: "#C0C0C0" },
  { days: 30, label: "30日", color: "#FFD700" },
  { days: 100, label: "100日", color: "#E8E0FF" },
];

function getNextMilestone(current: number): Milestone | null {
  return MILESTONES.find((m) => m.days > current) ?? null;
}

function getCurrentMilestone(current: number): Milestone | null {
  return [...MILESTONES].reverse().find((m) => current >= m.days) ?? null;
}

// 炎 SVGアイコン（絵文字不使用）
function FlameIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 23c-4.418 0-8-3.582-8-8 0-4.072 3.215-9.604 8-16 4.785 6.396 8 11.928 8 16 0 4.418-3.582 8-8 8zm0-3c2.761 0 5-2.239 5-5 0-2.38-1.826-5.632-5-10.708C8.826 9.368 7 12.62 7 15c0 2.761 2.239 5 5 5z" />
    </svg>
  );
}

// シールド（フリーズ）SVGアイコン
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
  );
}

interface StreakWidgetProps {
  /** Supabase認証済みユーザーIDがある場合は渡すとサーバー側ストリークと連携可能 */
  userId?: string;
  className?: string;
}

export function StreakWidget({ userId: _userId, className = "" }: StreakWidgetProps) {
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [freezeCount, setFreezeCount] = useState(0);
  const [isNewDay, setIsNewDay] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const before = loadLocalStreak();
    const after = updateLocalStreak();
    setStreak(after.currentStreak);
    setLongestStreak(after.longestStreak);
    setFreezeCount(after.streakFreezeCount);
    setIsNewDay(before.lastActivityDate !== after.lastActivityDate);
    setMounted(true);
  }, []);

  if (!mounted || streak === 0) return null;

  const nextMilestone = getNextMilestone(streak);
  const currentMilestone = getCurrentMilestone(streak);
  const progressToNext = nextMilestone
    ? Math.min(100, Math.round((streak / nextMilestone.days) * 100))
    : 100;
  const prevMilestoneDays = nextMilestone
    ? (MILESTONES[MILESTONES.indexOf(nextMilestone) - 1]?.days ?? 0)
    : MILESTONES[MILESTONES.length - 1].days;
  const segmentProgress = nextMilestone
    ? Math.min(
        100,
        Math.round(
          ((streak - prevMilestoneDays) /
            (nextMilestone.days - prevMilestoneDays)) *
            100
        )
      )
    : 100;

  return (
    <div
      className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 ${className}`}
      role="status"
      aria-label={`${streak}日連続利用中`}
    >
      {/* ヘッダー行 */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <FlameIcon
            className={`w-8 h-8 ${streak >= 7 ? "text-orange-400" : "text-orange-500/70"}`}
          />
          {isNewDay && streak > 1 && (
            <span
              className="absolute -top-1 -right-1 text-[10px] font-bold text-orange-300 animate-bounce"
              aria-live="polite"
            >
              +1
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white tabular-nums">
              {streak}
            </span>
            <span className="text-sm text-gray-400">日連続</span>
          </div>
          {longestStreak > streak && (
            <p className="text-xs text-gray-500 mt-0.5">
              最長 {longestStreak}日
            </p>
          )}
        </div>

        {/* フリーズ残数 */}
        {freezeCount > 0 && (
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20"
            title={`ストリーク・フリーズ残り${freezeCount}回`}
          >
            <ShieldIcon className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-blue-300">
              x{freezeCount}
            </span>
          </div>
        )}
      </div>

      {/* 達成バッジ */}
      {currentMilestone && (
        <div
          className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
          style={{
            backgroundColor: `${currentMilestone.color}22`,
            color: currentMilestone.color,
            border: `1px solid ${currentMilestone.color}44`,
          }}
        >
          {currentMilestone.label}達成
        </div>
      )}

      {/* 次のマイルストーンまでの進捗バー */}
      {nextMilestone && (
        <div className="mt-3 space-y-1">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>次の目標: {nextMilestone.label}連続</span>
            <span>
              {streak} / {nextMilestone.days}日
            </span>
          </div>
          <div
            className="w-full h-2 rounded-full bg-white/10 overflow-hidden"
            role="progressbar"
            aria-valuenow={streak}
            aria-valuemin={prevMilestoneDays}
            aria-valuemax={nextMilestone.days}
            aria-label={`次の目標まで${nextMilestone.days - streak}日`}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${segmentProgress}%`,
                backgroundColor: nextMilestone.color,
                opacity: 0.85,
              }}
            />
          </div>
        </div>
      )}

      {/* 100日達成の場合 */}
      {streak >= 100 && (
        <p className="mt-2 text-xs text-purple-300 font-medium text-center">
          100日連続達成 - 伝説のユーザー
        </p>
      )}
    </div>
  );
}
