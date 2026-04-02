import Link from "next/link";

const ITEMS = [
  { label: "販売業者", value: "新美諭" },
  { label: "電話番号", value: "090-6093-5290" },
  { label: "運営責任者", value: "ポッコリラボ 代表 新美諭" },
  { label: "所在地", value: "非公開（請求があれば遅滞なく開示します）" },
  { label: "お問い合わせ", value: "levonadesign@gmail.com（X: @levona_design）" },
  { label: "販売価格", value: "個人プラン ¥2,980/月（税込）、事業所プラン ¥9,800/月（税込）" },
  { label: "支払方法", value: "クレジットカード（オンライン決済サービス経由）（Visa・Mastercard・American Express・JCB）" },
  { label: "支払時期", value: "お申込み時に即時決済。以降、毎月同日に自動更新" },
  { label: "サービス提供時期", value: "決済完了後、即時ご利用いただけます" },
  { label: "商品代金以外の必要料金", value: "なし" },
  { label: "返品・キャンセル", value: "デジタルコンテンツの性質上、決済完了後の返金は承っておりません。解約はいつでも可能です。解約後は次回更新日まで引き続きご利用いただけます" },
  { label: "動作環境", value: "インターネット接続環境および最新版ブラウザが必要です" },
];

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b px-6 py-4">
        <Link href="/" className="font-bold text-gray-900">介護カスハラAI</Link>
      </nav>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">特定商取引法に基づく表記</h1>
        <p className="text-gray-500 text-sm mb-8">Act on Specified Commercial Transactions</p>
        <dl className="space-y-4">
          {ITEMS.map((item) => (
            <div key={item.label} className="border-b border-gray-100 pb-4">
              <dt className="text-sm font-semibold text-gray-500 mb-1">{item.label}</dt>
              <dd className="text-gray-800 text-sm leading-relaxed">{item.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">AIによる生成コンテンツに関する免責</h2>
          <ol className="space-y-3 list-decimal list-inside text-sm text-gray-700 leading-relaxed">
            <li>本サービスが提供するAI生成コンテンツは、あくまでも参考情報・補助情報として提供するものであり、その正確性、完全性、有用性を保証するものではありません。</li>
            <li>生成AIは常に正確または完全であるとは限りません。専門家（医師、弁護士、税理士、社会保険労務士等）の判断が必要な事項については、必ず専門家にご相談ください。</li>
            <li>当社は、AI生成コンテンツの利用により生じた損害について、一切の責任を負いません。</li>
            <li>基盤モデル提供者（Anthropic, Inc.）のサービス停止や仕様変更により、本サービスの機能が変更・停止される場合があります。</li>
          </ol>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-3">お問い合わせはこちら</p>
          <Link
            href="/contact"
            className="inline-block bg-blue-600 text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            お問い合わせフォーム
          </Link>
          <p className="text-xs text-gray-400 mt-2">2営業日以内にご返信いたします（土日祝を除く）</p>
        </div>
      </div>
    </div>
  );
}
