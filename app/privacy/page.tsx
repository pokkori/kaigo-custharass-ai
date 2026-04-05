import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー｜介護カスハラAI",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">← トップに戻る</Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>
        <p className="text-sm text-gray-500 mb-8">最終更新日：2026年4月6日</p>

        <section className="space-y-8 text-sm text-gray-700 leading-relaxed">
          <div>
            <h2 className="font-bold text-gray-900 mb-2">1. 事業者情報</h2>
            <p>本サービス「介護カスハラAI」（以下「本サービス」）は、ポッコリラボが運営するWebサービスです。</p>
          </div>

          <div>
            <h2 className="font-bold text-gray-900 mb-2">2. 取得する情報</h2>
            <p>本サービスでは、以下の情報を取得する場合があります。</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>フォームに入力いただいた情報（カスハラの種別・状況など）</li>
              <li>Cookie（利用回数・プレミアム認証の管理に使用）</li>
              <li>アクセスログ（IPアドレス・ブラウザ情報）</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-gray-900 mb-2">3. 利用目的</h2>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>AIによる対応文生成サービスの提供</li>
              <li>無料利用回数の管理</li>
              <li>プレミアム会員の認証</li>
              <li>不正利用の防止</li>
              <li>サービス改善のための利用状況分析</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-gray-900 mb-2">4. 第三者提供</h2>
            <p>取得した情報は、以下の場合を除き第三者に提供しません。</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>法令に基づく場合</li>
              <li>AI生成のためにAnthropicのAPIへ入力内容を送信する場合（Anthropicのプライバシーポリシーが適用されます）</li>
              <li>決済処理のためPAY.JP（PAY.JP株式会社）に提供する場合（PAY.JPのプライバシーポリシーに従います）</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-gray-900 mb-2">5. 外部送信規律（電気通信事業法第27条の12に基づく情報）</h2>
            <p className="mb-3">本サービスは、以下の外部サービスへ利用者の情報を送信しています。</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-800 whitespace-nowrap">送信先事業者</th>
                    <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-800">送信される情報</th>
                    <th className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-800">送信目的</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2 whitespace-nowrap">Anthropic, Inc.</td>
                    <td className="border border-gray-200 px-3 py-2">入力テキスト（カスハラ対応内容）</td>
                    <td className="border border-gray-200 px-3 py-2">AIによる対応文章生成</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-3 py-2 whitespace-nowrap">メタップスペイメント株式会社（PAY.JP）</td>
                    <td className="border border-gray-200 px-3 py-2">決済情報（カード番号は当社では保持しない）</td>
                    <td className="border border-gray-200 px-3 py-2">課金処理</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2 whitespace-nowrap">Vercel Inc.</td>
                    <td className="border border-gray-200 px-3 py-2">アクセスログ、IPアドレス</td>
                    <td className="border border-gray-200 px-3 py-2">サービス提供・インフラ運用</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="font-bold text-gray-900 mb-2">6. Cookieの使用</h2>
            <p>本サービスでは、無料利用回数・プレミアム認証を管理するためにCookieを使用しています。</p>
          </div>

          <div>
            <h2 className="font-bold text-gray-900 mb-2">7. アクセス解析</h2>
            <p>本サービスでは、Vercel Analyticsを使用してアクセス状況を分析しています。個人を特定する情報は収集しません。</p>
          </div>

          <div>
            <h2 className="font-bold text-gray-900 mb-2">8. 免責事項</h2>
            <p>本サービスが生成するコンテンツはAIによる自動生成であり、情報提供を目的としています。実際のカスハラ対応については管理者・法的専門家にご相談ください。</p>
          </div>

          <div>
            <h2 className="font-bold text-gray-900 mb-2">9. ポリシーの変更</h2>
            <p>本ポリシーは予告なく変更する場合があります。変更後は本ページに掲載した時点で効力を生じます。</p>
          </div>

          <div>
            <h2 className="font-bold text-gray-900 mb-2">10. 事業者情報</h2>
            <p>屋号：ポッコリラボ／運営責任者：ポッコリラボ 代表 新美／所在地：〒475-0077 愛知県半田市元山町</p>
          </div>
        </section>
      </article>
    </main>
  );
}
