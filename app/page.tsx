"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import PayjpModal from "@/components/PayjpModal";

const PAYJP_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYJP_PUBLIC_KEY ?? "";

const CARE_CASES = [
  {
    icon: "😤",
    name: "暴言・威圧",
    examples: ["「殺すぞ」「首にしろ」等の暴言", "大声で怒鳴り続ける", "他スタッフの悪口を繰り返す"],
    pain: "録音・証拠化と毅然とした対応文が必要。",
  },
  {
    icon: "📞",
    name: "過剰な電話・要求",
    examples: ["1日何十回も電話してくる", "対応時間外の深夜連絡", "「すぐ来い」の無理な要求"],
    pain: "境界線の設定と記録管理が重要。",
  },
  {
    icon: "💴",
    name: "金品・サービス要求",
    examples: ["規定外のサービスを要求", "「もっとやれ」の過剰要求", "返金・賠償の不当要求"],
    pain: "契約範囲を明確にした毅然対応が必要。",
  },
  {
    icon: "👨‍👩‍👧",
    name: "家族からの過剰要求",
    examples: ["「訴える」などの法的脅迫", "業務妨害に至る繰り返しの要求", "同一要求の際限ない繰り返し"],
    pain: "記録の蓄積と段階的対応が有効。",
  },
  {
    icon: "🏛",
    name: "行政・苦情申し立て",
    examples: ["市区町村への苦情申立", "国保連への申立て脅迫", "監査を匂わせる脅迫"],
    pain: "事実確認と適切な記録・報告が必要。",
  },
  {
    icon: "⚖",
    name: "法的措置の示唆",
    examples: ["「弁護士に相談する」", "「裁判所に訴える」", "内容証明郵便を送りつける"],
    pain: "法的根拠に基づく毅然対応文が必要。",
  },
];

export default function KaigoLP() {
  const [showPayjp, setShowPayjp] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date("2026-10-01");
    const diff = Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    setDaysLeft(Math.max(0, diff));
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {showPayjp && (
        <PayjpModal
          publicKey={PAYJP_PUBLIC_KEY}
          planLabel="介護事業所プラン ¥9,800/月"
          plan="standard"
          onSuccess={() => { setShowPayjp(false); window.location.href = "/success"; }}
          onClose={() => setShowPayjp(false)}
        />
      )}

      <nav className="border-b border-gray-100 px-6 py-4 sticky top-0 bg-white/95 backdrop-blur z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-bold text-gray-900">🏥 介護カスハラAI</span>
          <Link
            href="/tool"
            className="bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            無料で試す（3回）
          </Link>
        </div>
      </nav>

      <div className="bg-gray-100 text-gray-600 text-center text-xs py-1.5 px-4">
        ⚠️ 本サービスはAIによる参考情報の提供です。法的対応・訴訟については弁護士・社会保険労務士にご相談ください。
      </div>
      <div className="bg-teal-700 text-white text-center text-sm font-semibold py-2.5 px-4">
        🚨 介護運営基準改正・カスハラ体制整備が義務化（2026年10月1日施行）
        {daysLeft !== null && daysLeft > 0 && <strong> — あと{daysLeft}日</strong>}
      </div>

      <section className="max-w-4xl mx-auto px-4 py-10 md:py-20 text-center overflow-x-hidden">
        <div className="inline-block bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          介護事業所・デイサービス・ヘルパー事業所 向け
        </div>
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          度を超えた言動・要求から、<br />
          <span className="text-teal-600">スタッフを守る対応文が15秒で作れます。</span>
        </h1>
        <p className="text-base md:text-lg text-gray-500 mb-4 max-w-2xl mx-auto">
          暴言・過剰要求・脅迫・深夜電話——介護現場特有の困難なケースに特化したAIが、
          厚労省ガイドラインを参考にした対応文・断り文・証拠記録テンプレートを即生成します。
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-6 text-sm">
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
            <span className="text-teal-600 font-bold">介護特化</span>
            <span className="text-gray-600 text-xs">介護・福祉用語・法令準拠</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
            <span className="text-teal-600 font-bold">証拠記録</span>
            <span className="text-gray-600 text-xs">カスハラ記録テンプレート生成</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
            <span className="text-teal-600 font-bold">運営基準対応</span>
            <span className="text-gray-600 text-xs">2026年10月義務化に先行対応</span>
          </div>
        </div>
        <Link
          href="/tool"
          className="inline-block bg-teal-600 text-white font-bold text-lg md:text-xl px-8 md:px-10 py-4 md:py-5 rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-100 mb-4 transition-colors w-full sm:w-auto"
        >
          無料でカスハラ対応文を3回試す →
        </Link>
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm text-gray-400">登録不要・クレジットカード不要</p>
          <button
            onClick={() => setShowPayjp(true)}
            className="text-sm text-teal-600 underline hover:text-teal-800 transition-colors"
          >
            事業所プラン（¥9,800/月）でフル利用する →
          </button>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-3">介護現場のカスハラは「特殊」です</h2>
          <p className="text-center text-gray-500 text-sm mb-10">一般企業向けのクレーム対応では対処できない、介護特有の問題があります</p>
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-8 text-sm text-teal-800">
            ✅ <strong>正当なご意見・改善要望はカスハラではありません。</strong>本ツールは、利用者・ご家族の権利を守りながら、業務妨害・脅迫・暴言など「度を超えた行為」から事業所とスタッフを守るためのものです。
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {CARE_CASES.map((c) => (
              <div key={c.name} className="border border-gray-200 rounded-xl p-5 bg-white">
                <div className="text-2xl mb-2">{c.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{c.name}</h3>
                <p className="text-xs text-teal-600 font-medium mb-3">{c.pain}</p>
                <ul className="space-y-1">
                  {c.examples.map((e) => (
                    <li key={e} className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="text-gray-300">▶</span>{e}
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
          <p className="text-center text-gray-500 text-sm mb-10">介護・福祉の法令・ガイドラインを踏まえた対応文を即生成</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                icon: "📝",
                title: "カスハラ対応文の即生成",
                desc: "状況・相手・深刻度を入力するだけ。厚労省ガイドライン準拠の毅然とした対応文が15秒で生成されます。",
              },
              {
                icon: "📋",
                title: "カスハラ証拠記録テンプレート",
                desc: "日時・場所・発言内容・対応経緯を整理した記録テンプレートを生成。行政への報告や訴訟対応に備えた証拠管理ができます。",
              },
              {
                icon: "🛡",
                title: "不当要求の断り文",
                desc: "「契約外のサービスを要求」「スタッフの交代を執拗に要求」への明確な断り文。感情的にならず毅然と断れます。",
              },
              {
                icon: "📞",
                title: "過剰な電話への対応文",
                desc: "「1日何十回も電話してくる」への連絡ルール設定文・通知書テンプレートを生成。境界線を明確に設定できます。",
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-3">料金プラン</h2>
          <p className="text-center text-gray-500 text-sm mb-10">介護事業所の規模に合わせた2プラン</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-2 border-gray-200 rounded-2xl p-8 bg-white">
              <p className="text-gray-500 font-bold mb-2">スタータープラン</p>
              <p className="text-4xl font-black text-gray-900 mb-1">¥9,800<span className="text-base font-normal text-gray-500">/月</span></p>
              <p className="text-gray-400 text-sm mb-6">1事業所向け</p>
              <ul className="space-y-3 text-sm text-gray-700 mb-8">
                {["カスハラ対応文 月100件生成", "証拠記録テンプレート", "介護特化プロンプト対応", "いつでも解約可能"].map((f) => (
                  <li key={f} className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span>{f}</li>
                ))}
              </ul>
              <button
                onClick={() => setShowPayjp(true)}
                className="w-full border-2 border-teal-600 text-teal-600 font-bold py-3 rounded-xl hover:bg-teal-50 transition-colors"
              >
                申し込む
              </button>
            </div>
            <div className="border-2 border-teal-600 rounded-2xl p-8 bg-teal-50 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-xs font-bold px-4 py-1 rounded-full">複数事業所向け</div>
              <p className="text-teal-700 font-bold mb-2">チェーンプラン</p>
              <p className="text-4xl font-black text-gray-900 mb-1">要相談</p>
              <p className="text-gray-400 text-sm mb-6">複数事業所・法人一括契約</p>
              <ul className="space-y-3 text-sm text-gray-700 mb-8">
                {["スタータープラン全機能", "複数事業所の一括管理", "スタッフ研修用マニュアル生成", "優先サポート・訪問研修相談可"].map((f) => (
                  <li key={f} className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span>{f}</li>
                ))}
              </ul>
              <a
                href="https://x.com/levona_design"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition-colors"
              >
                Xにてお問い合わせ →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-teal-700 py-16 text-center px-4 text-white overflow-x-hidden">
        <h2 className="text-xl md:text-2xl font-bold mb-3">介護スタッフを、カスハラから守りましょう</h2>
        <p className="text-teal-200 text-sm mb-8">15秒で対応文生成。毅然とした対応で事業所と従業員を守る。</p>
        <Link
          href="/tool"
          className="inline-block bg-white text-teal-700 font-bold text-lg px-8 py-4 rounded-xl hover:bg-teal-50 shadow-lg transition-colors mb-3 w-full sm:w-auto"
        >
          無料で3回試す（登録不要）→
        </Link>
        <div>
          <button
            onClick={() => setShowPayjp(true)}
            className="text-teal-200 text-sm underline hover:text-white transition-colors"
          >
            事業所プラン（¥9,800/月）でフル利用する →
          </button>
        </div>
      </section>

      <footer className="border-t py-6 text-center text-xs text-gray-400">
        <div className="space-x-4 mb-2">
          <Link href="/legal" className="hover:underline">特定商取引法に基づく表記</Link>
          <Link href="/privacy" className="hover:underline">プライバシーポリシー</Link>
        </div>
        <p>介護カスハラAI — ポッコリラボ</p>
        <p className="mt-1 text-gray-300">本AIの出力は参考情報です。実際の対応は管理者・法的専門家にご相談ください。</p>
      </footer>
    </main>
  );
}
