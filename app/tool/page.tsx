"use client";

import { useState, useEffect } from "react";
import PayjpModal from "@/components/PayjpModal";

const CASE_TYPES = [
  "暴言・威圧",
  "過剰な電話・要求",
  "金品・サービス要求",
  "家族からのクレーム",
  "行政・苦情申し立て",
  "法的措置の示唆",
];

const REQUESTER_TYPES = ["利用者本人", "家族・親族", "その他"];
const SEVERITY_LEVELS = [
  { value: "軽度", label: "🟢 軽度（一般的な苦情・要望）" },
  { value: "中度", label: "🟡 中度（度を超えた要求・繰り返し）" },
  { value: "重度", label: "🔴 重度（暴言・脅迫・不当要求）" },
];

const FREE_LIMIT = 3;
const STORAGE_KEY = "kaigo_use_count";

function parseResult(text: string) {
  const sections = text.split(/^---$/m).map((s) => s.trim()).filter(Boolean);
  return sections;
}

export default function KaigoTool() {
  const [caseType, setCaseType] = useState(CASE_TYPES[0]);
  const [requesterType, setRequesterType] = useState(REQUESTER_TYPES[0]);
  const [severity, setSeverity] = useState("中度");
  const [situation, setSituation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);
  const [hitLimit, setHitLimit] = useState(false);
  const [showPayjp, setShowPayjp] = useState(false);

  useEffect(() => {
    const saved = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
    setCount(saved);
    if (saved >= FREE_LIMIT) setHitLimit(true);
  }, []);

  const handleGenerate = async () => {
    if (!situation.trim()) { setError("状況を入力してください"); return; }
    setLoading(true);
    setError("");
    setResult([]);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseType, requesterType, severity, situation }),
      });
      if (!res.ok) {
        const data = await res.json();
        if (data.error === "LIMIT_REACHED") { setHitLimit(true); return; }
        setError(data.error || "エラーが発生しました");
        return;
      }
      const newCount = parseInt(res.headers.get("X-New-Count") || String(count + 1), 10);
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }
      setResult(parseResult(fullText));
      setCount(newCount);
      localStorage.setItem(STORAGE_KEY, String(newCount));
      if (newCount >= FREE_LIMIT) setHitLimit(true);
    } catch {
      setError("通信エラーが発生しました。再試行してください。");
    } finally {
      setLoading(false);
    }
  };

  if (hitLimit) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm text-center border border-gray-200">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">無料体験（{FREE_LIMIT}回）終了</h2>
          <p className="text-gray-500 text-sm mb-6">
            事業所プランで介護カスハラ対応文を無制限に生成できます。
          </p>
          <button
            onClick={() => setShowPayjp(true)}
            className="block w-full bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition-colors mb-3"
          >
            事業所プランで無制限利用する ¥9,800/月
          </button>
          <a href="/" className="text-sm text-gray-400 hover:underline">トップへ戻る</a>
        </div>
        {showPayjp && (
          <PayjpModal
            publicKey={process.env.NEXT_PUBLIC_PAYJP_PUBLIC_KEY!}
            planLabel="事業所プラン ¥9,800/月"
            plan="business"
            onSuccess={() => setShowPayjp(false)}
            onClose={() => setShowPayjp(false)}
          />
        )}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">介護カスハラ対応文ジェネレーター</h1>
          <p className="text-sm text-gray-500">
            状況を入力して「生成する」を押すだけ。
            無料残り<strong className="text-teal-600">{Math.max(0, FREE_LIMIT - count)}回</strong>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">カスハラの種別</label>
            <div className="flex flex-wrap gap-2">
              {CASE_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setCaseType(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    caseType === t
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-teal-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">要求者</label>
              <select
                value={requesterType}
                onChange={(e) => setRequesterType(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                {REQUESTER_TYPES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">深刻度</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                {SEVERITY_LEVELS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">状況の詳細</label>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="例：利用者の家族が毎日10回以上電話をかけてきて、「すぐにスタッフを増やせ」「他の事業所に替える」と脅してくる。スタッフが精神的に疲弊している。"
              rows={5}
              maxLength={1500}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{situation.length}/1500文字</p>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !situation.trim()}
            className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "生成中..." : "対応文を生成する"}
          </button>
        </div>

        {result.length > 0 && (
          <div className="space-y-4">
            {/* Xシェアボタン（結果上部） */}
            <div className="flex justify-end">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  "介護カスハラAIに対応文を作成してもらった！カスハラで悩んでいる介護スタッフの方へ。 #介護カスハラ対策 #カスハラ #介護現場"
                )}&url=${encodeURIComponent("https://kaigo-custharass-ai.vercel.app")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                𝕏 シェアする
              </a>
            </div>
            {result.map((section, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{section}</div>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => { navigator.clipboard.writeText(section); }}
                    className="text-xs text-teal-600 hover:underline"
                  >
                    📋 コピーする
                  </button>
                </div>
              </div>
            ))}
            {/* Xシェアボタン（結果下部・CTA） */}
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
              <p className="text-sm font-bold text-teal-800 mb-2">同じ悩みを持つ介護スタッフに届けましょう</p>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  "介護現場のカスハラ対応文が15秒で作れるAIを使ってみた。暴言・脅迫・過剰要求に悩んでいる介護スタッフさんに教えてあげたい。 #介護カスハラ対策 #介護 #カスハラ対策"
                )}&url=${encodeURIComponent("https://kaigo-custharass-ai.vercel.app")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                𝕏 でシェアして仲間に教える
              </a>
            </div>
            <p className="text-xs text-center text-gray-400 mt-4">
              ※ 本AIの出力は参考情報です。実際の対応は管理者・法的専門家にご相談ください。
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
