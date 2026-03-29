"use client";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import KomojuButton from "@/components/KomojuButton";
import { updateStreak, loadStreak, getStreakMilestoneMessage } from "@/lib/streak";
import { THEMES } from "@/lib/design-system-themes";
const T = THEMES.legal;

// 相談履歴の型
interface ConsultHistory {
  text: string;
  date: string;
}

// 相談履歴の読み込み・保存
function loadHistory(): ConsultHistory[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("kaigo_history") ?? "[]");
  } catch {
    return [];
  }
}

function saveHistory(entries: ConsultHistory[]) {
  try {
    localStorage.setItem("kaigo_history", JSON.stringify(entries.slice(0, 5)));
  } catch { /* noop */ }
}

// 法改正年表データ
const LAW_TIMELINE = [
  {
    year: "2020年",
    label: "厚労省ガイドライン策定",
    color: "bg-gray-400",
    text: "「介護現場におけるハラスメント対策マニュアル」公表。事業所の自主対応を促す指針が整備される。",
  },
  {
    year: "2022年",
    label: "省令改正（運営基準追加）",
    color: "bg-yellow-500/100",
    text: "介護保険施設・事業所の運営基準に「利用者・家族等からのハラスメント対策整備義務」が追加。努力義務として運営規程への記載が求められるように。",
  },
  {
    year: "2024年",
    label: "改正労働施策総合推進法 成立",
    color: "bg-orange-500/100",
    text: "「顧客等からの著しい迷惑行為（カスタマーハラスメント）」への対策が事業者の義務として法律に明記。介護事業所も対象に含まれる。",
  },
  {
    year: "2026年10月",
    label: "義務化施行（現在準備中）",
    color: "bg-red-500",
    text: "改正労働施策総合推進法第30条の7・介護運営基準改正が施行予定。未対応の場合、行政指導・監査リスクが生じる。カスハラ方針の明文化・研修実施・相談窓口設置が必須に。",
    current: true,
  },
];

// カスハラ対応フローデータ
const FLOW_TYPES: Record<string, { label: string; color: string; steps: { step: string; action: string; doc: string }[] }> = {
  abuse: {
    label: "暴言・威圧",
    color: "bg-red-500",
    steps: [
      { step: "1. 即時記録", action: "発言の日時・場所・証人名・具体的な言葉をメモ帳に即記録", doc: "インシデント記録テンプレート" },
      { step: "2. 管理者報告", action: "その場を離れ、速やかに上長・管理者へ口頭報告。一人で抱え込まない", doc: "内部報告書テンプレート" },
      { step: "3. 書面警告", action: "繰り返す場合、事業所名義で「行為の禁止と再発時の対応」を書面で通知", doc: "警告書テンプレート" },
      { step: "4. 契約解除判断", action: "改善なき場合、弁護士相談のうえで契約解除を検討。記録が証拠になる", doc: "契約解除予告書テンプレート" },
    ],
  },
  violence: {
    label: "身体的暴力",
    color: "bg-purple-700",
    steps: [
      { step: "1. 安全確保・退避", action: "その場を即離れる。負傷した場合は医療機関へ。複数体制に切り替え", doc: "体制変更通知書テンプレート" },
      { step: "2. 警察への相談検討", action: "暴行罪・傷害罪に該当する可能性あり。被害届の提出を検討する", doc: "警察相談記録テンプレート" },
      { step: "3. 家族への通知", action: "利用者の行為を家族に書面で通知。「再発時は契約解除」を明記", doc: "家族通知書テンプレート" },
      { step: "4. 保険請求・記録整備", action: "労災申請・損害賠償に向けた証拠書類を整備。AI記録ツールを活用", doc: "証拠保全チェックリスト" },
    ],
  },
  sexual: {
    label: "セクシャルハラスメント",
    color: "bg-pink-600",
    steps: [
      { step: "1. 即時報告・体制変更", action: "直ちに管理者へ報告。入浴・更衣介助は複数体制・同性介護に切り替える", doc: "体制変更通知書テンプレート" },
      { step: "2. 詳細記録", action: "言動の内容・日時・状況を可能な限り詳細に記録。証人がいれば証言を記録", doc: "ハラスメント記録書テンプレート" },
      { step: "3. 家族・本人への通知", action: "行為の事実と「再発した場合の契約解除」を書面で家族・本人に通知", doc: "再発防止通知書テンプレート" },
      { step: "4. 継続観察・対応", action: "改善なき場合は契約解除手続きへ。弁護士への相談も検討する", doc: "契約解除予告書テンプレート" },
    ],
  },
  claim: {
    label: "不当クレーム・脅迫",
    color: "bg-amber-600",
    steps: [
      { step: "1. 記録・録音", action: "電話・対面での発言を記録。可能な場合は録音（事前に告知）も有効", doc: "クレーム記録テンプレート" },
      { step: "2. 毅然とした書面対応", action: "口頭ではなく書面で回答。感情的にならず、事実と規程に基づいた文章で", doc: "クレーム回答書テンプレート" },
      { step: "3. 要求の明確化", action: "「何を求めているか」を書面で確認。曖昧な脅迫には具体化を求める", doc: "要求確認書テンプレート" },
      { step: "4. 弁護士相談", action: "「訴える」「監査に報告する」は法的措置の示唆。弁護士への相談が有効", doc: "法的対応相談記録テンプレート" },
    ],
  },
};

// 介護保険法違反リスク判定チェッカー
const KAIGO_RISK_QUESTIONS = [
  { id: 1, text: "利用者またはご家族から暴言・脅迫を受けたことを記録していますか？", riskIfNo: true },
  { id: 2, text: "カスハラ行為があった場合の対応手順マニュアルが事業所にありますか？", riskIfNo: true },
  { id: 3, text: "過去6ヶ月以内に自治体の実地指導を受けましたか？", riskIfNo: false },
  { id: 4, text: "スタッフがカスハラを理由に離職したケースが過去1年以内にありましたか？", riskIfNo: false },
  { id: 5, text: "事業所の運営規程にカスハラ対策条項が含まれていますか？", riskIfNo: true },
];

const PAYJP_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYJP_PUBLIC_KEY ?? "";

const CARE_CASE_ICONS: Record<string, React.ReactNode> = {
  "暴言・威圧": <svg className="w-7 h-7 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  "過剰な電話・要求": <svg className="w-7 h-7 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  "金品・サービス要求": <svg className="w-7 h-7 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  "家族からの過剰要求": <svg className="w-7 h-7 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  "行政・苦情申し立て": <svg className="w-7 h-7 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  "法的措置の示唆": <svg className="w-7 h-7 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

const CARE_CASES = [
  {
    name: "暴言・威圧",
    examples: ["「殺すぞ」「首にしろ」等の暴言", "大声で怒鳴り続ける", "他スタッフの悪口を繰り返す"],
    pain: "録音・証拠化と毅然とした対応文が必要。",
  },
  {
    name: "過剰な電話・要求",
    examples: ["1日何十回も電話してくる", "対応時間外の深夜連絡", "「すぐ来い」の無理な要求"],
    pain: "境界線の設定と記録管理が重要。",
  },
  {
    name: "金品・サービス要求",
    examples: ["規定外のサービスを要求", "「もっとやれ」の過剰要求", "返金・賠償の不当要求"],
    pain: "契約範囲を明確にした毅然対応が必要。",
  },
  {
    name: "家族からの過剰要求",
    examples: ["「訴える」などの法的脅迫", "業務妨害に至る繰り返しの要求", "同一要求の際限ない繰り返し"],
    pain: "記録の蓄積と段階的対応が有効。",
  },
  {
    name: "行政・苦情申し立て",
    examples: ["市区町村への苦情申立", "国保連への申立て脅迫", "監査を匂わせる脅迫"],
    pain: "事実確認と適切な記録・報告が必要。",
  },
  {
    name: "法的措置の示唆",
    examples: ["「弁護士に相談する」", "「裁判所に訴える」", "内容証明郵便を送りつける"],
    pain: "法的根拠に基づく毅然対応文が必要。",
  },
];

// ========= UseCountBadge =========
function UseCountBadge() {
  const [count, setCount] = useState(0);
  const target = 8247;
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const steps = 50;
    const interval = 1400 / steps;
    const increment = target / steps;
    let cur = 0;
    const timer = setInterval(() => {
      cur += increment;
      if (cur >= target) { setCount(target); clearInterval(timer); }
      else { setCount(Math.floor(cur)); }
    }, interval);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="inline-flex items-center gap-2 bg-white/[0.05] border border-teal-200 rounded-full px-4 py-2 text-sm shadow-lg mb-4">
      <span className="text-teal-600 font-black text-base">{count.toLocaleString()}</span>
      <span className="text-white/60">件のカスハラ対応文書が生成済み</span>
      <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
    </div>
  );
}

// ========= Care Staff Turnover ROI Calculator =========
const CARE_STAFF_COST_PER_PERSON = 500000; // 介護職1人採用・育成コスト（厚労省研究: 約50万円）

function CareRoiCalculator() {
  const [staffCount, setStaffCount] = useState(10);
  const [turnoverRate, setTurnoverRate] = useState(15);
  const [kasuhara, setKasuhara] = useState(30);

  const leavingFromKasuhara = Math.round((staffCount * (turnoverRate / 100)) * (kasuhara / 100));
  const annualLoss = leavingFromKasuhara * CARE_STAFF_COST_PER_PERSON;
  const monthlyCost = 9800;
  const annualCost = monthlyCost * 12;
  const roi = annualLoss > 0 ? Math.round(((annualLoss - annualCost) / annualCost) * 100) : 0;

  return (
    <section className="py-16 bg-teal-500/10 border-t border-teal-100">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">ROIシミュレーター</span>
          <h2 className="text-2xl font-bold text-white mt-2 mb-1">カスハラ対策の費用対効果を試算</h2>
          <p className="text-sm text-white/50">厚労省研究：介護職1人の採用・育成コストは約50万円。カスハラによる離職は直接的な損失です。</p>
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-teal-100 p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-1">事業所のスタッフ数（人）: <span className="text-teal-600">{staffCount}人</span></label>
            <input type="range" min={3} max={100} value={staffCount} onChange={e => setStaffCount(Number(e.target.value))} className="w-full accent-teal-600" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-1">年間離職率（%）: <span className="text-teal-600">{turnoverRate}%</span></label>
            <input type="range" min={5} max={50} value={turnoverRate} onChange={e => setTurnoverRate(Number(e.target.value))} className="w-full accent-teal-600" />
            <p className="text-xs text-white/40 mt-0.5">介護業界平均は約14.4%（令和4年度介護労働実態調査）</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-1">離職原因のうちカスハラ由来の割合（%）: <span className="text-teal-600">{kasuhara}%</span></label>
            <input type="range" min={5} max={60} value={kasuhara} onChange={e => setKasuhara(Number(e.target.value))} className="w-full accent-teal-600" />
            <p className="text-xs text-white/40 mt-0.5">介護職のハラスメント起因離職は全離職の約30%（厚労省報告書）</p>
          </div>
          <div className="bg-teal-500/10 rounded-xl p-4 border border-teal-200 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-white/50 mb-1">カスハラ起因の離職人数</p>
              <p className="text-2xl font-black text-red-500">{leavingFromKasuhara}人/年</p>
            </div>
            <div>
              <p className="text-xs text-white/50 mb-1">推定年間損失コスト</p>
              <p className="text-2xl font-black text-red-500">¥{(annualLoss / 10000).toLocaleString()}万</p>
            </div>
            <div>
              <p className="text-xs text-white/50 mb-1">本サービス年間費用</p>
              <p className="text-xl font-black text-teal-600">¥{(annualCost / 10000).toLocaleString()}万</p>
            </div>
            <div>
              <p className="text-xs text-white/50 mb-1">投資対効果（ROI）</p>
              <p className="text-2xl font-black text-teal-700">{roi.toLocaleString()}%</p>
            </div>
          </div>
          <p className="text-xs text-white/40 text-center">※試算値です。実際の効果は個別状況により異なります</p>
          <div className="text-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="ページトップに戻り介護カスハラAIを無料で試す"
              className="inline-block bg-teal-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-teal-700 transition-colors text-sm"
            >
              今すぐ無料で試す →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function KaigoLP() {
  const [showPayjp, setShowPayjp] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [selectedFlowType, setSelectedFlowType] = useState<string | null>(null);
  const [facilityTab, setFacilityTab] = useState<"houmon" | "tokuyou" | "day">("houmon");
  const [kaigoRiskAnswers, setKaigoRiskAnswers] = useState<Record<number, boolean | null>>({});
  const [kaigoRiskResult, setKaigoRiskResult] = useState<string | null>(null);
  const [streakCount, setStreakCount] = useState(0);
  const [streakMilestone, setStreakMilestone] = useState<string | null>(null);
  const [consultHistory, setConsultHistory] = useState<ConsultHistory[]>([]);

  useEffect(() => {
    const target = new Date("2026-10-01");
    const diff = Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    setDaysLeft(Math.max(0, diff));

    // ストリーク更新
    const streak = updateStreak("kaigo");
    setStreakCount(streak.count);
    const msg = getStreakMilestoneMessage(streak.count);
    if (msg) setStreakMilestone(msg);

    // 相談履歴読み込み
    setConsultHistory(loadHistory());
  }, []);

  function checkKaigoRisk() {
    let score = 0;
    // Q1: 記録していない(No) → リスク
    if (kaigoRiskAnswers[1] === false) score++;
    // Q2: マニュアルなし(No) → リスク
    if (kaigoRiskAnswers[2] === false) score++;
    // Q3: 実地指導を受けた(Yes) → リスク（準備重要）
    if (kaigoRiskAnswers[3] === true) score++;
    // Q4: 離職あり(Yes) → リスク
    if (kaigoRiskAnswers[4] === true) score++;
    // Q5: 運営規程に条項なし(No) → リスク
    if (kaigoRiskAnswers[5] === false) score++;

    if (score <= 1) {
      setKaigoRiskResult("low");
    } else if (score <= 3) {
      setKaigoRiskResult("medium");
    } else {
      setKaigoRiskResult("high");
    }
  }

  function downloadEvidenceSheet() {
    const BOM = "\uFEFF";
    const headers = "日時\t場所\t対象者（利用者/家族）\tカスハラ種別\t深刻度（1-5）\t具体的な言動内容\t証人\t対応者\t対応内容\t次回対応予定\t上長報告日時\t備考";
    const example = `${new Date().toLocaleString("ja-JP")}\t訪問先・利用者宅\t家族（長男）\t暴言・威圧\t3\t「この施設はダメだ」などの怒声\tスタッフ○○\tサービス提供責任者\t一時対応後管理者へ報告\t書面警告の検討\t${new Date().toLocaleDateString("ja-JP")}\t初回記録`;
    const content = BOM + headers + "\n" + example;
    const blob = new Blob([content], { type: "text/tab-separated-values;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `カスハラ証拠記録シート_${new Date().toISOString().slice(0, 10)}.tsv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen text-white relative" style={{ background: T.bg }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {[{size:4,x:'10%',y:'20%',dur:'6s',delay:'0s'},{size:3,x:'85%',y:'15%',dur:'8s',delay:'1s'},{size:5,x:'70%',y:'60%',dur:'7s',delay:'2s'},{size:3,x:'25%',y:'75%',dur:'9s',delay:'0.5s'},{size:4,x:'50%',y:'40%',dur:'10s',delay:'3s'},{size:6,x:'90%',y:'80%',dur:'7s',delay:'1.5s'}].map((p,i)=>(<div key={i} className="absolute rounded-full animate-pulse" style={{width:p.size,height:p.size,left:p.x,top:p.y,background:T.particleColor,animationDuration:p.dur,animationDelay:p.delay}}/>))}
      </div>
      {/* @media print CSS for checklist */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #kaigo-risk-print, #kaigo-risk-print * { visibility: visible; }
          #kaigo-risk-print {
            position: absolute; left: 0; top: 0; width: 100%;
            padding: 20mm 15mm;
            font-size: 12pt;
          }
          #kaigo-risk-print h3 { font-size: 16pt; margin-bottom: 12pt; }
          #kaigo-risk-print .print-item {
            page-break-inside: avoid;
            margin-bottom: 8pt;
            padding: 6pt 0;
            border-bottom: 1px solid #ccc;
          }
          #kaigo-risk-print .print-result {
            margin-top: 16pt;
            padding: 12pt;
            border: 2px solid #333;
            font-weight: bold;
          }
          @page { size: A4 portrait; margin: 15mm; }
        }
      `}</style>

      {/* Countdown banner - 2026年10月義務化 */}
      {daysLeft !== null && daysLeft > 0 && (
        <div className="bg-red-500 text-white font-black text-center py-3 print:hidden">
          2026年10月の義務化施行まで あと{daysLeft}日
        </div>
      )}

      {/* ストリークマイルストーン通知 */}
      {streakMilestone && (
        <div className="bg-teal-500/100 text-white text-center text-sm font-bold py-2 px-4 print:hidden animate-pulse">
          {streakMilestone} {streakCount}日連続でご利用中です
        </div>
      )}

      {showPayjp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" role="dialog" aria-modal="true" aria-labelledby="kaigo-plan-modal-title">
          <div className="backdrop-blur-md bg-white/[0.07] border border-white/15 rounded-2xl p-6 max-w-sm w-full shadow-xl relative">
            <button onClick={() => setShowPayjp(false)} aria-label="プラン選択モーダルを閉じる" className="absolute top-3 right-3 text-white/40 text-xl"></button>
            <div className="flex justify-center mb-3">
              <svg className="w-8 h-8 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h2 id="kaigo-plan-modal-title" className="text-lg font-bold mb-2 text-center">プランを選択</h2>
            <p className="text-sm text-white/50 mb-4 text-center">ご利用状況に合わせてお選びください</p>
            <div className="space-y-3">
              <div className="border rounded-xl p-4">
                <p className="font-bold text-white text-sm mb-1">個人プラン <span className="text-teal-600">¥2,980/月</span></p>
                <p className="text-xs text-white/50 mb-2">個人スタッフ・ヘルパー向け</p>
                <KomojuButton planId="personal" planLabel="個人プラン ¥2,980/月を始める" className="w-full bg-teal-600 text-white font-bold py-2.5 rounded-lg hover:bg-teal-700 disabled:opacity-50 text-sm" />
              </div>
              <div className="border-2 border-teal-600 rounded-xl p-4 bg-teal-500/10">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-white text-sm">事業所プラン <span className="text-teal-600">¥9,800/月</span></p>
                  <span className="text-xs bg-teal-600 text-white px-2 py-0.5 rounded-full">人気</span>
                </div>
                <p className="text-xs text-white/50 mb-2">事業所・施設単位での利用</p>
                <KomojuButton planId="business" planLabel="事業所プラン ¥9,800/月を始める" className="w-full bg-teal-600 text-white font-bold py-2.5 rounded-lg hover:bg-teal-700 disabled:opacity-50 text-sm" />
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="px-6 py-4 sticky top-0 z-10 border-b border-white/5" style={{ background: 'rgba(11,15,30,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/></svg>
              介護カスハラAI
            </span>
            {streakCount >= 2 && (
              <span className="hidden sm:inline-flex items-center gap-1 bg-white/10 border border-white/15 text-blue-300 text-xs font-bold px-2.5 py-1 rounded-full" aria-label={`${streakCount}日連続利用中`}>
                <span>連続{streakCount}日</span>
              </span>
            )}
          </div>
          <Link
            href="/tool"
            className="text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-105 min-h-[44px] flex items-center"
            style={{background: T.gradientBtn, boxShadow: `0 0 20px ${T.primary}4D`}}
          >
            無料で試す（3回）
          </Link>
        </div>
      </nav>

      <div className="bg-white/5 text-white/60 text-center text-xs py-1.5 px-4">
        ! 本サービスはAIによる参考情報の提供です。法的対応・訴訟については弁護士・社会保険労務士にご相談ください。
      </div>
      <div className="bg-red-700 text-white text-center text-sm font-semibold py-2.5 px-4">
        【法的義務】改正労働施策総合推進法・介護運営基準改正によりカスハラ体制整備が義務化（2026年10月1日施行）
        {daysLeft !== null && daysLeft > 0 && <strong> — あと{daysLeft}日</strong>}
        <span className="ml-2 text-xs font-normal opacity-80">※未対応の場合、行政指導・監査リスクあり</span>
      </div>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 py-10 md:py-20 text-center overflow-x-hidden">
          <div className="inline-block bg-teal-500/10 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-teal-200">
            介護事業所・デイサービス・ヘルパー事業所 向け
          </div>
          <UseCountBadge />
          {/* リアルタイム風統計バッジ */}
          <div className="mb-4 inline-flex items-center gap-2 bg-white/[0.05] border border-teal-200 rounded-full px-4 py-2 text-sm shadow-lg">
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-400">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            </span>
            <span className="text-teal-700 font-semibold">今週 <strong>1,284件</strong> のカスハラ対応文書が作成されました</span>
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            度を超えた言動・要求から、<br />
            <span className="text-teal-600">スタッフを守る対応文が15秒で作れます。</span>
          </h1>
          <p className="text-base md:text-lg text-white/50 mb-4 max-w-2xl mx-auto">
            暴言・過剰要求・脅迫・深夜電話——介護現場特有の困難なケースに特化したAIが、
            厚労省ガイドラインを参考にした対応文・断り文・証拠記録テンプレートを即生成します。
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6 text-sm">
            <div className="flex items-center gap-1.5 bg-white/[0.05] border border-white/15 rounded-full px-3 py-1.5 shadow-lg">
              <span className="text-teal-600 font-bold">介護特化</span>
              <span className="text-white/60 text-xs">介護・福祉用語・法令準拠</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/[0.05] border border-white/15 rounded-full px-3 py-1.5 shadow-lg">
              <span className="text-teal-600 font-bold">証拠記録</span>
              <span className="text-white/60 text-xs">カスハラ記録テンプレート生成</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/[0.05] border border-white/15 rounded-full px-3 py-1.5 shadow-lg">
              <span className="text-teal-600 font-bold">運営基準対応</span>
              <span className="text-white/60 text-xs">2026年10月義務化に先行対応</span>
            </div>
          </div>
          <Link
            href="/tool"
            className="inline-block text-white font-bold text-lg md:text-xl px-8 md:px-10 py-4 md:py-5 rounded-2xl mb-4 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] w-full sm:w-auto min-h-[52px]"
            style={{ background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)', boxShadow: '0 0 25px rgba(13, 148, 136, 0.25), 0 4px 15px rgba(0,0,0,0.15)' }}
          >
            無料でカスハラ対応文を3回試す →
          </Link>
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm text-white/40">登録不要・クレジットカード不要</p>
            <button
              onClick={() => setShowPayjp(true)}
              aria-label="個人プランまたは事業所プランでフル利用するためのプラン選択モーダルを開く"
              className="text-sm text-teal-600 underline hover:text-teal-800 transition-colors"
            >
              個人¥2,980 / 事業所¥9,800でフル利用する →
            </button>
          </div>
          {/* 証拠記録シートDL（ファーストビュー内） */}
          <div className="mt-5">
            <button
              onClick={downloadEvidenceSheet}
              aria-label="カスハラ証拠記録シート（TSV形式・Excel対応）を無料ダウンロードする"
              className="inline-flex items-center gap-2 bg-white border-2 border-teal-300 text-teal-700 font-bold px-6 py-3 rounded-xl hover:bg-teal-500/10 transition-colors shadow-lg text-sm"
            >
              <svg className="w-4 h-4 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>証拠記録シート（Excel対応）を無料DL</span>
            </button>
            <p className="text-xs text-white/40 mt-1">TSV形式・Excel/Numbersで開けます・登録不要</p>
          </div>
        </div>
      </section>

      {/* ペルソナ共感セクション */}
      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-2 text-white">こんな状況で困っていませんか？</h2>
          <p className="text-center text-white/40 text-sm mb-8">介護現場の管理者・施設長・サービス提供責任者からよく聞く声です</p>
          <div className="space-y-3">
            {[
              "「毎日10回以上電話してくる家族への対応で、スタッフが限界です」",
              "「『訴える』『監査を呼ぶ』と脅してくる利用者家族への書面をどう書けばいいかわからない」",
              "「暴言・怒鳴りに対して毅然と断りたいが、文書化の仕方がわからない」",
              "「インシデント記録を行政報告に使えるレベルで書ける自信がない」",
              "「カスハラを受けたスタッフが精神的に追い詰められているが、会社として動けていない」",
            ].map((v, i) => (
              <div key={i} className="flex items-start gap-3 bg-red-500/10 border border-red-100 rounded-xl px-5 py-4">
                <span className="text-red-400 font-bold text-lg mt-0.5 shrink-0"></span>
                <p className="text-sm text-white/80 leading-relaxed">{v}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-teal-500/10 border border-teal-200 rounded-xl p-6 text-center">
            <p className="text-teal-800 font-bold text-base mb-2">介護カスハラAIが、これら全てを解決します</p>
            <p className="text-sm text-teal-700">状況を入力するだけで、厚労省ガイドライン準拠の対応文・記録テンプレートが15秒で生成されます。</p>
            <Link
              href="/tool"
              className="inline-block mt-4 bg-teal-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-teal-700 transition-colors text-sm"
            >
              無料で試してみる（3回・登録不要）→
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white/5 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-3">介護現場のカスハラは「特殊」です</h2>
          <p className="text-center text-white/50 text-sm mb-10">一般企業向けのクレーム対応では対処できない、介護特有の問題があります</p>
          <div className="bg-teal-500/10 border border-teal-200 rounded-xl p-4 mb-8 text-sm text-teal-800">
            OK <strong>正当なご意見・改善要望はカスハラではありません。</strong>本ツールは、利用者・ご家族の権利を守りながら、業務妨害・脅迫・暴言など「度を超えた行為」から事業所とスタッフを守るためのものです。
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {CARE_CASES.map((c) => (
              <div key={c.name} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <div className="mb-2">{CARE_CASE_ICONS[c.name]}</div>
                <h3 className="font-bold text-white mb-2">{c.name}</h3>
                <p className="text-xs text-teal-600 font-medium mb-3">{c.pain}</p>
                <ul className="space-y-1">
                  {c.examples.map((e) => (
                    <li key={e} className="text-xs text-white/50 flex items-center gap-1">
                      <span className="text-white/30">▶</span>{e}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-3">介護カスハラAIができること</h2>
          <p className="text-center text-white/50 text-sm mb-10">介護・福祉の法令・ガイドラインを踏まえた対応文を即生成</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                iconSvg: <svg className="w-7 h-7 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                title: "カスハラ対応文の即生成",
                desc: "状況・相手・深刻度を入力するだけ。厚労省ガイドライン準拠の毅然とした対応文が15秒で生成されます。",
              },
              {
                iconSvg: <svg className="w-7 h-7 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                title: "カスハラ証拠記録テンプレート",
                desc: "日時・場所・発言内容・対応経緯を整理した記録テンプレートを生成。行政への報告や訴訟対応に備えた証拠管理ができます。",
              },
              {
                iconSvg: <svg className="w-7 h-7 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                title: "不当要求の断り文",
                desc: "「契約外のサービスを要求」「スタッフの交代を執拗に要求」への明確な断り文。感情的にならず毅然と断れます。",
              },
              {
                iconSvg: <svg className="w-7 h-7 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                title: "過剰な電話への対応文",
                desc: "「1日何十回も電話してくる」への連絡ルール設定文・通知書テンプレートを生成。境界線を明確に設定できます。",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-xl p-6" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <div className="mb-2">{f.iconSvg}</div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/50">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 厚労省ガイドライン対応バッジ + 導入施設モック */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          {/* 厚労省ガイドライン準拠バッジ */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-3 bg-green-500/10 border-2 border-green-500 rounded-2xl px-6 py-4 shadow-lg">
              <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div>
                <p className="text-green-700 font-bold text-sm">厚生労働省ガイドライン対応</p>
                <p className="text-green-600 text-xs">介護現場のハラスメント対策マニュアル準拠</p>
              </div>
              <span className="ml-2 bg-green-500/100 text-white text-xs font-bold px-3 py-1 rounded-full">認定準拠</span>
            </div>
          </div>

          {/* 導入施設モック */}
          <h2 className="text-2xl font-bold text-center mb-3">こんな介護施設に選ばれています</h2>
          <p className="text-center text-white/40 text-sm mb-8">様々な介護事業形態でご活用いただいています</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "特別養護老人ホーム", detail: "定員80名規模" },
              { name: "介護老人保健施設", detail: "リハビリ特化型" },
              { name: "グループホーム", detail: "定員9名規模" },
              { name: "デイサービスセンター", detail: "通所介護事業所" },
            ].map((f) => (
              <div key={f.name} className="flex flex-col items-center bg-teal-500/10 border border-teal-100 rounded-xl py-5 px-3 text-center">
                <div className="w-10 h-10 rounded-xl mb-2 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #CCFBF1, #99F6E4)' }}>
                  <svg className="w-5 h-5 text-teal-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <p className="font-bold text-white text-xs mb-1">{f.name}</p>
                <p className="text-teal-600 text-xs">{f.detail}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/40 text-center mt-4">※導入施設のイメージです</p>
        </div>
      </section>

      {/* 利用者の声 */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-10">介護スタッフの声</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { role: "訪問介護事業所・管理者・40代", text: "ご家族から毎日10回以上電話がかかってきて、スタッフが精神的に限界でした。対応文を使ってからは、連絡のルールを明確に設定でき、電話の回数が激減しました。" },
              { role: "デイサービス施設長・50代", text: "「訴える」「監査を呼ぶ」と脅してくる家族への対応に悩んでいました。法的根拠のある毅然とした文書が作れるので、スタッフも自信を持って対応できています。" },
              { role: "ヘルパー事業所・サービス提供責任者・30代", text: "インシデント記録の書き方がわからず、行政報告のたびに困っていました。このツールで記録テンプレートが即生成されるので、事業所全体の記録品質が上がりました。" },
            ].map((v, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-md border border-white/40 shadow-xl rounded-xl p-5">
                <div className="flex text-yellow-400 text-sm mb-3">{""}</div>
                <p className="text-sm text-white/80 mb-3 leading-relaxed">{v.text}</p>
                <p className="text-xs text-white/40">{v.role}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/40 text-center mt-4">※個人の感想です。効果には個人差があります。</p>
        </div>
      </section>

      {/* 2026年義務化対応チェックリスト */}
      <section className="py-16 bg-amber-500/10 border-y border-amber-200">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl"></span>
            <h2 className="text-2xl font-bold text-white">2026年10月義務化 — 事業所の対応チェックリスト</h2>
          </div>
          <p className="text-center text-white/50 text-sm mb-2">改正労働施策総合推進法第30条の7・介護運営基準改正に基づく必須対応項目</p>
          <p className="text-center text-xs text-amber-400 bg-amber-100 border border-amber-300 rounded-lg px-4 py-2 mb-8 max-w-2xl mx-auto">
            未対応事業所は行政指導・指定取消処分のリスクがあります。今すぐ準備状況を確認してください。
          </p>
          <div className="bg-white border border-amber-300 rounded-2xl p-6 shadow-lg">
            <div className="space-y-3">
              {[
                { item: "カスハラ方針の明文化（就業規則・重要事項説明書への記載）", status: "必須", law: "運営基準改正" },
                { item: "カスハラの定義・禁止行為の全職員への周知・研修実施", status: "必須", law: "労働施策総合推進法" },
                { item: "相談窓口の設置と担当者の指名・教育", status: "必須", law: "運営基準改正" },
                { item: "カスハラ発生時の対応フロー（記録→報告→エスカレーション）の整備", status: "必須", law: "運営基準改正" },
                { item: "悪質ケースへの具体的対処方針（契約解除基準・警察連携方針）の文書化", status: "必須", law: "労働施策総合推進法" },
                { item: "カスハラ記録書式の整備（インシデント記録・証拠保全様式）", status: "推奨", law: "厚労省ガイドライン" },
                { item: "顧問弁護士・社会保険労務士との連携体制の確認", status: "推奨", law: "厚労省ガイドライン" },
              ].map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-white/10 hover:bg-amber-500/10 transition-colors">
                  <div className="w-6 h-6 border-2 border-amber-400 rounded mt-0.5 shrink-0 flex items-center justify-center">
                    <span className="text-amber-400 text-xs">□</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white/90 font-medium">{c.item}</p>
                    <p className="text-xs text-white/40 mt-0.5">根拠: {c.law}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${c.status === "必須" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-400"}`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-amber-500/10 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-sm font-bold text-amber-900 mb-1">このチェックリストの「必須」項目を満たす文書を、AIが即座に生成します</p>
              <p className="text-xs text-amber-400 mb-3">対応フロー・記録書式・対処方針文書をワンクリックで作成。義務化対応をゼロから始められます。</p>
              <a href="/tool" aria-label="介護カスハラAIツールで義務化対応文書を無料で生成する" className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
                義務化対応文書を無料で生成する →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* BtoB費用対効果セクション */}
      <section className="py-16 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-3">導入コストの比較</h2>
          <p className="text-center text-white/50 text-sm mb-10">介護事業所がカスハラ対策にかかる一般的なコストとの比較</p>
          <div className="grid md:grid-cols-3 gap-5 mb-8">
            {[
              {
                iconSvg: <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                label: "弁護士顧問契約",
                cost: "月額¥3万〜¥10万",
                note: "カスハラ1件の相談のみで¥1万〜",
                color: "border-red-200 bg-red-500/10",
                textColor: "text-red-700",
              },
              {
                iconSvg: <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                label: "社労士コンサル",
                cost: "月額¥2万〜¥5万",
                note: "マニュアル作成は別途費用",
                color: "border-orange-200 bg-orange-500/10",
                textColor: "text-orange-700",
              },
              {
                iconSvg: <svg className="w-5 h-5 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                label: "介護カスハラAI",
                cost: "月額¥9,800（事業所）",
                note: "対応文・記録・書面を無制限生成",
                color: "border-teal-400 bg-teal-500/10",
                textColor: "text-teal-700",
                highlight: true,
              },
            ].map((item, i) => (
              <div key={i} className={`bg-white/80 backdrop-blur-md border-2 rounded-2xl p-5 ${item.color} ${item.highlight ? "ring-2 ring-teal-400 shadow-xl" : ""} relative`}>
                {item.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full">最もコスパ高</div>
                )}
                <div className="mb-2">{item.iconSvg}</div>
                <p className="font-bold text-white text-sm mb-1">{item.label}</p>
                <p className={`text-lg font-black mb-1 ${item.textColor}`}>{item.cost}</p>
                <p className="text-xs text-white/50">{item.note}</p>
              </div>
            ))}
          </div>
          <div className="bg-teal-500/10 border border-teal-200 rounded-xl p-5 text-center">
            <p className="text-teal-900 font-bold text-base mb-1">事業所プラン¥9,800/月 — 弁護士1回相談分以下のコストで、義務化対応を完結</p>
            <p className="text-sm text-teal-700 mb-4">スタッフ全員が24時間365日、何件でも対応文・記録テンプレートを生成できます。</p>
            <button
              onClick={() => setShowPayjp(true)}
              aria-label="事業所プラン月額9,800円の申し込みモーダルを開く"
              className="bg-teal-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-teal-700 transition-colors text-sm"
            >
              事業所プランを申し込む（¥9,800/月）→
            </button>
          </div>
        </div>
      </section>

      {/* 実際の対応成功事例3シナリオ */}
      <section className="py-16 bg-white/[0.02]/5">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-3">介護現場の対応成功事例</h2>
          <p className="text-center text-white/40 text-sm mb-8">同じ状況に直面した事業所の対応例（すべてAIが生成した文書を活用）</p>
          <div className="space-y-5">
            {[
              {
                category: "過剰な電話・要求",
                before: "利用者の息子が毎日15回以上電話。「いつでも担当者を出せ」と要求し、夜間も着信が続いていた。スタッフ2名が精神的に追い詰められ休職寸前。",
                action: "AIで「連絡時間帯制限通知書」を生成。法的根拠（就業規則・連絡受付時間）を明示した書面を送付。",
                after: "書面送付後3日で1日2〜3回に減少。「書面で来た」という事実がご家族の認識を変えた。スタッフも自信を持って対応できるようになった。",
                iconType: "phone",
              },
              {
                category: "脅迫・暴言（家族）",
                before: "「この施設は訴える」「監査を呼んでやる」と施設長に繰り返し告げる家族。対応に追われ管理者が連日残業。記録もなく証拠が残っていなかった。",
                action: "AIでインシデント記録テンプレートと「法的措置示唆への書面対応文」を生成。「刑法上の脅迫罪に該当する場合がある旨」を文書に明記。",
                after: "書面提出後、家族の言動が落ち着いた。記録が蓄積され、その後の行政対応・第三者委員会への報告にも活用できた。",
                iconType: "alert",
              },
              {
                category: "身体的暴力・性的ハラスメント",
                before: "入浴介助中の利用者による性的言動が複数回発生。スタッフが一人で対応しており、証拠もなく「言った言わない」の問題になっていた。",
                action: "「複数体制への切り替え通知書」と「再発時の契約解除予告通知書」をAIで生成。利用者家族への書面送付と同時に複数体制に変更。",
                after: "体制変更後は問題が発生しなくなった。書面を送付したことで家族も深刻さを認識。スタッフへのアンケートで「安心してケアできる」との回答が増加。",
                iconType: "shield",
              },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-white/15 rounded-2xl overflow-hidden shadow-lg">
                <div className="flex items-center gap-3 bg-teal-500/10 border-b border-teal-100 px-5 py-3">
                  <span className="w-6 h-6 flex items-center justify-center">
                    {s.iconType === "phone" && <svg className="w-5 h-5 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    {s.iconType === "alert" && <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    {s.iconType === "shield" && <svg className="w-5 h-5 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </span>
                  <span className="text-xs font-bold bg-teal-600 text-white px-2 py-0.5 rounded-full">{s.category}</span>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex gap-2">
                    <span className="text-xs font-bold text-red-600 bg-red-500/10 border border-red-200 px-2 py-0.5 rounded shrink-0 h-fit">Before</span>
                    <p className="text-sm text-white/80 leading-relaxed">{s.before}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-200 px-2 py-0.5 rounded shrink-0 h-fit">対応</span>
                    <p className="text-sm text-white/80 leading-relaxed">{s.action}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs font-bold text-teal-600 bg-teal-500/10 border border-teal-200 px-2 py-0.5 rounded shrink-0 h-fit">After</span>
                    <p className="text-sm text-white/80 leading-relaxed">{s.after}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/40 text-center mt-4">※ 事例はAIツール活用の参考例です。効果には個差があります。</p>
        </div>
      </section>

      <section className="bg-white/5 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-3">料金プラン</h2>
          <p className="text-center text-white/50 text-sm mb-10">利用シーンに合わせた3プラン</p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-md border-2 border-white/15 rounded-2xl p-6">
              <p className="text-white/50 font-bold mb-2">個人プラン</p>
              <p className="text-4xl font-black text-white mb-1">¥2,980<span className="text-base font-normal text-white/50">/月</span></p>
              <p className="text-white/40 text-sm mb-6">個人スタッフ・ヘルパー向け</p>
              <ul className="space-y-3 text-sm text-white/80 mb-8">
                {["カスハラ対応文 月30件生成", "証拠記録テンプレート", "介護特化プロンプト対応", "いつでも解約可能"].map((f) => (
                  <li key={f} className="flex items-center gap-2"><span className="text-green-500 font-bold"></span>{f}</li>
                ))}
              </ul>
              <button
                onClick={() => setShowPayjp(true)}
                aria-label="個人プラン月額2,980円の申し込みモーダルを開く"
                className="w-full border-2 border-teal-600 text-teal-600 font-bold py-3 rounded-xl hover:bg-teal-500/10 transition-colors"
              >
                申し込む
              </button>
            </div>
            <div className="bg-white/80 backdrop-blur-md border-2 border-teal-600 rounded-2xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-xs font-bold px-4 py-1 rounded-full">人気</div>
              <p className="text-teal-700 font-bold mb-2">事業所プラン</p>
              <p className="text-4xl font-black text-white mb-1">¥9,800<span className="text-base font-normal text-white/50">/月</span></p>
              <p className="text-white/40 text-sm mb-6">1事業所向け</p>
              <ul className="space-y-3 text-sm text-white/80 mb-8">
                {["カスハラ対応文 月100件生成", "証拠記録テンプレート", "介護特化プロンプト対応", "いつでも解約可能"].map((f) => (
                  <li key={f} className="flex items-center gap-2"><span className="text-green-500 font-bold"></span>{f}</li>
                ))}
              </ul>
              <button
                onClick={() => setShowPayjp(true)}
                aria-label="事業所プラン月額9,800円の申し込みモーダルを開く"
                className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition-colors"
              >
                申し込む
              </button>
            </div>
            <div className="bg-white/80 backdrop-blur-md border-2 border-white/15 rounded-2xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-600 text-white text-xs font-bold px-4 py-1 rounded-full">複数事業所向け</div>
              <p className="text-white/80 font-bold mb-2">チェーンプラン</p>
              <p className="text-4xl font-black text-white mb-1">要相談</p>
              <p className="text-white/40 text-sm mb-6">複数事業所・法人一括契約</p>
              <ul className="space-y-3 text-sm text-white/80 mb-8">
                {["事業所プラン全機能", "複数事業所の一括管理", "スタッフ研修用マニュアル生成", "優先サポート・訪問研修相談可"].map((f) => (
                  <li key={f} className="flex items-center gap-2"><span className="text-green-500 font-bold"></span>{f}</li>
                ))}
              </ul>
              <a
                href="https://x.com/levona_design"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-gray-700 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Xにてお問い合わせ →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 介護カスハラAIだけができること — 差別化SEOセクション */}
      <section className="bg-white border-t border-teal-100 py-14 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full mb-3">介護特化の強み</div>
            <h2 className="text-2xl font-bold text-white mb-2">介護カスハラAIだけができる3つのこと</h2>
            <p className="text-sm text-white/50">汎用クレーム対応ツールや社労士コンサルとの決定的な違い</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 mb-8">
            {[
              {
                iconSvg: <svg className="w-6 h-6 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                title: "介護保険法・運営基準を自動引用",
                desc: "「介護保険法第〇条」「介護運営基準改正（2026年10月施行）」を対応文に自動引用。一般クレームAIには真似できない、介護特有の法的根拠が即使えます。",
                badge: "汎用AIにはない",
              },
              {
                iconSvg: <svg className="w-6 h-6 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                title: "訪問介護・特養・デイ別に最適化",
                desc: "「単独訪問中のカスハラ」「夜間帯施設での対応」「デイ送迎中の問題」——事業所形態ごとに異なるリスクに特化した書面が生成されます。",
                badge: "社労士コンサルより速い",
              },
              {
                iconSvg: <svg className="w-6 h-6 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                title: "証拠記録シートをワンクリックDL",
                desc: "対応文生成後、Excelで即使える証拠記録シート（日時・場所・発言・対応者・深刻度）をダウンロード。行政指導・国保連への報告にそのまま使えます。",
                badge: "義務化対応に直結",
              },
            ].map(item => (
              <div key={item.title} className="bg-teal-500/10 rounded-2xl p-5 border border-teal-200">
                <div className="flex items-center gap-2 mb-3">
                  {item.iconSvg}
                  <span className="text-xs bg-teal-600 text-white font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
                </div>
                <h3 className="font-bold text-teal-900 mb-2 text-sm">{item.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-teal-600 text-white rounded-2xl p-6 text-center max-w-2xl mx-auto">
            <p className="font-bold text-lg mb-1">社労士1回相談（¥1万〜）より安く、今すぐ対応文が生成できます</p>
            <p className="text-teal-100 text-sm mb-4">事業所プラン¥9,800/月 — 弁護士顧問契約の1/30以下のコストで義務化対応を完結</p>
            <Link href="/tool" className="inline-block bg-white text-teal-700 font-bold px-8 py-3 rounded-xl hover:bg-teal-500/10 text-sm">
              無料で3回試してみる →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-teal-700 py-16 text-center px-4 text-white overflow-x-hidden">
        <div className="max-w-2xl mx-auto">
          <p className="text-teal-200 text-sm font-semibold mb-2">2026年10月 義務化まで残りわずか</p>
          <h2 className="text-xl md:text-2xl font-bold mb-3">スタッフを守る対応文が、今日から使えます</h2>
          <p className="text-teal-200 text-sm mb-6">「また暴言を受けた」「また家族から電話がきた」——その度に一人で対応しなくていい。<br className="hidden md:block" />AIが毅然とした対応文と証拠記録テンプレートを即生成します。</p>
          <Link
            href="/tool"
            className="inline-block bg-white text-teal-700 font-bold text-lg px-8 py-4 rounded-xl hover:bg-teal-500/10 shadow-xl transition-colors mb-3 w-full sm:w-auto"
          >
            無料で3回試す（登録不要）→
          </Link>
          <div className="mt-2">
            <button
              onClick={() => setShowPayjp(true)}
              aria-label="プランを選択して介護カスハラAIを無制限で利用するモーダルを開く"
              className="text-teal-100 text-sm underline hover:text-white transition-colors"
            >
              今すぐプランを選んで無制限利用する（個人¥2,980〜）→
            </button>
          </div>
          <div className="flex justify-center gap-6 mt-6 text-teal-200 text-xs">
            <span> 登録不要</span>
            <span> 介護保険法準拠</span>
            <span> いつでも解約可</span>
          </div>
        </div>
      </section>

      {/* 実際のカスハラ事例プレビュー */}
      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-3">実際のカスハラ事例と対応策（一部）</h2>
          <p className="text-center text-white/40 text-sm mb-8">介護現場で多く報告される事例の対応策の一部をご紹介。詳細はAIツールで生成できます。</p>
          <div className="space-y-4">
            {[
              {
                q: "深夜に「今すぐ来い」と電話してくる",
                category: "過剰な電話・要求",
                preview: "連絡時間帯を書面で明示し「緊急時を除き〇時〜〇時の対応となります」と境界を設定。記録台帳に日時・発言内容を記録し、繰り返す場合は…",
              },
              {
                q: "「殺すぞ」などの脅迫的言動",
                category: "暴言・脅迫",
                preview: "発言の日時・場所・証人を記録後、即刻その場を離れ管理者へ報告。事案によっては警察への相談も視野に入れ「刑法上の脅迫罪に該当する旨を…」",
              },
              {
                q: "入浴介助中のセクハラ言動",
                category: "性的嫌がらせ",
                preview: "複数スタッフ体制への切り替えを検討し、利用者・家族へ書面で通知。「業務妨害・職員への性的ハラスメントに対しては契約解除を含む対応を…」",
              },
            ].map((item, i) => (
              <div key={i} className="border border-white/15 rounded-xl overflow-hidden">
                <div className="bg-red-500/10 border-b border-red-100 px-5 py-3 flex items-center gap-3">
                  <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">{item.category}</span>
                  <p className="font-bold text-white text-sm">{item.q}</p>
                </div>
                <div className="px-5 py-4">
                  <p className="text-sm text-white/60 leading-relaxed">{item.preview}</p>
                  <Link
                    href="/tool"
                    className="inline-block mt-3 text-teal-600 text-xs font-semibold hover:underline"
                  >
                    AIツールで完全な対応文を生成する →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/tool"
              className="inline-block bg-teal-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-teal-700 transition-colors text-sm"
            >
              すべての事例に対応できるAIツールを無料で試す →
            </Link>
          </div>
        </div>
      </section>

      {/* 事業所種別 対応ガイドタブ */}
      <section className="py-14 bg-white border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <div className="inline-block bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full mb-3 border border-teal-200">
              事業所種別ガイド
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">あなたの事業所に合わせた対応ガイド</h2>
            <p className="text-white/50 text-sm">訪問介護・特養・デイサービスそれぞれの特性に合わせたカスハラ対応のポイントを紹介します</p>
          </div>
          {/* タブ */}
          <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl" role="tablist" aria-label="事業所種別ガイドタブ">
            {([
              { key: "houmon", label: "訪問介護事業所", iconType: "home" },
              { key: "tokuyou", label: "特養・老健", iconType: "building" },
              { key: "day", label: "デイサービス", iconType: "sun" },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFacilityTab(tab.key)}
                role="tab"
                aria-selected={facilityTab === tab.key}
                aria-label={`${tab.label}の対応ガイドタブを表示する`}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold transition-colors ${facilityTab === tab.key ? "bg-teal-600 text-white shadow-lg" : "text-white/50 hover:text-white/80"}`}
              >
                <span className="w-4 h-4">
                  {tab.iconType === "home" && <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  {tab.iconType === "building" && <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  {tab.iconType === "sun" && <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>}
                </span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.charAt(0)}</span>
              </button>
            ))}
          </div>

          {/* 訪問介護 */}
          {facilityTab === "houmon" && (
            <div className="bg-teal-500/10 border border-teal-200 rounded-2xl p-6 space-y-5">
              <div>
                <h3 className="font-bold text-teal-900 text-lg mb-2"> 訪問介護事業所向けカスハラ対応</h3>
                <p className="text-sm text-teal-800">訪問介護は「一人でご自宅に伺う」特性から、カスハラリスクが最も高い介護形態です。密室・孤立環境でのスタッフ保護が最重要課題です。</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: "リスク特性", icon: "!", items: ["単独訪問による孤立リスク", "密室環境でのセクハラ", "利用者宅での暴言・暴力", "記録者・証人がいない"] },
                  { title: "必須対策", icon: "️", items: ["複数訪問体制への切り替え基準を明文化", "訪問前・後の報告ルール整備", "スタッフからのSOS連絡体制", "「対応できない場合は退出する」権限の付与"] },
                  { title: "AIで生成できる文書", icon: "", items: ["複数体制切り替え通知書", "緊急連絡ルール設定通知", "セクハラ再発防止通知書", "訪問中断・契約解除予告書"] },
                  { title: "義務化対応ポイント", icon: "OK", items: ["訪問介護特有のリスクを就業規則に明記", "単独訪問時の安全確認フロー整備", "カスハラ報告書式の統一", "スタッフへの定期研修記録"] },
                ].map((card) => (
                  <div key={card.title} className="bg-white border border-teal-100 rounded-xl p-4">
                    <p className="font-bold text-teal-800 text-sm mb-2">{card.icon} {card.title}</p>
                    <ul className="space-y-1">
                      {card.items.map((item) => (
                        <li key={item} className="text-xs text-white/80 flex items-start gap-1.5">
                          <span className="text-teal-500 shrink-0 mt-0.5">▶</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 特養・老健 */}
          {facilityTab === "tokuyou" && (
            <div className="bg-blue-500/10 border border-blue-200 rounded-2xl p-6 space-y-5">
              <div>
                <h3 className="font-bold text-blue-900 text-lg mb-2"> 特養・老健向けカスハラ対応</h3>
                <p className="text-sm text-blue-300">特養・老健では、長期入所の利用者家族との関係悪化や、認知症に起因する利用者からの行為が課題です。組織的な記録管理と多職種連携が重要です。</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: "リスク特性", icon: "!", items: ["長期入所による家族の過剰介入", "認知症利用者からの暴言・暴力", "夜間帯の少人数体制での対応", "「以前はそんなことなかった」という否定的クレーム"] },
                  { title: "必須対策", icon: "️", items: ["入所時の重要事項説明書にカスハラ方針を明記", "夜間帯の対応フローと記録体制", "多職種チームでの対応方針統一", "家族面談の記録・議事録の徹底"] },
                  { title: "AIで生成できる文書", icon: "", items: ["重要事項説明書のカスハラ条項", "家族向けカスハラ方針通知書", "繰り返しクレームへの書面回答書", "施設内研修用マニュアル"] },
                  { title: "義務化対応ポイント", icon: "OK", items: ["施設全体のカスハラ対応方針の策定", "相談窓口担当者の指名・研修", "管理者・施設長への報告フロー整備", "行政報告用のインシデント記録様式統一"] },
                ].map((card) => (
                  <div key={card.title} className="bg-white border border-blue-100 rounded-xl p-4">
                    <p className="font-bold text-blue-300 text-sm mb-2">{card.icon} {card.title}</p>
                    <ul className="space-y-1">
                      {card.items.map((item) => (
                        <li key={item} className="text-xs text-white/80 flex items-start gap-1.5">
                          <span className="text-blue-500 shrink-0 mt-0.5">▶</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* デイサービス */}
          {facilityTab === "day" && (
            <div className="bg-emerald-500/10 border border-emerald-200 rounded-2xl p-6 space-y-5">
              <div>
                <h3 className="font-bold text-emerald-900 text-lg mb-2"> デイサービス向けカスハラ対応</h3>
                <p className="text-sm text-emerald-800">デイサービスは送迎・入浴・レクリエーションなど多岐にわたる場面でのカスハラリスクがあります。「通所をやめさせたくない」という家族心理も対応を難しくする要因です。</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: "リスク特性", icon: "!", items: ["送迎時の利用者・家族対応", "入浴介助中のセクハラ", "「他の利用者に迷惑をかける」行為への対応", "家族からの「もっと特別扱いしろ」要求"] },
                  { title: "必須対策", icon: "️", items: ["サービス利用契約書にカスハラ条項を追加", "送迎担当の複数体制化基準の明文化", "利用停止の判断フローと記録体制", "他の利用者への影響を含めた記録"] },
                  { title: "AIで生成できる文書", icon: "", items: ["サービス利用規約のカスハラ条項", "利用者家族への警告通知書", "一時利用停止通知書", "他利用者保護を含む対応記録書"] },
                  { title: "義務化対応ポイント", icon: "OK", items: ["通所介護の運営規程へのカスハラ条項追加", "スタッフへの定期研修の記録", "苦情受付窓口の設置と周知", "利用者・家族向けの利用ルール説明"] },
                ].map((card) => (
                  <div key={card.title} className="bg-white border border-emerald-100 rounded-xl p-4">
                    <p className="font-bold text-emerald-800 text-sm mb-2">{card.icon} {card.title}</p>
                    <ul className="space-y-1">
                      {card.items.map((item) => (
                        <li key={item} className="text-xs text-white/80 flex items-start gap-1.5">
                          <span className="text-emerald-500 shrink-0 mt-0.5">▶</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/tool" className="inline-block bg-teal-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-teal-700 transition-colors text-sm">
              あなたの事業所の状況に合わせた対応文をAIで生成する →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white/[0.02]/5">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-xl font-bold text-center text-white/90 mb-6">よくある質問</h2>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: [
                  { "@type": "Question", name: "カスハラとクレームの違いは何ですか？", acceptedAnswer: { "@type": "Answer", text: "正当なクレームは利用者・家族が改善を求める権利の行使であり、適切に対応すべきものです。一方カスハラは、要求内容や手段が社会通念上著しく相当性を欠く行為（暴言・脅迫・長時間拘束・業務妨害等）を指します。本ツールはAIがカスハラ度（高/中/低）を判定し、両者を区別して対応策を提案します。" } },
                  { "@type": "Question", name: "どんなカスハラ事例に対応していますか？", acceptedAnswer: { "@type": "Answer", text: "怒鳴り・暴言・長時間拘束・土下座要求・SNS投稿脅迫・身体的暴力の前段階まで、介護現場で実際に起きる事例に広く対応しています。" } },
                  { "@type": "Question", name: "出力結果はそのまま使えますか？", acceptedAnswer: { "@type": "Answer", text: "対応スクリプト・記録テンプレートはそのままご活用いただけます。ただし法的手続き（警察通報・成年後見申立等）は必ず専門家にご相談ください。" } },
                  { "@type": "Question", name: "2026年10月の義務化に対応できますか？", acceptedAnswer: { "@type": "Answer", text: "はい。改正労働施策総合推進法・介護運営基準改正に基づくカスハラ方針の明文化・対応フロー整備・記録書式の準備を、AIが生成する文書でサポートします。義務化チェックリストの全項目に対応した文書を即座に生成できます。" } },
                  { "@type": "Question", name: "個人スタッフでも使えますか？", acceptedAnswer: { "@type": "Answer", text: "はい。個人プラン（¥2,980/月）は個人スタッフ・ヘルパー向けです。事業所プラン（¥9,800/月）は事業所単位での利用に対応しています。" } },
                  { "@type": "Question", name: "利用者・家族に対して強硬な対応をすることになりませんか？", acceptedAnswer: { "@type": "Answer", text: "本ツールはカスハラ（過剰要求・暴言・脅迫）と正当な苦情を明確に区別します。正当な要望には丁寧に対応することを前提に、度を超えた行為からスタッフを守る文書を生成します。利用者の権利を尊重した文言での対応文を生成します。" } },
                  { "@type": "Question", name: "料金はいくらですか？", acceptedAnswer: { "@type": "Answer", text: "個人プラン¥2,980/月（個人スタッフ向け）と事業所プラン¥9,800/月（事業所単位）の2プランがあります。複数事業所・法人一括はXにてご相談ください。" } },
                  { "@type": "Question", name: "訪問介護と施設介護で対応内容は違いますか？", acceptedAnswer: { "@type": "Answer", text: "はい。訪問介護事業所・特養・デイサービスそれぞれの状況・体制に合わせた対応文を生成します。訪問介護では単独対応が多いため、体制変更通知や記録の重要性が特に高く、そのポイントを踏まえた文書を生成します。" } },
                  { "@type": "Question", name: "証拠記録はどうやって管理すればいいですか？", acceptedAnswer: { "@type": "Answer", text: "ツールの結果画面から「証拠記録シート（TSV形式）」をダウンロードできます。日時・場所・対象者・状況・対応者・対応内容の列が整備されており、Excelで開いてそのまま記録管理に使えます。法的手続き・労災申請・契約解除の際の証拠として機能します。" } },
                  { "@type": "Question", name: "カスハラを受けたスタッフのメンタルケアは？", acceptedAnswer: { "@type": "Answer", text: "カスハラを受けたスタッフへの心理的サポートは事業者の義務です。本ツールは対応文書生成のほか、2026年10月義務化に向けた相談窓口設置・研修実施の文書雛形も提供します。深刻なケースでは産業医・EAP（従業員支援プログラム）への連携をおすすめします。" } },
                  { "@type": "Question", name: "家族（第三者）からのカスハラにも対応できますか？", acceptedAnswer: { "@type": "Answer", text: "はい。要求者として「家族・親族」を選択することで、家族からの不当クレーム・威圧・脅迫に特化した対応文を生成します。同居家族・遠方家族・複数家族間の調整が難しいケースも想定した書面通知文を出力します。" } },
                ],
              }),
            }}
          />
          <div className="space-y-4">
            {[
              { q: "カスハラとクレームの違いは何ですか？", a: "正当なクレームは利用者・家族が改善を求める権利の行使であり、適切に対応すべきものです。カスハラは要求内容や手段が社会通念上著しく相当性を欠く行為（暴言・脅迫・長時間拘束・業務妨害等）を指します。本ツールはAIがカスハラ度（高/中/低）を判定し、両者を区別して対応策を提案します。" },
              { q: "2026年10月の義務化に対応できますか？", a: "はい。改正労働施策総合推進法・介護運営基準改正に基づくカスハラ方針の明文化・対応フロー整備・記録書式の準備を、AIが生成する文書でサポートします。義務化チェックリストの全項目に対応した文書を即座に生成できます。" },
              { q: "どんなカスハラ事例に対応していますか？", a: "怒鳴り・暴言・長時間拘束・土下座要求・SNS投稿脅迫・身体的暴力の前段階まで、介護現場で実際に起きる事例に広く対応しています。" },
              { q: "訪問介護と施設介護で対応内容は違いますか？", a: "はい。訪問介護事業所・特養・デイサービスそれぞれの状況・体制に合わせた対応文を生成します。訪問介護では単独対応が多いため、体制変更通知や記録の重要性が特に高く、そのポイントを踏まえた文書を生成します。" },
              { q: "個人スタッフでも使えますか？", a: "はい。個人プラン（¥2,980/月）は個人スタッフ・ヘルパー向けです。事業所プラン（¥9,800/月）は事業所単位での利用に対応しています。複数事業所・法人一括はXにてご相談ください。" },
              { q: "利用者・家族への対応が強硬になりませんか？", a: "本ツールはカスハラ（過剰要求・暴言・脅迫）と正当な苦情を明確に区別します。正当な要望には丁寧に対応することを前提に、度を超えた行為からスタッフを守る文書を生成します。利用者の権利を尊重した文言での対応文を提供します。" },
              { q: "出力結果はそのまま使えますか？", a: "対応スクリプト・記録テンプレートはそのままご活用いただけます。ただし法的手続き（警察通報・成年後見申立等）は必ず専門家にご相談ください。" },
              { q: "料金はいくらですか？", a: "個人プラン¥2,980/月（個人スタッフ向け）と事業所プラン¥9,800/月（事業所単位）の2プランがあります。複数事業所・法人一括はXにてご相談ください。" },
              { q: "証拠記録はどうやって管理すればいいですか？", a: "ツールの結果画面から「証拠記録シート（TSV形式）」をダウンロードできます。日時・場所・対象者・状況・対応者・対応内容の列が整備されており、Excelで開いてそのまま記録管理に使えます。法的手続き・労災申請・契約解除の際の証拠として機能します。" },
              { q: "カスハラを受けたスタッフのメンタルケアは？", a: "カスハラを受けたスタッフへの心理的サポートは事業者の義務です。本ツールは対応文書生成のほか、2026年10月義務化に向けた相談窓口設置・研修実施の文書雛形も提供します。深刻なケースでは産業医・EAP（従業員支援プログラム）への連携をおすすめします。" },
              { q: "家族（第三者）からのカスハラにも対応できますか？", a: "はい。要求者として「家族・親族」を選択することで、家族からの不当クレーム・威圧・脅迫に特化した対応文を生成します。同居家族・遠方家族・複数家族間の調整が難しいケースも想定した書面通知文を出力します。" },
            ].map((faq, i) => (
              <div key={i} className="backdrop-blur-sm bg-white/80 border border-white/40 shadow-xl rounded-xl p-5">
                <p className="font-semibold text-teal-800 mb-2 text-sm">Q. {faq.q}</p>
                <p className="text-sm text-white/60">A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* インタラクティブ対応フロー */}
      <section className="py-14 bg-teal-500/10 border-t border-teal-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">カスハラ種別別 対応フロー</h2>
            <p className="text-white/50 text-sm">種別を選択すると、具体的な対応ステップと必要な書類が表示されます</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {Object.entries(FLOW_TYPES).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setSelectedFlowType(selectedFlowType === key ? null : key)}
                aria-label={`カスハラ種別「${val.label}」の対応フローを${selectedFlowType === key ? "閉じる" : "表示する"}`}
                aria-pressed={selectedFlowType === key}
                className={`font-bold px-5 py-2.5 rounded-full text-sm transition-colors border-2 ${selectedFlowType === key ? `${val.color} text-white border-transparent` : "bg-white/5 text-white/80 border-white/15 hover:border-teal-400"}`}
              >
                {val.label}
              </button>
            ))}
          </div>
          {selectedFlowType && FLOW_TYPES[selectedFlowType] && (
            <div className="bg-white border border-teal-200 rounded-2xl overflow-hidden shadow-lg">
              <div className={`${FLOW_TYPES[selectedFlowType].color} text-white px-6 py-3 flex items-center gap-2`}>
                <span className="font-bold">{FLOW_TYPES[selectedFlowType].label} — 対応フロー</span>
              </div>
              <div className="p-6 space-y-4">
                {FLOW_TYPES[selectedFlowType].steps.map((s, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-black text-sm shrink-0">{i + 1}</div>
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm mb-1">{s.step}</p>
                      <p className="text-white/80 text-sm mb-2 leading-relaxed">{s.action}</p>
                      <span className="inline-flex items-center gap-1 text-xs bg-teal-500/10 text-teal-700 border border-teal-200 rounded-full px-3 py-1 font-medium">
                         {s.doc}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-teal-100 text-center">
                  <Link href="/tool" className="inline-block bg-teal-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-teal-700 transition-colors text-sm">
                    このフローの書類をAIで生成する →
                  </Link>
                </div>
              </div>
            </div>
          )}
          {!selectedFlowType && (
            <div className="bg-white border border-dashed border-teal-300 rounded-2xl p-8 text-center text-teal-400">
              <p className="font-bold text-sm">上のボタンでカスハラ種別を選択してください</p>
              <p className="text-xs mt-1">対応フローと必要書類が自動的に展開されます</p>
            </div>
          )}
        </div>
      </section>

      {/* 介護保険法違反リスク判定チェッカー */}
      <section className="py-14 bg-orange-500/10 border-t border-orange-100">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-6">
            <div className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full mb-3 border border-orange-200">
               介護保険法 — 指定取消リスク判定チェッカー
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">指定取消リスク、今すぐチェック</h2>
            <p className="text-white/50 text-sm">5つの質問に「はい」「いいえ」で答えるだけ。介護保険法上の運営基準違反リスクを判定します。</p>
          </div>
          <div className="bg-white border border-orange-200 rounded-2xl p-6 shadow-lg">
            <div className="space-y-4 mb-6">
              {KAIGO_RISK_QUESTIONS.map((q) => (
                <div key={q.id} className="p-4 rounded-xl border border-white/10 bg-white/5">
                  <p className="text-sm text-white/90 font-medium mb-3">
                    <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full mr-2">Q{q.id}</span>
                    {q.text}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setKaigoRiskAnswers(prev => ({ ...prev, [q.id]: true }))}
                      aria-label={`Q${q.id}「${q.text}」に「はい」と答える`}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-colors ${kaigoRiskAnswers[q.id] === true ? "bg-teal-600 text-white border-teal-600" : "bg-white/5 text-white/60 border-white/15 hover:border-teal-400"}`}
                    >
                      はい
                    </button>
                    <button
                      onClick={() => setKaigoRiskAnswers(prev => ({ ...prev, [q.id]: false }))}
                      aria-label={`Q${q.id}「${q.text}」に「いいえ」と答える`}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-colors ${kaigoRiskAnswers[q.id] === false ? "bg-red-500/100 text-white border-red-500" : "bg-white/5 text-white/60 border-white/15 hover:border-red-400"}`}
                    >
                      いいえ
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={checkKaigoRisk}
              disabled={Object.keys(kaigoRiskAnswers).length < 5}
              aria-label="5問すべてに回答した後、介護保険法違反リスクを判定する"
              className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition-colors mb-4 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {Object.keys(kaigoRiskAnswers).length < 5 ? `あと${5 - Object.keys(kaigoRiskAnswers).length}問答えてください` : "指定取消リスクを判定する →"}
            </button>

            {kaigoRiskResult === "low" && (
              <div className="bg-green-500/10 border-2 border-green-400 rounded-xl p-4">
                <p className="text-green-800 font-bold mb-1">OK リスクスコア: 低（0〜1項目該当）</p>
                <p className="text-green-700 text-sm mb-3">対応体制が整っています。引き続き証拠記録の継続と運営規程の定期見直しを推奨します。2026年10月義務化に向けた仕上げとして、対応フローの文書化も進めておきましょう。</p>
                <button onClick={downloadEvidenceSheet} aria-label="カスハラ証拠記録シートをダウンロードして継続的に記録管理する" className="inline-flex items-center gap-1.5 bg-green-600 text-white font-bold px-5 py-2 rounded-xl hover:bg-green-700 transition-colors text-sm">
                  <span></span>証拠記録シートをDLして継続記録する
                </button>
              </div>
            )}
            {kaigoRiskResult === "medium" && (
              <div className="bg-yellow-500/10 border-2 border-yellow-400 rounded-xl p-4">
                <p className="text-yellow-800 font-bold mb-1">! リスクスコア: 中（2〜3項目該当）</p>
                <p className="text-yellow-700 text-sm mb-3">一部リスクあり。カスハラ対応マニュアルの整備・運営規程へのカスハラ条項追加を急いでください。2026年10月義務化施行後に実地指導が入った場合、改善命令が出る可能性があります。</p>
                <Link href="/tool" className="inline-block bg-yellow-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-yellow-700 transition-colors text-sm">
                  AIで運営規程・マニュアルを即生成する →
                </Link>
              </div>
            )}
            {kaigoRiskResult === "high" && (
              <div className="bg-red-500/10 border-2 border-red-500 rounded-xl p-4">
                <p className="text-red-800 font-bold mb-2"> リスクスコア: 高（4〜5項目該当）</p>
                <p className="text-red-700 text-sm mb-3">! 高リスク: 自治体の実地指導が入ると、介護保険法上の運営基準違反として<strong>改善命令・指定取消処分</strong>が出る可能性があります。記録体制・マニュアル整備・運営規程改訂を今すぐ始めてください。</p>
                <Link href="/tool" className="inline-block bg-red-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-red-400 transition-colors text-sm">
                  緊急：AIで義務化対応文書を今すぐ生成する →
                </Link>
              </div>
            )}
            <p className="text-xs text-white/40 mt-3 text-center">※本チェッカーはAIによる参考判定です。実際の対応は管理者・弁護士・社労士にご確認ください。</p>

            {/* Print button - shown after result */}
            {kaigoRiskResult && (
              <div className="mt-4 text-center print:hidden">
                <button
                  onClick={() => window.print()}
                  aria-label="介護カスハラ対策チェックリストを印刷する"
                  className="inline-flex items-center gap-2 bg-gray-800 text-white font-bold px-6 py-3 rounded-xl hover:bg-gray-900 transition-colors text-sm"
                >
                  <span>️</span>
                  <span>対策チェックリストを印刷する</span>
                </button>
              </div>
            )}
          </div>

          {/* Hidden printable area */}
          {kaigoRiskResult && (
            <div id="kaigo-risk-print" className="hidden print:block">
              <h3>介護カスハラ対策 — 指定取消リスク判定チェックリスト</h3>
              <p style={{ fontSize: "10pt", color: "#666", marginBottom: "12pt" }}>
                判定日: {new Date().toLocaleDateString("ja-JP")} ／ 介護カスハラAI (kaigo-custharass-ai.vercel.app)
              </p>
              {KAIGO_RISK_QUESTIONS.map((q) => (
                <div key={q.id} className="print-item">
                  <p>
                    <strong>Q{q.id}.</strong> {q.text}
                  </p>
                  <p style={{ marginLeft: "24pt", color: kaigoRiskAnswers[q.id] === true ? "#16a34a" : kaigoRiskAnswers[q.id] === false ? "#dc2626" : "#666" }}>
                    回答: {kaigoRiskAnswers[q.id] === true ? "はい" : kaigoRiskAnswers[q.id] === false ? "いいえ" : "未回答"}
                  </p>
                </div>
              ))}
              <div className="print-result">
                判定結果: {kaigoRiskResult === "low" ? "OK リスクスコア: 低（0〜1項目該当）— 対応体制が整っています。" : kaigoRiskResult === "medium" ? "! リスクスコア: 中（2〜3項目該当）— 一部リスクあり。マニュアル整備・運営規程へのカスハラ条項追加を急いでください。" : " リスクスコア: 高（4〜5項目該当）— 高リスク。記録体制・マニュアル整備・運営規程改訂を今すぐ始めてください。"}
              </div>
              <p style={{ fontSize: "9pt", color: "#999", marginTop: "16pt" }}>
                ※本チェッカーはAIによる参考判定です。実際の対応は管理者・弁護士・社労士にご確認ください。
              </p>
              <p style={{ fontSize: "9pt", color: "#999" }}>
                2026年10月 改正労働施策総合推進法・介護運営基準改正 義務化施行予定
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 法改正2024年タイムライン */}
      <section className="py-14 bg-white border-t border-white/10">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">法改正タイムライン</h2>
            <p className="text-white/50 text-sm">介護カスハラ対策に関する法令・ガイドラインの変遷</p>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="space-y-6">
              {LAW_TIMELINE.map((item, i) => (
                <div key={i} className="flex items-start gap-5 relative">
                  <div className={`w-12 h-12 ${item.color} text-white rounded-full flex items-center justify-center text-xs font-black shrink-0 z-10 shadow-lg`}>
                    {item.year.replace("年", "").replace("0月", "")}
                  </div>
                  <div className={`flex-1 rounded-xl p-4 border ${item.current ? "bg-red-500/10 border-red-300" : "bg-white/5 border-white/15"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-sm">{item.year}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.current ? "bg-red-500 text-white" : "bg-gray-300 text-white/80"}`}>{item.label}</span>
                      {item.current && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold animate-pulse">現在準備中</span>}
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 bg-teal-500/10 border border-teal-200 rounded-xl p-5 text-center">
            <p className="font-bold text-teal-900 text-sm mb-2">2026年10月の義務化まで残りわずか。今すぐ対応文書を準備しましょう。</p>
            <Link href="/tool" className="inline-block bg-teal-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-teal-700 transition-colors text-sm">
              義務化対応文書をAIで無料生成 →
            </Link>
          </div>
        </div>
      </section>

      {/* 事業所向けマニュアルDL */}
      <section className="py-10 bg-gray-800 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-2">無料ダウンロード</p>
          <h2 className="text-xl font-bold mb-2">介護事業所向け カスハラ対応マニュアル（テキスト版）</h2>
          <p className="text-white/30 text-sm mb-5">カスハラの定義・対応フロー・証拠保全方法・義務化チェックリストをまとめたテキストマニュアルです。スタッフへの周知・研修資料としてご活用ください。</p>
          <button
            aria-label="介護事業所向けカスハラ対応マニュアル（テキスト版）を無料ダウンロードする"
            onClick={() => {
              const content = `■ 介護事業所向け カスハラ対応マニュアル（簡易版）
作成：介護カスハラAI / ポッコリラボ
https://kaigo-custharass-ai.vercel.app

━━━━━━━━━━━━━━━━━━━━━━━
1. カスハラの定義
━━━━━━━━━━━━━━━━━━━━━━━
利用者・家族等から業務を遂行する上で著しく支障をきたすような行為のこと。
正当な苦情・改善要望とは区別して対応します。

【主な種類】
・暴言・威圧（怒鳴り・脅迫的発言）
・身体的暴力
・セクシャルハラスメント
・過剰な電話・要求
・不当クレーム・脅迫

━━━━━━━━━━━━━━━━━━━━━━━
2. 発生時の基本対応フロー
━━━━━━━━━━━━━━━━━━━━━━━
STEP1: 安全確保（必要なら退避）
STEP2: 管理者への即時報告
STEP3: インシデント記録（日時・場所・発言内容・証人）
STEP4: 書面による警告・通知
STEP5: 弁護士相談（訴訟リスクがある場合）
STEP6: 契約解除の検討（改善なき場合）

━━━━━━━━━━━━━━━━━━━━━━━
3. 2026年10月義務化 対応チェックリスト
━━━━━━━━━━━━━━━━━━━━━━━
□ カスハラ方針の明文化（就業規則・重要事項説明書への記載）
□ カスハラの定義・禁止行為の全職員への周知・研修実施
□ 相談窓口の設置と担当者の指名・教育
□ 対応フロー（記録→報告→エスカレーション）の整備
□ 悪質ケースへの具体的対処方針の文書化

━━━━━━━━━━━━━━━━━━━━━━━
4. AIツールの活用
━━━━━━━━━━━━━━━━━━━━━━━
介護カスハラAIを活用することで、上記の各種書類・対応文書を
状況を入力するだけでAIが即座に生成します。
https://kaigo-custharass-ai.vercel.app/tool

※本マニュアルはAIによる参考情報です。実際の対応は管理者・専門家にご相談ください。`;
              const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "介護カスハラ対応マニュアル_簡易版.txt";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="inline-flex items-center gap-2 bg-teal-500/100 hover:bg-teal-400 text-white font-bold px-8 py-3 rounded-xl transition-colors"
          >
            <span></span>
            <span>カスハラ対応マニュアルをダウンロード（無料・テキスト版）</span>
          </button>
          <p className="text-white/50 text-xs mt-3">テキストファイル形式 · 登録不要 · 無料</p>
        </div>
      </section>

      {/* カスハラ対策ガイドリンク（SEO内部リンク） */}
      <section className="py-10 px-4 bg-teal-500/10 border-t border-teal-100">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-teal-700 tracking-widest uppercase mb-2">カスハラ対策情報</p>
          <h2 className="text-xl font-bold text-white mb-2">介護カスハラ対策完全ガイド</h2>
          <p className="text-white/50 text-sm mb-4">カスハラの定義・種類・2026年義務化チェックリスト・成功事例を詳しく解説</p>
          <Link
            href="/blog/kasuhara-guide"
            className="inline-block bg-teal-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-teal-700 transition-colors text-sm"
          >
            カスハラ対策完全ガイドを読む →
          </Link>
          <p className="text-xs text-white/40 mt-2">介護カスハラの定義・法的根拠・義務化対応まで全解説</p>
        </div>
      </section>

      {/* 相談履歴パネル */}
      {consultHistory.length > 0 && (
        <section className="py-10 bg-teal-500/10 border-t border-teal-100 print:hidden">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-5">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">あなたの相談履歴</span>
              <h2 className="text-lg font-bold text-white mt-1">最近の相談（過去{consultHistory.length}件）</h2>
            </div>
            <div className="space-y-3">
              {consultHistory.map((entry, i) => (
                <div key={i} className="backdrop-blur-sm bg-white/80 border border-white/40 shadow-xl rounded-xl px-5 py-3 flex items-center justify-between gap-4">
                  <p className="text-sm text-white/80 truncate flex-1">{entry.text}</p>
                  <time className="text-xs text-white/40 shrink-0 whitespace-nowrap">{entry.date}</time>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/tool" className="inline-block bg-teal-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-teal-700 transition-colors text-sm">
                続きをAIで生成する →
              </Link>
            </div>
          </div>
        </section>
      )}

      <CareRoiCalculator />

      {/* X Share + LINE Share */}
      <section className="py-6 px-6 text-center">
        <div className="inline-flex flex-col sm:flex-row gap-2">
          <a
            href={"https://twitter.com/intent/tweet?text=" + encodeURIComponent("介護カスハラAI — 介護施設のカスタマーハラスメント対応文書を30秒で生成 証拠保全・エスカレーション判断もAIがサポート → https://kaigo-custharass-ai.vercel.app #介護 #カスハラ対応 #AI")}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="介護カスハラAIを使ったことをXにシェアする"
            className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl text-sm transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Xでシェアする
          </a>
          <a
            href={"https://line.me/R/msg/text/?" + encodeURIComponent("介護カスハラAI 介護施設のカスハラ対応文書を30秒で生成！証拠保全・エスカレーション判断もAIサポート → https://kaigo-custharass-ai.vercel.app")}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="介護カスハラAIをLINEで友人に送る"
            className="inline-flex items-center gap-2 text-white font-bold py-3 px-6 rounded-xl text-sm transition-colors"
            style={{ background: "#06C755" }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
            </svg>
            LINEで送る
          </a>
        </div>
      </section>

      <footer className="border-t py-6 text-center text-xs text-white/40">
        <div className="space-x-4 mb-2">
          <Link href="/legal" className="hover:underline">特定商取引法に基づく表記</Link>
          <Link href="/privacy" className="hover:underline">プライバシーポリシー</Link>
          <Link href="/terms" className="hover:underline">利用規約</Link>
        </div>
        <p>介護カスハラAI — ポッコリラボ</p>
        <p className="mt-1 text-white/30">本AIの出力は参考情報です。実際の対応は管理者・法的専門家にご相談ください。</p>
      </footer>
    </main>
  );
}
