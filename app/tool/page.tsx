"use client";

import { useState, useEffect, useRef } from "react";
import PayjpModal from "@/components/PayjpModal";

function renderMarkdown(text: string): string {
  const lines = text.split("\n");
  const result: string[] = [];
  let inList = false;

  for (const line of lines) {
    if (/^## (.+)$/.test(line)) {
      if (inList) { result.push("</ul>"); inList = false; }
      result.push(line.replace(/^## (.+)$/, '<h3 class="font-bold text-base mt-4 mb-2 text-teal-700 border-b border-teal-200 pb-1">$1</h3>'));
    } else if (/^# (.+)$/.test(line)) {
      if (inList) { result.push("</ul>"); inList = false; }
      result.push(line.replace(/^# (.+)$/, '<h2 class="font-bold text-lg mt-4 mb-2 text-teal-800">$1</h2>'));
    } else if (/^### (.+)$/.test(line)) {
      if (inList) { result.push("</ul>"); inList = false; }
      result.push(line.replace(/^### (.+)$/, '<h4 class="font-semibold text-sm mt-3 mb-1 text-teal-600">$1</h4>'));
    } else if (/^- (.+)$/.test(line)) {
      if (!inList) { result.push('<ul class="space-y-1 mb-2">'); inList = true; }
      const inner = line.replace(/^- /, "").replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
      result.push(`<li class="ml-4 list-disc text-gray-700 text-sm">${inner}</li>`);
    } else if (/^\d+\.\s/.test(line)) {
      if (!inList) { result.push('<ul class="space-y-1 mb-2">'); inList = true; }
      const inner = line.replace(/^\d+\.\s/, "").replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
      result.push(`<li class="ml-4 list-decimal text-gray-700 text-sm">${inner}</li>`);
    } else if (/^【.+】$/.test(line) || /^■/.test(line) || /^◆/.test(line)) {
      if (inList) { result.push("</ul>"); inList = false; }
      const inner = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
      result.push(`<p class="font-semibold text-teal-700 text-sm mt-2 mb-1">${inner}</p>`);
    } else if (line.trim() === "") {
      if (inList) { result.push("</ul>"); inList = false; }
      result.push('<div class="mt-2"></div>');
    } else {
      if (inList) { result.push("</ul>"); inList = false; }
      const inner = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
      result.push(`<p class="text-gray-700 text-sm leading-relaxed">${inner}</p>`);
    }
  }
  if (inList) result.push("</ul>");
  return result.join("\n");
}

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
  { value: "軽度", label: "🟢 軽度（一般的な苦情・要望）", score: 2, color: "bg-green-500" },
  { value: "中度", label: "🟡 中度（度を超えた要求・繰り返し）", score: 5, color: "bg-yellow-400" },
  { value: "重度", label: "🔴 重度（暴言・脅迫・不当要求）", score: 9, color: "bg-red-500" },
];

const TABS = ["💬 口頭スクリプト", "📄 書面通知文", "📋 インシデント記録"] as const;
type TabLabel = typeof TABS[number];

const FREE_LIMIT = 3;
const STORAGE_KEY = "kaigo_use_count";

function parseResultToTabs(text: string): Record<TabLabel, string> {
  const parts = text.split(/^---$/m).map((s) => s.trim()).filter(Boolean);
  return {
    "💬 口頭スクリプト": parts[0] || "",
    "📄 書面通知文": parts[1] || "",
    "📋 インシデント記録": parts[2] || "",
  };
}

// Legacy parseResult kept for reference (unused)
function parseResult(text: string) {
  const sections = text.split(/^---$/m).map((s) => s.trim()).filter(Boolean);
  return sections;
}

// コピーボタン（フィードバック付き）
function CopyBtn({ text, label = "📋 コピーする", className = "" }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative inline-block">
      <button onClick={handleCopy} className={`text-xs hover:underline transition-colors ${className}`}>
        {copied ? "✅ コピー完了！" : label}
      </button>
      {copied && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap shadow-lg animate-bounce">
          ✅ コピー完了！
        </div>
      )}
    </div>
  );
}

export default function KaigoTool() {
  const [caseType, setCaseType] = useState(CASE_TYPES[0]);
  const [requesterType, setRequesterType] = useState(REQUESTER_TYPES[0]);
  const [severity, setSeverity] = useState("中度");
  const [situation, setSituation] = useState("");
  const [loading, setLoading] = useState(false);
  const [tabs, setTabs] = useState<Record<TabLabel, string> | null>(null);
  const [activeTab, setActiveTab] = useState<TabLabel>("💬 口頭スクリプト");
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);
  const [hitLimit, setHitLimit] = useState(false);
  const [showPayjp, setShowPayjp] = useState(false);
  const [completionVisible, setCompletionVisible] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
    setCount(saved);
    if (saved >= FREE_LIMIT) setHitLimit(true);
  }, []);

  const currentSeverity = SEVERITY_LEVELS.find(s => s.value === severity) ?? SEVERITY_LEVELS[1];

  const handleGenerate = async () => {
    if (!situation.trim()) { setError("状況を入力してください"); return; }
    setLoading(true);
    setError("");
    setTabs(null);
    setCompletionVisible(false);
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
        setTabs(parseResultToTabs(fullText));
      }
      setTabs(parseResultToTabs(fullText));
      setActiveTab("💬 口頭スクリプト");
      setCount(newCount);
      localStorage.setItem(STORAGE_KEY, String(newCount));
      if (newCount >= FREE_LIMIT) setHitLimit(true);

      // 達成感バナー表示
      setCompletionVisible(true);
      setTimeout(() => setCompletionVisible(false), 4000);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
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
          {/* 安心保証バッジ */}
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span>🔒</span>
              <span>SSL暗号化決済</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span>✅</span>
              <span>いつでもキャンセル可能</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span>💳</span>
              <span>PAY.JP安全決済</span>
            </div>
          </div>
          <p className="text-xs text-center text-slate-500 mt-2">
            ※ プレミアムプランはいつでもキャンセル可能です
          </p>
          <a href="/" className="text-sm text-gray-400 hover:underline mt-3 block">トップへ戻る</a>
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

        {/* 達成感バナー */}
        <div className={`transition-all duration-500 overflow-hidden ${completionVisible ? "max-h-48 opacity-100 mb-4" : "max-h-0 opacity-0"}`}>
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-2xl px-5 py-4 shadow-lg">
            <div className="flex items-center gap-2 font-bold text-base mb-3">
              <span className="text-2xl">✅</span>
              <span>対応文書 作成完了！</span>
            </div>
            {/* カスハラ深刻度スコアバー */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1 opacity-90">
                <span>カスハラ深刻度: {currentSeverity.value}</span>
                <span className="font-bold text-lg">{currentSeverity.score}<span className="text-xs font-normal">/10</span></span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className={`${currentSeverity.color} h-3 rounded-full transition-all duration-700`}
                  style={{ width: `${(currentSeverity.score / 10) * 100}%` }}
                />
              </div>
              <p className="text-xs opacity-70 mt-1">
                {currentSeverity.value === "重度" ? "上長報告・書面対応・警察相談を検討してください" :
                 currentSeverity.value === "中度" ? "記録を残しつつ毅然とした対応を" : "丁寧に誠意を持って対応しましょう"}
              </p>
            </div>
          </div>
        </div>

        {/* 結果タブUI */}
        {(loading || tabs) && (
          <div ref={resultRef} className="space-y-4">
            {loading && !tabs && (
              <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto mb-4" />
                <p className="text-sm text-gray-500 font-medium">AIが対応文を作成中...</p>
                <p className="text-xs text-gray-400 mt-1">💬 口頭スクリプト → 📄 書面通知文 → 📋 インシデント記録</p>
              </div>
            )}
            {tabs && (
              <>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="flex border-b border-gray-200 overflow-x-auto">
                    {TABS.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === tab
                            ? "border-teal-600 text-teal-600 bg-teal-50"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="p-5">
                    <div className="flex justify-end mb-3">
                      <CopyBtn text={tabs[activeTab]} label="📋 コピーする" className="text-teal-600 border border-teal-200 rounded-lg px-3 py-1.5 hover:bg-teal-50" />
                    </div>
                    <div
                      className="prose prose-sm max-w-none min-h-[180px]"
                      dangerouslySetInnerHTML={{ __html: tabs[activeTab] ? renderMarkdown(tabs[activeTab]) : "<p class='text-gray-400 text-sm'>（生成中...）</p>" }}
                    />
                  </div>
                </div>

                {/* シェアボタン */}
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
                  <p className="text-sm font-bold text-teal-800 mb-3">同じ悩みを持つ介護スタッフに届けましょう</p>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      `「カスハラ深刻度${currentSeverity.score}/10... 対応文書が30秒で完成した😮 介護現場の理不尽に困ってる方へ → https://kaigo-custharass-ai.vercel.app #介護カスハラ対策 #カスハラ #介護現場`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg hover:scale-105 transition-transform"
                  >
                    𝕏 でシェアして仲間に教える
                  </a>
                </div>
                <p className="text-xs text-center text-gray-400">
                  ※ 本AIの出力は参考情報です。実際の対応は管理者・法的専門家にご相談ください。
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
