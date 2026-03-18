import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b px-6 py-4">
        <Link href="/" className="font-bold text-gray-900">介護カスハラAI</Link>
      </nav>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">利用規約</h1>
        <div className="space-y-6 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="font-bold text-base text-gray-900 mb-2">第1条（適用）</h2>
            <p>本規約は、ポッコリラボ（以下「当社」）が提供する「介護カスハラAI」（以下「本サービス」）の利用に関する条件を定めるものです。ユーザーは本規約に同意の上、本サービスをご利用ください。</p>
          </section>
          <section>
            <h2 className="font-bold text-base text-gray-900 mb-2">第2条（免責事項）</h2>
            <p>本サービスはカスタマーハラスメント対応に関する情報提供を目的としており、弁護士・法律専門家による法律相談の代替ではありません。本サービスの利用により生じた損害について、当社の故意または重過失による場合を除き、一切の責任を負いません。</p>
          </section>
          <section>
            <h2 className="font-bold text-base text-gray-900 mb-2">第3条（禁止事項）</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>本サービスの不正利用・クラッキング</li>
              <li>他のユーザーへの迷惑行為</li>
              <li>法令または公序良俗に違反する行為</li>
              <li>本サービスの運営を妨害する行為</li>
            </ul>
          </section>
          <section>
            <h2 className="font-bold text-base text-gray-900 mb-2">第4条（有料サービスと解約）</h2>
            <p>有料プランはPAY.JPによる月額課金です。解約はいつでも可能です。解約後は次回更新日まで引き続きご利用いただけます。デジタルコンテンツの性質上、決済完了後の返金は承っておりません。</p>
          </section>
          <section>
            <h2 className="font-bold text-base text-gray-900 mb-2">第5条（変更）</h2>
            <p>当社は、必要と判断した場合には、本規約を変更することがあります。変更後の規約は本ページに掲載した時点で効力を生じます。</p>
          </section>
          <section>
            <h2 className="font-bold text-base text-gray-900 mb-2">第6条（準拠法・管轄裁判所）</h2>
            <p>本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して生じた紛争については、名古屋地方裁判所を専属的合意管轄とします。</p>
          </section>
          <p className="text-gray-400 text-xs">制定日：2026年1月1日</p>
        </div>
        <Link href="/" className="mt-8 inline-block text-blue-600 underline text-sm">← トップへ</Link>
      </div>
    </div>
  );
}
