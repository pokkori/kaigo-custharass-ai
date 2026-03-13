"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

function Confetti() {
  const [particles, setParticles] = useState<{ id: number; left: number; delay: number; color: string; size: number }[]>([]);

  useEffect(() => {
    const colors = ["#0d9488", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#06b6d4"];
    const ps = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 6,
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
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti 3s ease-in forwards;
        }
      `}</style>
    </div>
  );
}

function SuccessContent() {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showConfetti && <Confetti />}
      <div className="max-w-lg w-full mx-auto px-4">
        <div className="text-center mb-10">
          <div className="text-7xl mb-4">🏥</div>
          <h1 className="text-3xl font-black text-teal-800 mb-2">プレミアム会員へようこそ！</h1>
          <p className="text-gray-500">介護カスハラAIのフル機能が解放されました</p>
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 mb-8">
          <h2 className="font-bold text-teal-800 mb-3 text-sm">あなたの特典</h2>
          <ul className="space-y-2 text-sm text-teal-900">
            <li className="flex items-start gap-2"><span className="text-teal-600 mt-0.5">✓</span>カスハラ対応文・断り文・証拠記録テンプレートが無制限生成</li>
            <li className="flex items-start gap-2"><span className="text-teal-600 mt-0.5">✓</span>介護・福祉法令準拠の専門的な対応文</li>
            <li className="flex items-start gap-2"><span className="text-teal-600 mt-0.5">✓</span>重度カスハラへの毅然とした断り文（法的根拠付き）</li>
            <li className="flex items-start gap-2"><span className="text-teal-600 mt-0.5">✓</span>2026年度運営基準改正対応の証拠記録テンプレート</li>
          </ul>
        </div>

        <div className="space-y-4 mb-8">
          <h2 className="font-bold text-gray-800 text-center text-sm">まずはこの3ステップ</h2>

          <Link href="/tool" className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 hover:border-teal-400 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-teal-700 text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0 group-hover:bg-teal-600">1</div>
            <div className="flex-1">
              <p className="font-bold text-gray-800 text-sm">今抱えているカスハラ状況を入力する</p>
              <p className="text-xs text-gray-400">種別・深刻度を選ぶだけで対応文が完成</p>
            </div>
            <span className="text-gray-300 group-hover:text-teal-600 transition-colors">→</span>
          </Link>

          <Link href="/tool" className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 hover:border-teal-400 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-teal-700 text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0 group-hover:bg-teal-600">2</div>
            <div className="flex-1">
              <p className="font-bold text-gray-800 text-sm">深刻度「重度」で毅然とした断り文を確認</p>
              <p className="text-xs text-gray-400">法的根拠を含む介護特化の対応文</p>
            </div>
            <span className="text-gray-300 group-hover:text-teal-600 transition-colors">→</span>
          </Link>

          <Link href="/tool" className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 hover:border-teal-400 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-teal-700 text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0 group-hover:bg-teal-600">3</div>
            <div className="flex-1">
              <p className="font-bold text-gray-800 text-sm">証拠記録テンプレートを活用する</p>
              <p className="text-xs text-gray-400">行政報告・法的対応に備えた記録管理</p>
            </div>
            <span className="text-gray-300 group-hover:text-teal-600 transition-colors">→</span>
          </Link>
        </div>

        <div className="text-center bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
          <p className="text-xs text-gray-500 mb-1">カスハラが発生したらすぐアクセス</p>
          <p className="text-sm font-bold text-gray-700">このサイトをブックマークしておきましょう</p>
        </div>
      </div>
    </>
  );
}

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center py-12">
      <Suspense fallback={<div className="text-center text-gray-500">読み込み中...</div>}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
