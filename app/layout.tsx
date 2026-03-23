import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const SITE_URL = "https://kaigo-custharass-ai.vercel.app";
const TITLE = "介護カスハラAI｜介護事業所のカスタマーハラスメント対応を15秒で｜運営基準対応";
const DESC = "介護事業所向けカスハラ対応支援AI。利用者・家族からのカスハラ・不当要求への返信文・断り文・証拠記録テンプレートを即生成。2026年度運営基準改正対応。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏥</text></svg>" },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: SITE_URL,
    siteName: "介護カスハラAI",
    locale: "ja_JP",
    type: "website",
    images: [{ url: `${SITE_URL}/og.png`, width: 1200, height: 630, alt: "介護カスハラAI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
  },
  metadataBase: new URL(SITE_URL),
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "介護カスハラAI",
      "url": SITE_URL,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "9800", "priceCurrency": "JPY", "description": "介護事業所プラン ¥9,800/月" },
      "description": DESC,
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "介護現場のカスハラに特化していますか？", "acceptedAnswer": { "@type": "Answer", "text": "はい。厚労省「介護現場におけるハラスメント対策マニュアル」に準拠した、介護・福祉現場特有のカスハラ対応文を生成します。" } },
        { "@type": "Question", "name": "証拠記録テンプレートも生成されますか？", "acceptedAnswer": { "@type": "Answer", "text": "はい。日時・場所・発言内容・対応経緯を整理した記録テンプレートを生成します。行政への報告や訴訟対応に備えた証拠管理にご活用ください。" } },
        { "@type": "Question", "name": "2026年度の運営基準改正に対応していますか？", "acceptedAnswer": { "@type": "Answer", "text": "はい。2026年度の介護運営基準改正によるカスハラ体制整備義務化に先行対応しています。改正労働施策総合推進法第30条の7・介護運営基準改正が施行予定で、未対応の場合、行政指導・監査リスクが生じます。カスハラ方針の明文化・研修実施・相談窓口設置が必須となります。" } },
        { "@type": "Question", "name": "解約はいつでもできますか？", "acceptedAnswer": { "@type": "Answer", "text": "はい、いつでも解約可能です。解約後は次の更新日まで引き続きご利用いただけます。" } },
        { "@type": "Question", "name": "訪問介護と施設介護で対応が違いますか？", "acceptedAnswer": { "@type": "Answer", "text": "はい。訪問介護事業所・特別養護老人ホーム（特養）・老健・デイサービスそれぞれの事業所形態に応じた対応文を生成します。訪問介護は単独対応リスクが高いため体制変更通知が重要で、施設系は家族対応・夜間体制の課題に特化した文書を生成します。" } },
        { "@type": "Question", "name": "介護カスハラ対策の法的根拠は何ですか？", "acceptedAnswer": { "@type": "Answer", "text": "介護カスハラ対策の主な法的根拠は、①改正労働施策総合推進法第30条の7（カスハラ対策措置の義務化・2026年10月施行）②介護保険施設・事業所の運営基準（省令改正・カスハラ対策整備の義務化）③民法709条（不法行為責任）④刑法208条（暴行罪）・222条（脅迫罪）などです。本AIはこれらの法的根拠を対応文に自動引用します。" } },
        { "@type": "Question", "name": "スタッフが1人でカスハラを受けた場合の対応は？", "acceptedAnswer": { "@type": "Answer", "text": "訪問介護など単独対応中にカスハラを受けた場合、まずその場を安全に離れることが最優先です。「複数体制への切り替え通知書」「緊急連絡ルール設定通知」などをAIが即生成します。一人で抱え込まず、管理者への即時報告フローを整備することが義務化対応の要件です。" } },
        { "@type": "Question", "name": "利用者家族からの不当クレームへの対応方法は？", "acceptedAnswer": { "@type": "Answer", "text": "「毎日何十回も電話してくる」「訴える・監査を呼ぶ」といった家族からのカスハラには、連絡時間帯制限通知書・法的根拠（刑法脅迫罪）を明示した書面警告文・段階的なエスカレーション（弁護士・国保連連携）のテンプレートをAIが生成します。" } },
        { "@type": "Question", "name": "介護施設でカスハラ対策マニュアルを作る方法は？", "acceptedAnswer": { "@type": "Answer", "text": "事業所プラン（¥9,800/月）では、厚労省ガイドライン準拠のカスハラ判定基準・対応フロー・エスカレーション手順を含む社内マニュアル一式をAIが自動生成します。義務化（2026年10月施行）の証拠書類として保存できる形式で出力します。" } },
        { "@type": "Question", "name": "認知症利用者からのカスハラはどう対応すべきですか？", "acceptedAnswer": { "@type": "Answer", "text": "認知症に起因する行動は、疾患の特性を理解した上で対応することが重要です。利用者本人を責めるのではなく、ケア体制の見直し（複数体制・専門家の介入）と、家族への状況報告・対応協力依頼の書面をAIが生成します。記録を残すことで次のケア計画改善にも活用できます。" } },
      ],
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
