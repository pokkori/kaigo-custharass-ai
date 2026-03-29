"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function Confetti() {
  const [particles, setParticles] = useState<{ id: number; left: number; delay: number; color: string; size: number; shape: string }[]>([]);

  useEffect(() => {
    const colors = ["#0d9488", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#06b6d4", "#FFD700"];
    const shapes = ["circle", "square", "triangle"];
    const ps = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }));
    setParticles(ps);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === "circle" ? "50%" : p.shape === "triangle" ? "0" : "2px",
            clipPath: p.shape === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" : undefined,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          50% { opacity: 0.9; }
          100% { transform: translateY(100vh) rotate(720deg) scale(0.5); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti 3.5s ease-in forwards;
        }
      `}</style>
    </div>
  );
}

/* Inline SVG: Shield icon for care/harassment protection */
function ShieldSvg() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20 mx-auto" aria-hidden="true">
      <defs>
        <linearGradient id="shield-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="38" fill="url(#shield-grad)" opacity="0.1" />
      <path d="M40 12L18 24v16c0 14 9 26 22 30 13-4 22-16 22-30V24L40 12z" fill="url(#shield-grad)" opacity="0.85" />
      <path d="M32 40l6 6 12-14" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Inline SVG: Checkmark */
function CheckSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className || "w-4 h-4"} aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="#0d9488" />
      <path d="M6 10l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SuccessContent() {
  const [showConfetti, setShowConfetti] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4500);
    // Komoju session verify
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      fetch(`/api/komoju/verify?session_id=${sessionId}`).catch(() => {});
    }
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {showConfetti && <Confetti />}
      <div className="max-w-lg w-full mx-auto px-4">
        <div className="text-center mb-10">
          <div className="mb-4 animate-pulse">
            <ShieldSvg />
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-teal-700 to-emerald-500 bg-clip-text text-transparent mb-2">
            プレミアム会員へようこそ!
          </h1>
          <p className="text-gray-500">介護カスハラAIのフル機能が解放されました</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(13,148,136,0.2)" }} className="rounded-2xl p-6 mb-8">
          <h2 className="font-bold text-teal-800 mb-3 text-sm">あなたの特典</h2>
          <ul className="space-y-2 text-sm text-teal-900">
            <li className="flex items-start gap-2"><CheckSvg className="w-4 h-4 mt-0.5 shrink-0" />カスハラ対応文・断り文・証拠記録テンプレートが無制限生成</li>
            <li className="flex items-start gap-2"><CheckSvg className="w-4 h-4 mt-0.5 shrink-0" />介護・福祉法令準拠の専門的な対応文</li>
            <li className="flex items-start gap-2"><CheckSvg className="w-4 h-4 mt-0.5 shrink-0" />重度カスハラへの毅然とした断り文(法的根拠付き)</li>
            <li className="flex items-start gap-2"><CheckSvg className="w-4 h-4 mt-0.5 shrink-0" />2026年度運営基準改正対応の証拠記録テンプレート</li>
          </ul>
        </div>

        <div className="space-y-4 mb-8">
          <h2 className="font-bold text-gray-800 text-center text-sm">まずはこの3ステップ</h2>

          <Link href="/tool" aria-label="カスハラ対応文を生成する" className="flex items-center gap-4 rounded-xl p-4 hover:shadow-md transition-all group" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(13,148,136,0.15)" }}>
            <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-800 text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-teal-200/50 group-hover:scale-105 transition-transform" style={{ fontVariantNumeric: "tabular-nums" }}>1</div>
            <div className="flex-1">
              <p className="font-bold text-gray-800 text-sm">今抱えているカスハラ状況を入力する</p>
              <p className="text-xs text-gray-400">種別・深刻度を選ぶだけで対応文が完成</p>
            </div>
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-gray-300 group-hover:text-teal-600 transition-colors" aria-hidden="true"><path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </Link>

          <Link href="/tool" aria-label="重度カスハラの断り文を確認する" className="flex items-center gap-4 rounded-xl p-4 hover:shadow-md transition-all group" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(13,148,136,0.15)" }}>
            <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-800 text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-teal-200/50 group-hover:scale-105 transition-transform" style={{ fontVariantNumeric: "tabular-nums" }}>2</div>
            <div className="flex-1">
              <p className="font-bold text-gray-800 text-sm">深刻度「重度」で毅然とした断り文を確認</p>
              <p className="text-xs text-gray-400">法的根拠を含む介護特化の対応文</p>
            </div>
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-gray-300 group-hover:text-teal-600 transition-colors" aria-hidden="true"><path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </Link>

          <Link href="/tool" aria-label="証拠記録テンプレートを活用する" className="flex items-center gap-4 rounded-xl p-4 hover:shadow-md transition-all group" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(13,148,136,0.15)" }}>
            <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-800 text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-teal-200/50 group-hover:scale-105 transition-transform" style={{ fontVariantNumeric: "tabular-nums" }}>3</div>
            <div className="flex-1">
              <p className="font-bold text-gray-800 text-sm">証拠記録テンプレートを活用する</p>
              <p className="text-xs text-gray-400">行政報告・法的対応に備えた記録管理</p>
            </div>
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-gray-300 group-hover:text-teal-600 transition-colors" aria-hidden="true"><path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </Link>
        </div>

        <div className="text-center rounded-xl p-4 mb-6" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(0,0,0,0.06)" }}>
          <p className="text-xs text-gray-500 mb-1">カスハラが発生したらすぐアクセス</p>
          <p className="text-sm font-bold text-gray-700">このサイトをブックマークしておきましょう</p>
        </div>
      </div>
    </>
  );
}

export default function SuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center py-12" style={{ background: "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 30%, #fef3c7 70%, #f0fdfa 100%)" }}>
      <Suspense fallback={<div className="text-center text-gray-500">読み込み中...</div>}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
