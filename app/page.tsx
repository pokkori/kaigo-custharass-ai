"use client";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import KomojuButton from "@/components/KomojuButton";
import BankTransferModal from "@/components/BankTransferModal";
import { DeadlineCountdown } from "@/components/DeadlineCountdown";
import { updateStreak, loadStreak, getStreakMilestoneMessage } from "@/lib/streak";
import { StreakBanner } from "@/components/StreakBanner";
import { UsageCounter } from "@/components/UsageCounter";
import { THEMES } from "@/lib/design-system-themes";
import { ShareButtons } from "@/components/ShareButtons";
import { AdBanner } from "@/components/AdBanner";
import { CrossSell } from "@/components/CrossSell";
import { TrustBadge } from "@/components/TrustBadge";
import { TrialModal } from "@/components/TrialModal";
import { PaywallModal } from "@/components/PaywallModal";
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
const TOKYO_GRANT_AMOUNT = 400000; // 東京都奨励金 最大40万円

function CareRoiCalculator({ onTrialClick }: { onTrialClick: () => void }) {
  const [staffCount, setStaffCount] = useState(10);
  const [turnoverRate, setTurnoverRate] = useState(15);
  const [kasuhara, setKasuhara] = useState(30);
  const [useGrant, setUseGrant] = useState(true);

  const leavingFromKasuhara = Math.round((staffCount * (turnoverRate / 100)) * (kasuhara / 100));
  const annualLoss = leavingFromKasuhara * CARE_STAFF_COST_PER_PERSON;
  const monthlyCost = 40000;
  const annualCost = monthlyCost * 12; // 480,000
  const firstYearCost = useGrant ? Math.max(0, annualCost - TOKYO_GRANT_AMOUNT) : annualCost;
  const firstYearSaving = useGrant ? Math.min(TOKYO_GRANT_AMOUNT, annualCost) : 0;
  const roi = annualLoss > 0 ? Math.round(((annualLoss - (useGrant ? firstYearCost : annualCost)) / (useGrant ? firstYearCost || 1 : annualCost)) * 100) : 0;

  return (
    <section className="py-16 bg-teal-500/10 border-t border-teal-100">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">ROIシミュレーター</span>
          <h2 className="text-2xl font-bold text-white mt-2 mb-1">導入コストシミュレーション</h2>
          <p className="text-sm text-white/50">厚労省研究：介護職1人の採用・育成コストは約50万円。カスハラによる離職は直接的な損失です。</p>
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-teal-100 p-6 space-y-5">

          {/* 東京都奨励金トグル */}
          <div className="bg-green-500/10 border border-green-400/40 rounded-xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-green-700">東京都カスハラ防止対策奨励金（最大40万円）を適用する</p>
                <p className="text-xs text-green-600 mt-0.5">従業員300名以下の都内中小企業・社会福祉法人が対象</p>
              </div>
              <button
                onClick={() => setUseGrant(g => !g)}
                aria-pressed={useGrant}
                aria-label={`東京都奨励金を${useGrant ? "適用中（クリックで解除）" : "未適用（クリックで適用）"}`}
                className={`w-14 h-7 rounded-full transition-colors duration-200 shrink-0 relative ${useGrant ? "bg-green-500" : "bg-white/20"}`}
              >
                <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${useGrant ? "translate-x-7" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="roi-staff-count" className="block text-sm font-semibold text-white/80 mb-1">事業所のスタッフ数（人）: <span className="text-teal-600">{staffCount}人</span></label>
            <input id="roi-staff-count" type="range" min={3} max={100} value={staffCount} onChange={e => setStaffCount(Number(e.target.value))} className="w-full accent-teal-600" aria-label={`事業所のスタッフ数: ${staffCount}人`} />
          </div>
          <div>
            <label htmlFor="roi-turnover-rate" className="block text-sm font-semibold text-white/80 mb-1">年間離職率（%）: <span className="text-teal-600">{turnoverRate}%</span></label>
            <input id="roi-turnover-rate" type="range" min={5} max={50} value={turnoverRate} onChange={e => setTurnoverRate(Number(e.target.value))} className="w-full accent-teal-600" aria-label={`年間離職率: ${turnoverRate}%`} />
            <p className="text-xs text-white/40 mt-0.5">介護業界平均は約14.4%（令和4年度介護労働実態調査）</p>
          </div>
          <div>
            <label htmlFor="roi-kasuhara-ratio" className="block text-sm font-semibold text-white/80 mb-1">離職原因のうちカスハラ由来の割合（%）: <span className="text-teal-600">{kasuhara}%</span></label>
            <input id="roi-kasuhara-ratio" type="range" min={5} max={60} value={kasuhara} onChange={e => setKasuhara(Number(e.target.value))} className="w-full accent-teal-600" aria-label={`カスハラ由来の離職割合: ${kasuhara}%`} />
            <p className="text-xs text-white/40 mt-0.5">介護職のハラスメント起因離職は全離職の約30%（厚労省報告書）</p>
          </div>

          {/* コスト内訳 */}
          <div className="bg-white/10 rounded-xl p-4 border border-white/20 space-y-2 text-sm">
            <p className="font-bold text-white/80 text-xs mb-2">コスト内訳</p>
            <div className="flex justify-between text-white/60">
              <span>月額料金</span><span className="font-semibold text-white">¥{monthlyCost.toLocaleString()}/月</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>年間合計</span><span className="font-semibold text-white">¥{annualCost.toLocaleString()}</span>
            </div>
            {useGrant && (
              <div className="flex justify-between text-green-400">
                <span>東京都奨励金（一度限り）</span><span className="font-bold">- ¥{TOKYO_GRANT_AMOUNT.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-white/20 pt-2 mt-2">
              <span className={useGrant ? "text-yellow-300 font-bold" : "text-white/80"}>初年度の実質費用</span>
              <span className={`font-black text-lg ${useGrant && firstYearCost === 0 ? "text-yellow-300" : "text-white"}`}>
                {useGrant && firstYearCost === 0 ? "実質¥0（お釣りあり）" : `¥${firstYearCost.toLocaleString()}`}
              </span>
            </div>
            {useGrant && firstYearSaving > 0 && (
              <p className="text-xs text-green-400 text-right">奨励金で年間¥{firstYearSaving.toLocaleString()}節約</p>
            )}
          </div>

          {/* 結果グリッド */}
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
              <p className="text-xs text-white/50 mb-1">本サービス実質費用（初年度）</p>
              <p className="text-xl font-black text-teal-600">
                {useGrant && firstYearCost === 0 ? "実質¥0" : `¥${(firstYearCost / 10000).toLocaleString()}万`}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/50 mb-1">投資対効果（ROI）</p>
              <p className="text-2xl font-black text-teal-700">
                {useGrant && firstYearCost === 0 ? "∞" : `${roi.toLocaleString()}%`}
              </p>
            </div>
          </div>
          <p className="text-xs text-white/40 text-center">※試算値です。実際の効果は個別状況により異なります。奨励金の対象可否は東京都にご確認ください。</p>
          <div className="text-center flex flex-col sm:flex-row gap-3">
            <button
              onClick={onTrialClick}
              aria-label="14日間無料トライアルに登録する"
              className="flex-1 bg-teal-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-teal-700 transition-colors text-sm min-h-[44px]"
            >
              今すぐ無料で試す →
            </button>
            <a
              href="https://www.tokyo-cusharaboushi.metro.tokyo.lg.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-700 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-800 transition-colors text-sm"
            >
              奨励金の詳細を確認 →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function KaigoLP() {
  const [showPayjp, setShowPayjp] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [showBankTransfer, setShowBankTransfer] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [selectedFlowType, setSelectedFlowType] = useState<string | null>(null);
  const [facilityTab, setFacilityTab] = useState<"houmon" | "tokuyou" | "day">("houmon");
  const [kaigoRiskAnswers, setKaigoRiskAnswers] = useState<Record<number, boolean | null>>({});
  const [kaigoRiskResult, setKaigoRiskResult] = useState<string | null>(null);
  const [streakCount, setStreakCount] = useState(0);
  const [streakMilestone, setStreakMilestone] = useState<string | null>(null);
  const [consultHistory, setConsultHistory] = useState<ConsultHistory[]>([]);
  const [showFloatingCta, setShowFloatingCta] = useState(false);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [refSource, setRefSource] = useState<string | null>(null);
  const exitIntentShown = useRef(false);

  useEffect(() => {
    const target = new Date("2026-10-01");
    const diff = Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    setDaysLeft(Math.max(0, diff));

    // 流入元判定（?ref=fax等）
    const params = new URLSearchParams(window.location.search);
    setRefSource(params.get("ref"));

    // ストリーク更新
    const streak = updateStreak("kaigo");
    setStreakCount(streak.count);
    const msg = getStreakMilestoneMessage(streak.count);
    if (msg) setStreakMilestone(msg);

    // 相談履歴読み込み
    setConsultHistory(loadHistory());

    // FloatingCTA: 50%スクロールで表示
    const handleScroll = () => {
      const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrolled > 0.5) setShowFloatingCta(true);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // 出口インテント: マウスがビューポート上端を出たとき
    const handleMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 5 && !exitIntentShown.current) {
        exitIntentShown.current = true;
        setShowExitIntent(true);
      }
    };
    document.addEventListener("mouseleave", handleMouseOut);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleMouseOut);
    };
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

  const faqs = [
    { q: '介護カスハラAIはどんなサービスですか？', a: 'カスタマーハラスメント（カスハラ）への対応文をAIが即座に生成するWebサービスです。介護現場でのクレームや暴言に対し、適切な対応文章を提示します。登録不要・無料からご利用いただけます。' },
    { q: '無料で使えますか？', a: '月3回まで無料でご利用いただけます。それ以上ご利用の場合は有料プランへのアップグレードが必要です。' },
    { q: '2026年10月のカスハラ義務化に対応できますか？', a: 'はい。介護カスハラAIは、改正労働施策総合推進法が求める「カスハラ対策マニュアル整備・記録保管・対応文書作成」を全面サポートします。義務化チェックリストの全必須項目に対応した文書を即座に生成できます。' },
    { q: '料金はいくらですか？', a: '月額¥4,980のスタンダードプランから、法人向け月額¥29,800のBtoBプランまでご用意しています。まず月3回まで無料でお試しいただけます。' },
    { q: '東京都のカスハラ対策奨励金に使えますか？', a: '介護カスハラAIは東京都のカスタマーハラスメント対策奨励金（最大40万円）の対象ツールとして申請可能です。詳しくは東京都の公式サイトをご確認ください。' },
    { q: '補助金は使えますか？', a: 'はい。デジタル化・AI導入補助金2026（補助率最大4/5）の対象ツールとして申請中です。補助金適用で年間コストを大幅に削減できます。ご契約時に申請方法をご案内いたします。' },
    { q: 'カスハラ対応文書は実際に使えますか？', a: 'AIが生成する対応文書は、厚生労働省ガイドライン準拠の内容です。警告書・記録テンプレート・対応マニュアルは実務に直接活用できます。必要に応じて弁護士・社労士への相談も推奨します。' },
    { q: '介護施設でない事業所でも使えますか？', a: 'はい。訪問介護・デイサービス・グループホームなど介護保険サービス全般のほか、ヘルパー派遣事業者・ケアマネ事務所など幅広くご利用いただけます。' },
    { q: 'スマートフォンでも使えますか？', a: 'はい、PCでもスマートフォンでもご利用いただけます。アプリのインストール不要で、ブラウザからそのまま利用できます。' },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map(faq => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: { '@type': 'Answer', text: faq.a },
            })),
          }).replace(/</g, '\\u003c'),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: '介護カスハラAI',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            description: '介護現場のカスタマーハラスメント対応文・警告書・証拠記録テンプレートをAIが即生成。2026年義務化のカスハラ対策体制整備をサポートする介護事業所向けAIツール。',
            url: 'https://kaigo-custharass-ai.vercel.app',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'JPY',
              description: '月3回まで無料',
            },
          }).replace(/</g, '\\u003c'),
        }}
      />
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
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        }
      `}</style>

      {/* FAX流入バナー */}
      {refSource === "fax" && (
        <div className="bg-teal-700 text-white text-center py-3 px-4 print:hidden">
          <p className="font-bold text-sm md:text-base">FAXをご覧いただいた介護事業所の方へ：まず月3回まで無料でお試しいただけます（クレジットカード不要）</p>
          <button
            onClick={() => setShowTrialModal(true)}
            className="mt-2 bg-white text-teal-700 font-black text-xs px-4 py-1.5 rounded-full hover:bg-yellow-100 transition-colors"
          >
            今すぐ無料体験を始める →
          </button>
        </div>
      )}

      {/* 緊急バナー - 補助金訴求 */}
      <div className="print:hidden" style={{ background: '#DC2626' }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-2 text-white text-center">
          <span className="font-black text-sm md:text-base">2026年10月 カスハラ対策義務化まで残り6ヶ月</span>
          <span className="hidden sm:block text-red-200">|</span>
          <span className="font-bold text-sm md:text-base text-yellow-300">IT導入補助金で実質¥7,450/月〜導入可能</span>
          <a
            href="#it-hojo-section"
            className="ml-2 bg-white text-red-700 font-black text-xs px-3 py-1 rounded-full hover:bg-yellow-100 transition-colors shrink-0"
          >
            補助金の詳細を見る
          </a>
        </div>
      </div>

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
            {/* 緊急性バッジ */}
            <div className="text-center mb-3">
              <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-3 py-1 rounded-full">
                期間限定 年額プラン 2ヶ月分無料
              </span>
            </div>
            <h2 id="kaigo-plan-modal-title" className="text-lg font-bold mb-1 text-center">プランを選択</h2>
            <p className="text-sm text-white/50 mb-4 text-center">ご利用状況に合わせてお選びください</p>
            <div className="space-y-3">
              <div className="border border-white/20 rounded-xl p-4">
                <p className="font-bold text-white text-sm mb-1">個人プラン <span className="text-teal-400">¥2,980/月</span></p>
                <p className="text-xs text-white/50 mb-2">個人スタッフ・ヘルパー向け</p>
                <KomojuButton
                  planId="personal"
                  planLabel="個人プラン"
                  monthlyPrice={2980}
                  showAnnualToggle={true}
                  className="w-full bg-teal-600 text-white font-bold py-2.5 rounded-lg hover:bg-teal-700 disabled:opacity-50 text-sm"
                />
              </div>
              <div className="border-2 border-teal-600 rounded-xl p-4 bg-teal-500/10">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-white text-sm">事業所プラン <span className="text-teal-400">¥9,800/月</span></p>
                  <span className="text-xs bg-teal-600 text-white px-2 py-0.5 rounded-full">人気</span>
                </div>
                <p className="text-xs text-white/50 mb-2">事業所・施設単位での利用</p>
                <KomojuButton
                  planId="business"
                  planLabel="事業所プラン"
                  monthlyPrice={9800}
                  showAnnualToggle={true}
                  className="w-full bg-teal-600 text-white font-bold py-2.5 rounded-lg hover:bg-teal-700 disabled:opacity-50 text-sm"
                />
              </div>
              <div className="border-2 border-yellow-400 rounded-xl p-4 bg-yellow-500/10">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-white text-sm">施設BtoBプラン <span className="text-yellow-400">¥29,800/月</span></p>
                  <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold">補助金申請サポート付</span>
                </div>
                <p className="text-xs text-yellow-200 mb-1">IT導入補助金2026適用で実質¥5,960/月〜</p>
                <p className="text-xs text-white/50 mb-2">複数施設・法人一括・研修資料・規程テンプレ付</p>
                <KomojuButton
                  planId="btob"
                  planLabel="施設BtoBプラン"
                  monthlyPrice={29800}
                  showAnnualToggle={true}
                  className="w-full bg-yellow-500 text-black font-bold py-2.5 rounded-lg hover:bg-yellow-400 disabled:opacity-50 text-sm"
                />
              </div>
              <div className="border-2 border-blue-500 rounded-xl p-4 bg-blue-500/10">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-white text-sm">法人プラン <span className="text-blue-400">¥40,000/月</span></p>
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">IT補助金対応</span>
                </div>
                <p className="text-xs text-blue-300 mb-1">IT導入補助金適用で実質¥8,000/月〜</p>
                <p className="text-xs text-white/50 mb-2">複数事業所・法人一括契約向け</p>
                <a
                  href="https://x.com/levona_design"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 text-sm"
                >
                  Xにてお問い合わせ
                </a>
              </div>
            </div>
            {/* 信頼バッジ */}
            <div className="mt-4 flex items-center justify-center gap-3 text-xs text-white/60">
              <span>SSL暗号化</span>
              <span>|</span>
              <span>30日間返金保証</span>
              <span>|</span>
              <span>いつでも解約可</span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <p className="text-xs text-white/40 mb-2">クレジットカード以外の方はこちら</p>
              <button
                onClick={() => { setShowPayjp(false); setShowBankTransfer(true); }}
                className="text-sm text-teal-400 underline hover:text-teal-300 transition-colors min-h-[44px] px-2"
                aria-label="銀行振込で申し込むフォームを開く"
              >
                銀行振込で申し込む
              </button>
            </div>
          </div>
        </div>
      )}

      {showBankTransfer && (
        <BankTransferModal onClose={() => setShowBankTransfer(false)} />
      )}

      <PaywallModal
        open={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        onUpgrade={() => { setShowPaywallModal(false); setShowPayjp(true); }}
      />

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
        <span className="ml-2 text-xs font-normal">※未対応の場合、行政指導・監査リスクあり</span>
      </div>

      <StreakBanner />

      {/* 社会的証明セクション */}
      <section className="py-8 px-4 print:hidden" style={{ background: 'rgba(220,38,38,0.08)', borderBottom: '1px solid rgba(220,38,38,0.15)' }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs text-red-300 font-semibold mb-4 uppercase tracking-widest">カスハラの現状</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-red-400/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-red-400 mb-1">約8割</p>
              <p className="text-sm text-white/80 leading-snug">の介護職がカスハラ被害を経験</p>
              <p className="text-xs text-white/40 mt-2">出典: テレビ朝日調査</p>
            </div>
            <div className="bg-white/5 border border-orange-400/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-orange-400 mb-1">37.7%</p>
              <p className="text-sm text-white/80 leading-snug">のケアマネが過去1年でカスハラを経験</p>
              <p className="text-xs text-white/40 mt-2">出典: 日本介護支援専門員協会</p>
            </div>
            <div className="bg-red-700/20 border border-red-500/40 rounded-xl p-4 text-center">
              <p className="text-lg font-black text-red-300 mb-1">2026年10月1日</p>
              <p className="text-sm text-white/80 leading-snug">全業種でカスハラ対策が法的義務化</p>
              <p className="text-xs text-red-300 mt-2 font-semibold">未対応は行政指導リスクあり</p>
            </div>
          </div>
        </div>
      </section>

      {/* なぜ今すぐ必要か — 3カラム */}
      <section className="py-10 px-4 print:hidden" style={{ background: 'rgba(245,158,11,0.05)', borderBottom: '1px solid rgba(245,158,11,0.15)' }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs text-amber-500 font-bold uppercase tracking-widest mb-6">なぜ今すぐ必要か</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <p className="text-amber-800 font-black text-base mb-2">2026年10月 義務化</p>
              <p className="text-sm text-amber-900 leading-relaxed">改正労働施策総合推進法により、全規模の事業所でカスハラ対策が法的義務になります。未対応は行政指導・監査リスクが生じます。</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <p className="text-amber-800 font-black text-base mb-2">介護現場の実態</p>
              <p className="text-sm text-amber-900 leading-relaxed">カスハラ被害を受けた介護職員は82.4%（厚生労働省2024年調査）。現場の深刻な実態に、専門ツールで即対応できます。</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <p className="text-amber-800 font-black text-base mb-2">競合ゼロの専門AI</p>
              <p className="text-sm text-amber-900 leading-relaxed">介護カスハラに特化したAIツールは他にありません。介護保険法・運営基準を踏まえた対応文を即生成できるのは本サービスだけです。</p>
            </div>
          </div>
        </div>
      </section>

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
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm text-white/90">
              <span className="text-yellow-400">★</span>
              <span>4.8 / 5.0 評価</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm text-white/90">
              <span>1,500件+の施設で導入</span>
            </div>
            <div className="flex items-center gap-1.5 bg-green-500/20 backdrop-blur rounded-full px-4 py-1.5 text-sm text-green-300 font-medium">
              30日間返金保証
            </div>
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
          <div className="max-w-xs mx-auto mb-4"><UsageCounter /></div>
          <div className="mb-4"><TrustBadge /></div>
          <div className="max-w-xs mx-auto mb-4"><DeadlineCountdown /></div>
          <Link
            href="/tool"
            className="inline-block text-white font-bold text-lg md:text-xl px-8 md:px-10 py-4 md:py-5 rounded-2xl mb-4 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] w-full sm:w-auto min-h-[52px]"
            style={{ background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)', boxShadow: '0 0 25px rgba(13, 148, 136, 0.25), 0 4px 15px rgba(0,0,0,0.15)' }}
          >
            カスハラ対応文を今すぐ生成
          </Link>
          <p className="text-xs text-green-300 mt-2 font-semibold">
            東京都奨励金（最大40万円）で実質無料導入可能 ·
            <a href="https://www.tokyo-cusharaboushi.metro.tokyo.lg.jp/" target="_blank" rel="noopener noreferrer" className="underline ml-1">詳細はこちら</a>
          </p>
          <div className="mt-2 inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/50 rounded-xl px-4 py-2">
            <span className="text-orange-300 text-xs font-black">IT導入補助金2026</span>
            <span className="text-white/80 text-xs">最大450万円・補助率4/5</span>
            <span className="text-orange-400 text-xs font-bold">5/12締切</span>
          </div>
          <p className="text-xs opacity-60 mt-1">※現場経験者監修</p>
          {/* LINE友達追加CTA */}
          <div className="w-full max-w-2xl mx-auto my-5 rounded-xl overflow-hidden border border-[#06C755]/30 bg-[#06C755]/10">
            <a
              href="https://line.me/R/ti/p/%40462mlayk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 hover:bg-[#06C755]/20 transition-colors"
            >
              <div className="w-12 h-12 bg-[#06C755] rounded-xl flex items-center justify-center flex-shrink-0">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 5.92 2 10.72c0 2.88 1.44 5.44 3.72 7.12L5 21l3.36-1.76C9.44 19.72 10.68 20 12 20c5.52 0 10-3.92 10-8.72S17.52 2 12 2z"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <div className="font-bold text-white text-sm">LINEで無料相談・補助金試算</div>
                <div className="text-gray-300 text-xs mt-0.5">友達追加で補助金450万円の詳細を即座に案内</div>
              </div>
              <div className="bg-[#06C755] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0">
                友達追加
              </div>
            </a>
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm text-white/40">登録不要・クレジットカード不要</p>
            <button
              onClick={() => setShowPayjp(true)}
              aria-label="個人プランまたは事業所プランでフル利用するためのプラン選択モーダルを開く"
              className="text-sm text-teal-600 underline hover:text-teal-800 transition-colors"
            >
              個人¥2,980 / 事業所¥9,800 / 施設BtoB¥29,800でフル利用する →
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

          {/* 導入効果3点（数値あり） */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,margin:'32px auto 0',maxWidth:560}}>
            <div style={{textAlign:'center',padding:'16px 8px',background:'rgba(255,255,255,0.07)',borderRadius:12,border:'1px solid rgba(255,255,255,0.12)'}}>
              <div style={{fontSize:36,fontWeight:'bold',color:'#dc2626',lineHeight:1}}>90%</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.55)',marginTop:6,lineHeight:1.4}}>法的文書作成<br />時間を削減</div>
            </div>
            <div style={{textAlign:'center',padding:'16px 8px',background:'rgba(255,255,255,0.07)',borderRadius:12,border:'1px solid rgba(255,255,255,0.12)'}}>
              <div style={{fontSize:36,fontWeight:'bold',color:'#dc2626',lineHeight:1}}>3分</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.55)',marginTop:6,lineHeight:1.4}}>クレーム対応文書<br />を即生成</div>
            </div>
            <div style={{textAlign:'center',padding:'16px 8px',background:'rgba(255,255,255,0.07)',borderRadius:12,border:'1px solid rgba(255,255,255,0.12)'}}>
              <div style={{fontSize:36,fontWeight:'bold',color:'#dc2626',lineHeight:1}}>1/3</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.55)',marginTop:6,lineHeight:1.4}}>職員の対応負荷<br />を軽減</div>
            </div>
          </div>
        </div>
      </section>

      {/* BtoB料金プランセクション */}
      <section id="pricing" className="py-14 px-4 print:hidden" style={{background:'rgba(255,255,255,0.03)',borderTop:'1px solid rgba(255,255,255,0.08)'}}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span style={{background:'#dc2626',color:'#fff',padding:'6px 18px',borderRadius:4,fontWeight:'bold',fontSize:13,display:'inline-block',marginBottom:10}}>
              2026年10月1日 カスハラ対策義務化 まで残り約5ヶ月
            </span>
            <br />
            <span style={{background:'#1d4ed8',color:'#fff',padding:'6px 18px',borderRadius:4,fontWeight:'bold',fontSize:13,display:'inline-block',marginBottom:16}}>
              IT導入補助金2026 最大450万円対象予定
            </span>
            <h2 className="text-2xl font-bold text-white mb-2">料金プラン</h2>
            <p className="text-white/50 text-sm">補助金活用で実質負担を大幅に削減できます</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,maxWidth:640,margin:'0 auto'}}>
            <div style={{border:'2px solid rgba(255,255,255,0.15)',borderRadius:12,padding:24,textAlign:'center',background:'rgba(255,255,255,0.04)'}}>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.5)',marginBottom:8}}>個人・小規模施設</div>
              <div style={{fontSize:38,fontWeight:'bold',color:'#fff'}}>¥9,800<span style={{fontSize:14,fontWeight:'normal',color:'rgba(255,255,255,0.6)'}}>/月</span></div>
              <div style={{fontSize:12,color:'#94a3b8',marginBottom:20}}>（補助金後 実質¥2,450〜）</div>
              <button
                onClick={() => setShowPayjp(true)}
                aria-label="個人・小規模施設プランの詳細を確認する"
                style={{display:'block',width:'100%',background:'#3b82f6',color:'#fff',padding:'12px',borderRadius:8,fontWeight:'bold',border:'none',cursor:'pointer',fontSize:14}}
              >
                無料デモを試す
              </button>
            </div>
            <div style={{border:'2px solid #f59e0b',borderRadius:12,padding:24,textAlign:'center',position:'relative',background:'rgba(245,158,11,0.05)'}}>
              <div style={{position:'absolute',top:-14,left:'50%',transform:'translateX(-50%)',background:'#f59e0b',color:'#fff',padding:'4px 16px',borderRadius:20,fontSize:11,fontWeight:'bold',whiteSpace:'nowrap'}}>法人・施設チームに最適</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.5)',marginBottom:8}}>施設・法人プラン</div>
              <div style={{fontSize:38,fontWeight:'bold',color:'#fff'}}>¥29,800<span style={{fontSize:14,fontWeight:'normal',color:'rgba(255,255,255,0.6)'}}>/月</span></div>
              <div style={{fontSize:12,color:'#94a3b8',marginBottom:20}}>（補助金後 実質¥7,450〜）</div>
              <a
                href="https://lin.ee/462mlayk"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="施設・法人プランの30分無料商談を申し込む"
                style={{display:'block',background:'#f59e0b',color:'#fff',padding:'12px',borderRadius:8,textDecoration:'none',fontWeight:'bold',fontSize:14}}
              >
                30分無料商談を申し込む
              </a>
            </div>
          </div>
          <p className="text-xs text-white/30 text-center mt-4">※IT導入補助金の補助率・上限は公募回によって変わります。申請前に必ずご確認ください。</p>
        </div>
      </section>

      {/* 東京都奨励金バナー（拡充版） */}
      <section className="py-10 px-4 print:hidden" style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)' }}>
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-green-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-yellow-400 text-green-900 text-xs font-black px-2 py-0.5 rounded-full">公的支援制度</span>
                <span className="text-green-200 text-xs">先着2,000件・第3回申請受付中</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                東京都の奨励金40万円で
                <span className="text-yellow-300 ml-2">介護カスハラAIが実質無料で導入できます</span>
              </h2>
            </div>
          </div>

          {/* コスト試算ボックス */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 mb-5">
            <p className="text-green-100 text-sm font-bold mb-4">導入コストシミュレーション（事業所プラン）</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white/10 rounded-xl p-4 text-center border border-white/15">
                <p className="text-green-200 text-xs mb-1">月額料金</p>
                <p className="text-2xl font-black text-white">¥40,000<span className="text-sm font-normal">/月</span></p>
                <p className="text-green-300 text-xs mt-1">（税込 ¥44,000）</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center border border-white/15">
                <p className="text-green-200 text-xs mb-1">東京都カスハラ防止対策奨励金</p>
                <p className="text-2xl font-black text-yellow-300">最大¥400,000</p>
                <p className="text-green-300 text-xs mt-1">一度限り・一括支給</p>
              </div>
              <div className="bg-yellow-400/20 rounded-xl p-4 text-center border border-yellow-300/40">
                <p className="text-yellow-200 text-xs mb-1">初年度の実質コスト</p>
                <p className="text-2xl font-black text-yellow-300">実質マイナス</p>
                <p className="text-green-200 text-xs mt-1">¥480,000 - ¥400,000 = <strong className="text-yellow-300">実質¥80,000</strong></p>
              </div>
            </div>
            <div className="bg-green-900/40 border border-green-400/30 rounded-xl px-4 py-3 text-sm text-green-100">
              <span className="text-yellow-300 font-bold">計算式: </span>
              月額¥40,000 × 12ヶ月 = 年間¥480,000 &nbsp;→&nbsp;
              東京都奨励金（最大¥400,000）を差し引くと
              <strong className="text-yellow-300 ml-1">初年度実質負担¥80,000</strong>
            </div>
          </div>

          {/* 対象条件 */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 mb-5">
            <p className="text-green-100 text-sm font-bold mb-3">奨励金の対象要件</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: "OK", label: "従業員300人以下の都内中小企業・社会福祉法人" },
                { icon: "OK", label: "AIを活用したカスハラ対策システムの導入" },
                { icon: "OK", label: "GビズIDを取得していること（取得サポートあり）" },
                { icon: "OK", label: "東京都カスタマーハラスメント防止条例に基づく宣言" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-yellow-400 font-black text-sm mt-0.5 shrink-0">{item.icon}</span>
                  <p className="text-green-100 text-sm">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="text-green-300 text-xs mt-3">
              ※本サービスは東京都カスハラ防止対策推進事業の「AIを活用したシステムの導入」対象取組に該当する可能性があります。
              申請時は事前に東京都へご確認ください。
            </p>
          </div>

          {/* 申請サポート訴求 */}
          <div className="bg-white/10 backdrop-blur-sm border border-yellow-300/30 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-green-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <p className="text-white font-bold text-sm mb-2">奨励金申請のサポートも承ります</p>
                <div className="space-y-1.5">
                  {[
                    "申請書テンプレートを無料でご提供",
                    "GビズID取得のご支援",
                    "カスハラ対策規程の整備サポート",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-yellow-400 font-black text-xs shrink-0">→</span>
                      <p className="text-green-100 text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTAボタン */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://x.com/levona_design"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-yellow-400 text-green-900 font-black py-4 px-6 rounded-xl hover:bg-yellow-300 transition-colors text-base shadow-lg"
            >
              無料デモ + 補助金シミュレーション（30分）→
            </a>
            <a
              href="https://www.tokyo-cusharaboushi.metro.tokyo.lg.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-white/15 text-white font-bold py-4 px-6 rounded-xl hover:bg-white/25 transition-colors text-base border border-white/30"
            >
              奨励金の詳細を見る（東京都公式）→
            </a>
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
                <p className="text-sm text-red-900 leading-relaxed">{v}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-teal-500/10 border border-teal-200 rounded-xl p-6 text-center">
            <p className="text-teal-800 font-bold text-base mb-2">介護カスハラAIが、これら全てを解決します</p>
            <p className="text-sm text-teal-700">状況を入力するだけで、厚労省ガイドライン準拠の対応文・記録テンプレートが15秒で生成されます。</p>
            <Link
              href="/tool"
              className="inline-block mt-4 bg-teal-700 text-white font-bold px-6 py-3 rounded-xl hover:bg-teal-800 transition-colors text-sm"
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
                <p className="text-green-700 text-xs">介護現場のハラスメント対策マニュアル準拠</p>
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
                <p className="font-bold text-teal-900 text-xs mb-1">{f.name}</p>
                <p className="text-teal-800 text-xs">{f.detail}</p>
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

      {/* IT導入補助金セクション */}
      <section id="it-hojo-section" className="py-16 px-4 print:hidden" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #1d4ed8 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-block bg-yellow-400 text-blue-900 text-xs font-black px-3 py-1 rounded-full mb-3">公的支援制度</span>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
              IT導入補助金（AI導入補助金2026）対象予定
            </h2>
            <p className="text-blue-200 text-sm">補助金を活用することで、大幅なコスト削減が可能です</p>
          </div>

          {/* 料金試算ボックス */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <div className="bg-white/10 rounded-xl p-4 text-center border border-white/15">
                <p className="text-blue-200 text-xs mb-2">通常価格</p>
                <p className="text-3xl font-black text-white">¥29,800<span className="text-sm font-normal">/月</span></p>
                <p className="text-blue-300 text-xs mt-1">法人・複数事業所向け</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center border border-white/15">
                <p className="text-blue-200 text-xs mb-2">補助率</p>
                <p className="text-3xl font-black text-yellow-300">最大3/4</p>
                <p className="text-blue-300 text-xs mt-1">IT導入補助金2026</p>
              </div>
              <div className="bg-yellow-400/20 rounded-xl p-4 text-center border border-yellow-300/40">
                <p className="text-yellow-200 text-xs mb-2">実質負担額</p>
                <p className="text-3xl font-black text-yellow-300">¥7,450<span className="text-lg">/月〜</span></p>
                <p className="text-yellow-100 text-xs mt-1">補助金適用後の概算</p>
              </div>
            </div>
            <div className="bg-blue-900/40 border border-blue-400/30 rounded-xl px-4 py-3 text-sm text-blue-100 mb-4">
              <span className="text-yellow-300 font-bold">計算式: </span>
              ¥29,800/月 × 3/4補助 = 補助額¥22,350/月
              <strong className="text-yellow-300 ml-2">実質負担¥7,450/月〜</strong>
            </div>

            {/* 締切・サポート訴求 */}
            <div className="bg-red-700/30 border border-red-400/40 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-300 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <div>
                  <p className="text-red-200 font-bold text-sm">補助金申請締切: 2026年5月12日（火）</p>
                  <p className="text-red-300 text-xs mt-0.5">申請締切後は通常価格でのご利用となります。お早めにご検討ください。</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-xl p-4">
              <p className="text-white font-bold text-sm mb-2">申請サポートを無料でご提供します</p>
              <div className="space-y-1.5">
                {[
                  "IT導入補助金の申請書テンプレートを無料提供",
                  "gBizID取得のご支援",
                  "SECURITY ACTION宣言のサポート",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-yellow-400 font-black text-xs shrink-0">→</span>
                    <p className="text-blue-100 text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://x.com/levona_design"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-yellow-400 text-blue-900 font-black py-4 px-6 rounded-xl hover:bg-yellow-300 transition-colors text-base shadow-lg"
            >
              無料デモ + 補助金シミュレーション（30分）→
            </a>
            <a
              href="https://it-shien.smrj.go.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-white/15 text-white font-bold py-4 px-6 rounded-xl hover:bg-white/25 transition-colors text-base border border-white/30"
            >
              IT導入補助金 公式サイト →
            </a>
          </div>
          <p className="text-xs text-blue-300 text-center mt-4">※補助率・補助額は申請枠・審査状況により異なります。受給を保証するものではありません。</p>
        </div>
      </section>

      {/* IT導入補助金2026 — 補助金訴求セクション（料金表直前） */}
      <section className="py-12 px-4 print:hidden">
        <div className="max-w-3xl mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 my-12">
            <div className="text-center mb-6">
              <span className="inline-block bg-green-600 text-white text-xs font-black px-3 py-1 rounded-full mb-3">公的補助金活用で大幅コスト削減</span>
              <h2 className="text-xl font-black text-green-900 mb-1">IT導入補助金2026で実質負担を大幅削減</h2>
              <p className="text-sm text-green-700">デジタル化・AI導入補助金2026 — 補助率最大4/5・最大450万円</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-green-200 rounded-xl p-4 text-center">
                <p className="text-xs text-green-600 font-semibold mb-1">通常価格</p>
                <p className="text-2xl font-black text-green-900">¥29,800<span className="text-sm font-normal">/月</span></p>
                <p className="text-xs text-green-700 mt-1">× 12ヶ月 = ¥357,600/年</p>
              </div>
              <div className="bg-white border border-green-200 rounded-xl p-4 text-center">
                <p className="text-xs text-green-600 font-semibold mb-1">補助率1/2適用</p>
                <p className="text-2xl font-black text-green-700">¥178,800<span className="text-sm font-normal">/年</span></p>
                <p className="text-xs text-green-600 mt-1">実質負担額（概算）</p>
              </div>
              <div className="bg-green-100 border border-green-400 rounded-xl p-4 text-center">
                <p className="text-xs text-green-700 font-semibold mb-1">補助率4/5適用</p>
                <p className="text-2xl font-black text-green-800">¥71,520<span className="text-sm font-normal">/年</span></p>
                <p className="text-xs text-green-700 mt-1 font-bold">最大補助率適用時</p>
              </div>
            </div>
            <div className="bg-white border border-green-200 rounded-xl p-4 text-sm text-green-800 space-y-1 mb-5">
              <p>※デジタル化・AI導入補助金2026の申請サポートを承ります</p>
              <p>※ご導入の際に補助金申請の詳細をご案内いたします</p>
              <p>※補助率・補助額は申請枠・審査状況により異なります。受給を保証するものではありません。</p>
            </div>
            <div className="text-center">
              <a
                href="https://x.com/levona_design"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-green-700 text-white font-black px-8 py-3 rounded-xl hover:bg-green-800 transition-colors text-sm"
              >
                補助金申請サポートについて問い合わせる →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white/5 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-3">料金プラン</h2>
          <p className="text-center text-white/50 text-sm mb-3">利用シーンに合わせた3プラン</p>
          <div className="flex justify-center mb-8">
            <span className="inline-block bg-blue-600 text-white text-xs font-black px-3 py-1.5 rounded-full tracking-wide">IT導入補助金2026対応 — 補助率2/3・最大450万円</span>
          </div>
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
            <div className="bg-white/80 backdrop-blur-md border-2 border-blue-500/60 rounded-2xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">IT導入補助金対応</div>
              <p className="text-blue-300 font-bold mb-2">法人プラン</p>
              <p className="text-4xl font-black text-white mb-1">¥40,000<span className="text-base font-normal text-white/50">/月</span></p>
              <p className="text-blue-400 text-xs font-bold mb-1">IT導入補助金適用で実質¥13,000/月</p>
              <p className="text-white/40 text-sm mb-6">複数事業所・法人一括契約</p>
              <ul className="space-y-3 text-sm text-white/80 mb-8">
                {["事業所プラン全機能", "複数事業所の一括管理", "スタッフ研修用マニュアル生成", "優先サポート・訪問研修相談可", "IT導入補助金申請サポート"].map((f) => (
                  <li key={f} className="flex items-center gap-2"><span className="text-green-500 font-bold"></span>{f}</li>
                ))}
              </ul>
              <a
                href="https://x.com/levona_design"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Xにてお問い合わせ →
              </a>
            </div>
          </div>
          {/* 銀行振込プラン案内 */}
          <div className="mt-6 bg-white/5 border border-white/20 rounded-2xl p-5 text-center">
            <p className="text-white/70 text-sm font-bold mb-1">クレジットカード不要の銀行振込プラン</p>
            <p className="text-white/50 text-xs mb-3">請求書発行対応・ご入金確認後翌営業日よりご利用開始</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-3">
              <div className="text-center">
                <span className="text-xs text-white/40 block">個人プラン</span>
                <span className="text-lg font-black text-white">¥2,980<span className="text-sm font-normal text-white/50">/月</span></span>
              </div>
              <div className="hidden sm:block text-white/20">|</div>
              <div className="text-center">
                <span className="text-xs text-white/40 block">事業所プラン</span>
                <span className="text-lg font-black text-teal-300">¥9,800<span className="text-sm font-normal text-white/50">/月</span></span>
              </div>
            </div>
            <button
              onClick={() => setShowBankTransfer(true)}
              aria-label="銀行振込プランの申し込みフォームを開く"
              className="inline-block bg-teal-700 hover:bg-teal-600 text-white font-bold py-3 px-8 rounded-xl text-sm transition-colors min-h-[44px]"
            >
              銀行振込で申し込む（請求書発行可）
            </button>
            <p className="text-xs text-white/30 mt-2">法人・施設契約の場合は事業所プランが多く選ばれています</p>
          </div>

          {/* 奨励金活用シミュレーション */}
          <div className="mt-10 bg-green-900/30 border border-green-600/50 rounded-2xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <svg className="w-6 h-6 text-green-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div>
                <p className="font-bold text-green-300">東京都奨励金活用シミュレーション</p>
                <p className="text-xs text-green-400 mt-0.5">従業員300名以下の都内中小企業・社会福祉法人対象</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-xs text-white/50 mb-1">東京都奨励金（最大）</p>
                <p className="text-2xl font-black text-green-400">400,000円</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-xs text-white/50 mb-1">法人プラン年間費用</p>
                <p className="text-2xl font-black text-white">480,000円</p>
                <p className="text-xs text-white/40">¥40,000 × 12ヶ月</p>
              </div>
              <div className="bg-green-600/20 border border-green-500/50 rounded-xl p-4 text-center">
                <p className="text-xs text-green-300 mb-1">実質コスト</p>
                <p className="text-2xl font-black text-green-300">実質無料</p>
                <p className="text-xs text-green-400">さらに3年以上利用可能</p>
              </div>
            </div>
            <p className="text-xs text-white/40 mt-3 text-center">
              ※奨励金の受給には申請審査があります。受給を保証するものではありません。詳細は
              <a href="https://www.tokyo-cusharaboushi.metro.tokyo.lg.jp/" target="_blank" rel="noopener noreferrer" className="text-green-400 underline ml-1">東京都公式サイト</a>
              をご確認ください。
            </p>
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
                  { "@type": "Question", name: "東京都の奨励金は本当に使えますか？", acceptedAnswer: { "@type": "Answer", text: "「東京都カスハラ防止対策助成金」の対象サービスとして活用いただける可能性があります。従業員300名以下の都内中小企業・社会福祉法人が対象で、最大40万円の補助を受けられます（申請審査あり）。詳細は東京都公式サイトをご確認ください。" } },
                  { "@type": "Question", name: "奨励金申請の手続きはどうすればいいですか？", acceptedAnswer: { "@type": "Answer", text: "概ね①Gビズ IDの取得、②カスハラ対策マニュアル作成（本AIが支援）、③本サービスの導入証明書の取得、④申請書提出の流れで進みます。詳細な手順・最新情報は必ず東京都公式サイト（東京都カスハラ防止対策奨励金）でご確認ください。" } },
                  { "@type": "Question", name: "補助金は使えますか？", acceptedAnswer: { "@type": "Answer", text: "はい。デジタル化・AI導入補助金2026（補助率最大4/5）の対象ツールとして申請中です。補助金適用で年間コストを大幅に削減できます。ご契約時に申請方法をご案内いたします。" } },
                  { "@type": "Question", name: "2026年10月の義務化にどう対応できますか？", acceptedAnswer: { "@type": "Answer", text: "はい。介護カスハラAIは、改正労働施策総合推進法が求める「カスハラ対策マニュアル整備・記録保管・対応文書作成」を全面サポートします。義務化チェックリストの全必須項目に対応した文書を即座に生成できます。" } },
                  { "@type": "Question", name: "東京都の独自補助金は使えますか？", acceptedAnswer: { "@type": "Answer", text: "東京都が令和8年度（2026年）夏頃に介護事業所向け補助金を開始予定です。開始次第、対象ツールとして案内いたします。" } },
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
              { q: "東京都の奨励金は本当に使えますか？", a: "「東京都カスハラ防止対策助成金」の対象サービスとして活用いただける可能性があります。従業員300名以下の都内中小企業・社会福祉法人が対象で、最大40万円の補助を受けられます（申請審査あり）。申請にはカスハラ対策マニュアルの作成が必要ですが、本AIが支援いたします。詳細・最新情報は東京都公式サイトをご確認ください。" },
              { q: "奨励金申請の手続きはどうすればいいですか？", a: "概ね①Gビズ IDの取得、②カスハラ対策マニュアル作成（本AIが支援）、③本サービスの導入証明書の取得、④申請書提出の流れで進みます。詳細な手順・最新情報は必ず東京都公式サイト（東京都カスハラ防止対策奨励金）でご確認ください。" },
              { q: "補助金は使えますか？", a: "はい。デジタル化・AI導入補助金2026（補助率最大4/5）の対象ツールとして申請中です。補助金適用で年間コストを大幅に削減できます。ご契約時に申請方法をご案内いたします。" },
              { q: "東京都の独自補助金は使えますか？", a: "東京都が令和8年度（2026年）夏頃に介護事業所向け補助金を開始予定です。開始次第、対象ツールとして案内いたします。現時点では東京都カスハラ防止対策奨励金（最大40万円）をご活用いただけます。" },
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

      <CareRoiCalculator onTrialClick={() => setShowTrialModal(true)} />

      {/* シェアセクション */}
      <section className="py-6 px-6 text-center">
        <ShareButtons url="https://kaigo-custharass-ai.vercel.app" text="介護施設のカスハラ対応がAIで自動化できる。証拠記録から対応文まで。" hashtags="介護カスハラAI" />
      </section>

      {/* A8アフィリエイト */}
      <div className="max-w-2xl mx-auto px-4 pb-6">
        <div style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.2)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>※ 広告・PR掲載</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#5eead4", marginBottom: 4 }}>ストレスや職場の悩みを専門家に相談したい方へ</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>Kimochi（キモチ）— 心理カウンセラーによる個別相談</p>
          <a href="https://px.a8.net/svt/ejp?a8mat=4B3GYE+152XIQ+5OI8+5YJRM" target="_blank" rel="noopener noreferrer sponsored" style={{ display: "inline-block", padding: "10px 24px", background: "linear-gradient(135deg,#14b8a6,#0d9488)", color: "#fff", fontSize: 13, fontWeight: 700, borderRadius: 8, textDecoration: "none" }}>Kimochiで無料相談 →</a>
        </div>
      </div>

      <CrossSell currentService="介護カスハラAI" />

      {/* FAQセクション */}
      <section aria-label="よくある質問" className="py-12 px-4 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">よくある質問</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="border border-white/20 rounded-lg p-4 cursor-pointer">
              <summary className="font-semibold">{faq.q}</summary>
              <p className="mt-3 text-white/60">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* フッター前デモ申し込みCTA (BtoB最優先) */}
      <section style={{ background: "linear-gradient(135deg, rgba(13,148,136,0.15), rgba(15,118,110,0.1))", borderTop: "1px solid rgba(13,148,136,0.2)", padding: "40px 16px", textAlign: "center" }}>
        <div style={{ maxWidth: "560px", margin: "0 auto" }}>
          <p style={{ color: "#5EEAD4", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>BtoB導入相談</p>
          <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: "900", marginBottom: "12px", lineHeight: 1.4 }}>
            無料デモを申し込む（30分）
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "14px", marginBottom: "8px" }}>
            施設ご担当者様・管理者様向けにオンラインデモを実施しています。
          </p>
          <p style={{ color: "#FDE68A", fontSize: "13px", fontWeight: "bold", marginBottom: "24px" }}>
            IT補助金で実質0円から導入可能 ・ 2026年義務化に完全対応
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
            <a
              href="https://lin.ee/462mlayk"
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: "linear-gradient(135deg, #0D9488, #0F766E)", color: "#fff", fontWeight: "bold", fontSize: "16px", padding: "16px 32px", borderRadius: "14px", textDecoration: "none", minHeight: "52px", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 0 24px rgba(13,148,136,0.35)" }}
              aria-label="LINEで無料デモを申し込む"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.365 9.89c.50 0 .903.402.903.9s-.403.9-.903.9h-2.25v1.35h2.25c.50 0 .903.403.903.9 0 .498-.403.9-.903.9h-3.15a.9.9 0 01-.9-.9v-5.4c0-.498.403-.9.9-.9h3.15zm-10.578 0a.9.9 0 01.9.9v5.4a.9.9 0 01-.9.9.9.9 0 01-.9-.9v-5.4c0-.498.403-.9.9-.9zm-2.588 0c.50 0 .9.402.9.9v3.37l2.48-3.817a.9.9 0 011.526.96l-.02.03v5.357a.9.9 0 01-1.8 0v-3.37l-2.48 3.817a.9.9 0 01-1.526-.96l.02-.03V10.79a.9.9 0 01.9-.9zM12 2C6.477 2 2 5.942 2 10.786c0 3.354 2.122 6.29 5.318 7.966L6.4 21.6a.5.5 0 00.667.653l4.2-2.1c.236.02.476.033.733.033 5.523 0 10-3.942 10-8.4C22 5.942 17.523 2 12 2z"/></svg>
              LINEで無料デモを申し込む
            </a>
            <button
              onClick={() => setShowPayjp(true)}
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", fontSize: "14px", padding: "12px 24px", borderRadius: "10px", cursor: "pointer", minHeight: "44px" }}
              aria-label="プラン・価格を確認する"
            >
              プラン・価格を確認する
            </button>
          </div>
          <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            {["SSL/TLS暗号化", "個人情報保護方針あり", "特定商取引法に基づく表記あり", "30日間返金保証", "IT導入補助金対象予定"].map(badge => (
              <span key={badge} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)", fontSize: "11px", padding: "4px 10px", borderRadius: "100px" }}>
                {badge}
              </span>
            ))}
          </div>
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "介護施設でのカスタマーハラスメントの事例は？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "暴言・暴力・不当要求・SNS誹謗中傷・長時間拘束などが代表例です。2024年の調査では介護職員の7割が経験しています。AIが事例別の対応文と証拠記録テンプレートを生成します。"
                }
              },
              {
                "@type": "Question",
                "name": "カスハラを受けた介護職員が取るべき手順は？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "①その場から離れる②記録する③管理者に報告④チームで対応方針を統一の4ステップです。AIが報告書・対応文・証拠記録を自動生成します。"
                }
              },
              {
                "@type": "Question",
                "name": "介護施設がカスハラ対策で準備すべき書類は？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "カスハラ対応マニュアル・記録用紙・警告書テンプレート・出入り禁止通知書などが必要です。AIがこれらの書類を即時生成します。"
                }
              }
            ]
          })
        }}
      />
      <AdBanner slot="" />
      <div className="text-center py-6">
        <a
          href={`https://x.com/intent/tweet?text=${encodeURIComponent('介護施設のカスハラ対応がAIで自動化できる。証拠記録から対応文まで。')}&url=${encodeURIComponent('https://kaigo-custharass-ai.vercel.app')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.622 5.906-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <span>Xでシェアする</span>
        </a>
      </div>
    </main>
    <TrialModal isOpen={showTrialModal} onClose={() => setShowTrialModal(false)} />

    {/* FloatingCTA: 50%スクロール後に右下表示 */}
    {showFloatingCta && (
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "16px",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "8px",
          animation: "slideInUp 0.4s ease-out",
        }}
        aria-label="フローティングCTA"
      >
        <button
          onClick={() => setShowFloatingCta(false)}
          aria-label="フローティングCTAを閉じる"
          style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.5)", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", fontSize: "12px", alignSelf: "flex-end" }}
        >
          x
        </button>
        <a
          href="https://lin.ee/462mlayk"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: "#06c755",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "14px",
            padding: "12px 20px",
            borderRadius: 50,
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            textDecoration: "none",
            minHeight: "44px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            whiteSpace: "nowrap",
          }}
          aria-label="LINEで無料相談する"
        >
          LINE相談（無料）
        </a>
        <a
          href="#pricing"
          style={{
            background: "#dc2626",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "14px",
            padding: "12px 20px",
            borderRadius: 50,
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            textDecoration: "none",
            minHeight: "44px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            whiteSpace: "nowrap",
          }}
          aria-label="料金プランを確認する"
        >
          料金を確認
        </a>
      </div>
    )}

    {/* 出口インテントポップアップ */}
    {showExitIntent && (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          zIndex: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-intent-title"
      >
        <div
          style={{
            background: "linear-gradient(135deg, #0B1E30, #0D2A3F)",
            border: "1px solid rgba(13,148,136,0.4)",
            borderRadius: "20px",
            padding: "32px 24px",
            maxWidth: "380px",
            width: "100%",
            boxShadow: "0 0 60px rgba(13,148,136,0.2), 0 20px 40px rgba(0,0,0,0.4)",
            position: "relative",
            textAlign: "center",
          }}
        >
          <button
            onClick={() => setShowExitIntent(false)}
            aria-label="ポップアップを閉じる"
            style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(255,255,255,0.08)", border: "none", color: "rgba(255,255,255,0.5)", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            x
          </button>
          <div style={{ background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "12px", padding: "8px 16px", display: "inline-block", marginBottom: "16px" }}>
            <span style={{ color: "#FCA5A5", fontSize: "12px", fontWeight: "bold" }}>2026年10月 義務化まであと少し</span>
          </div>
          <h2 id="exit-intent-title" style={{ color: "#fff", fontSize: "20px", fontWeight: "900", marginBottom: "12px", lineHeight: 1.4 }}>
            まだ迷ってますか？<br />まず無料で試してみてください
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", marginBottom: "24px", lineHeight: 1.6 }}>
            カスハラ対応文の生成は登録不要・月3回まで完全無料。<br />
            義務化対応の最初の一歩を今日踏み出してください。
          </p>
          <a
            href="/tool"
            style={{
              display: "block",
              background: "linear-gradient(135deg, #0D9488, #0F766E)",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "16px",
              padding: "16px 24px",
              borderRadius: "12px",
              textDecoration: "none",
              marginBottom: "12px",
              boxShadow: "0 0 24px rgba(13,148,136,0.4)",
            }}
            aria-label="無料でカスハラ対応文を生成する"
          >
            無料で対応文を生成する
          </a>
          <a
            href="https://lin.ee/462mlayk"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              background: "rgba(34,197,94,0.15)",
              border: "1px solid rgba(34,197,94,0.3)",
              color: "#86EFAC",
              fontWeight: "bold",
              fontSize: "14px",
              padding: "12px 24px",
              borderRadius: "12px",
              textDecoration: "none",
              marginBottom: "12px",
            }}
            aria-label="LINE公式アカウントで相談する"
          >
            LINE公式で無料相談する (@462mlayk)
          </a>
          <button
            onClick={() => setShowExitIntent(false)}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: "12px", cursor: "pointer" }}
            aria-label="閉じてページに戻る"
          >
            今は見ない
          </button>
        </div>
      </div>
    )}
    </>
  );
}
