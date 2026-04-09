"use client";
import { useState, useEffect } from "react";

export function DeadlineCountdown() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const deadline = new Date("2026-10-01");
    const diff = deadline.getTime() - Date.now();
    setDays(Math.max(0, Math.ceil(diff / 86400000)));
  }, []);

  if (days === null) return null;

  return (
    <div className="rounded-xl bg-red-900/40 border-2 border-red-500/50 p-4 text-center mb-6">
      <p className="text-xs font-bold text-red-400 mb-1">カスハラ対策【義務化】まで</p>
      <p className="text-4xl font-black text-red-300">
        {days}<span className="text-lg ml-1 font-bold">日</span>
      </p>
      <p className="text-xs text-red-400/70 mt-1">2026年改正法施行 — 今すぐ準備</p>
    </div>
  );
}
