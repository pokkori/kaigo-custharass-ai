'use client';
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'kaigo_use_count';
const MAX_FREE = 3;

function getUsageCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
  } catch { return 0; }
}

export function UsageCounter() {
  const [used, setUsed] = useState(0);

  useEffect(() => {
    setUsed(getUsageCount());
    const handleStorage = () => setUsed(getUsageCount());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const remaining = Math.max(0, MAX_FREE - used);
  const pct = Math.min(100, (used / MAX_FREE) * 100);

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" role="status" aria-label={`無料残り${remaining}回`}>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-xs opacity-70">無料利用</span>
          <span className="text-xs font-bold">{remaining}/{MAX_FREE}回</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${100 - pct}%`,
              backgroundColor: remaining === 0 ? '#EF4444' : remaining === 1 ? '#F59E0B' : '#10B981',
            }}
          />
        </div>
      </div>
    </div>
  );
}
