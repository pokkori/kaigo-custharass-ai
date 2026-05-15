import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IT導入補助金2026で介護カスハラAIを無料導入｜介護カスハラAI",
  description: "IT導入補助金2026（最大450万円・補助率最大4/5）で介護カスハラAIを実質無料で導入できます。2026年10月義務化前に体制整備を。",
};

export default function SubsidiesPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="bg-teal-700 text-white py-4 px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">介護カスハラAI</Link>
          <a href="tel:090-6093-5290" className="text-sm bg-white text-teal-700 font-bold px-4 py-2 rounded-lg">
            090-6093-5290
          </a>
        </div>
      </header>

      {/* ヒーロー */}
      <section className="bg-teal-700 text-white py-12 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block bg-yellow-400 text-teal-900 text-sm font-black px-4 py-1 rounded-full mb-4">
            2026年10月 カスハラ対策 義務化
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-4 leading-tight">
            IT導入補助金2026で<br />介護カスハラAIを<br className="sm:hidden" />
            <span className="text-yellow-300">実質無料導入</span>
          </h1>
          <p className="text-teal-100 text-base mb-6">
            最大450万円・補助率最大4/5が適用可能。<br />
            月額¥29,800が実質<strong className="text-yellow-300">¥5,960/月</strong>に。
          </p>
          <a
            href="tel:090-6093-5290"
            className="inline-block bg-yellow-400 text-teal-900 font-black text-lg px-8 py-4 rounded-xl shadow-lg hover:bg-yellow-300 transition-colors"
          >
            補助金の使い方を無料で相談する<br />
            <span className="text-sm font-normal">090-6093-5290（平日9〜18時）</span>
          </a>
        </div>
      </section>

      {/* 補助金概要 */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-black text-gray-900 mb-6 text-center">IT導入補助金2026 概要</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 border border-gray-200 text-center shadow-sm">
              <div className="text-3xl font-black text-teal-600 mb-1">450万円</div>
              <div className="text-sm text-gray-600">補助上限額</div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200 text-center shadow-sm">
              <div className="text-3xl font-black text-teal-600 mb-1">4/5</div>
              <div className="text-sm text-gray-600">補助率（費用の80%を国が負担）</div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200 text-center shadow-sm">
              <div className="text-3xl font-black text-teal-600 mb-1">2026年</div>
              <div className="text-sm text-gray-600">1次公募締切: 5月12日</div>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-5">
            <p className="text-amber-800 font-bold text-sm mb-2">1次公募締切まで残りわずか（2026年5月12日）</p>
            <p className="text-amber-700 text-sm">IT導入補助金の申請には、ITベンダーとの連携が必要です。お早めにご相談ください。</p>
          </div>
        </div>
      </section>

      {/* 導入事例シミュレーション */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-black text-gray-900 mb-6 text-center">導入コストシミュレーション</h2>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-teal-50">
                <tr>
                  <th className="text-left p-4 font-bold text-teal-800">項目</th>
                  <th className="text-right p-4 font-bold text-teal-800">通常</th>
                  <th className="text-right p-4 font-bold text-teal-800">補助金適用後</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-100">
                  <td className="p-4 text-gray-700">介護カスハラAI 月額</td>
                  <td className="p-4 text-right text-gray-900 font-medium">¥29,800/月</td>
                  <td className="p-4 text-right text-teal-600 font-black">¥5,960/月</td>
                </tr>
                <tr className="border-t border-gray-100">
                  <td className="p-4 text-gray-700">介護ヒヤリハットAI 月額</td>
                  <td className="p-4 text-right text-gray-900 font-medium">¥9,800/月</td>
                  <td className="p-4 text-right text-teal-600 font-black">¥1,960/月</td>
                </tr>
                <tr className="border-t border-gray-100">
                  <td className="p-4 text-gray-700">介護記録AI 月額</td>
                  <td className="p-4 text-right text-gray-900 font-medium">¥9,800/月</td>
                  <td className="p-4 text-right text-teal-600 font-black">¥1,960/月</td>
                </tr>
                <tr className="border-t border-gray-200 bg-teal-50">
                  <td className="p-4 font-black text-teal-800">3点セット合計（月額）</td>
                  <td className="p-4 text-right font-bold text-gray-900">¥49,400/月</td>
                  <td className="p-4 text-right font-black text-teal-600 text-lg">¥9,880/月</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">※補助率は適用枠により異なります（通常枠2/3、インボイス枠最大4/5）。実際の補助額は申請内容により異なります。</p>
        </div>
      </section>

      {/* 義務化説明 */}
      <section className="py-12 px-4 bg-red-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-black text-gray-900 mb-6 text-center">2026年10月 義務化で何が変わるか</h2>
          <div className="space-y-4">
            {[
              { label: "対策マニュアルの整備義務", desc: "カスハラへの対応方針を運営規程に明記することが義務化されます。" },
              { label: "相談窓口の設置義務", desc: "職員がカスハラ被害を相談できる窓口の設置が求められます。" },
              { label: "記録・報告体制の整備", desc: "インシデント記録の整備と、行政への報告体制が求められます。" },
              { label: "未対応の場合は行政指導リスク", desc: "実地指導で未対応が発覚した場合、改善勧告の対象になる可能性があります。" },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-xl p-4 border border-red-200 flex gap-4">
                <div className="w-5 h-5 bg-red-500 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">{item.label}</div>
                  <div className="text-gray-600 text-sm mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 bg-teal-700 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-black mb-4">まず無料でお試しください</h2>
          <p className="text-teal-100 text-sm mb-8">
            補助金申請のご相談から、システムのデモまで無料で対応いたします。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tool"
              className="bg-white text-teal-700 font-black px-8 py-4 rounded-xl hover:bg-teal-50 transition-colors"
            >
              無料で3回試す（カスハラAI）
            </Link>
            <a
              href="tel:090-6093-5290"
              className="bg-yellow-400 text-teal-900 font-black px-8 py-4 rounded-xl hover:bg-yellow-300 transition-colors"
            >
              電話で相談する
            </a>
          </div>
          <p className="text-teal-200 text-xs mt-6">
            ポッコリラボ｜090-6093-5290｜levonadesign@gmail.com
          </p>
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "IT導入補助金2026で介護カスハラAIを導入できますか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "はい。IT導入補助金2026の対象となる可能性があります。補助率4/5で最大450万円が補助されるため、月額費用を大幅に削減できます。詳細はお問い合わせください。",
                },
              },
              {
                "@type": "Question",
                "name": "2026年10月の義務化とは何ですか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "労働施策総合推進法の改正により、2026年10月から介護事業所はカスハラ対策の体制整備が義務化されます。対応マニュアルの策定、相談窓口の設置、インシデント記録の整備が求められます。",
                },
              },
              {
                "@type": "Question",
                "name": "無料トライアルはありますか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "はい。介護カスハラAIは3回まで無料でお試しいただけます。実際の対応文を生成してから、導入を検討いただけます。",
                },
              },
            ],
          }),
        }}
      />
    </main>
  );
}
