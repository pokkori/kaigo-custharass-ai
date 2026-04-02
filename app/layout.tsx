import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import FeedbackButton from "@/components/FeedbackButton";
import { GoogleAdScript } from "@/components/GoogleAdScript";
import "./globals.css";
import { InstallPrompt } from "@/components/InstallPrompt";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-noto-sans-jp",
});

const SITE_URL = "https://kaigo-custharass-ai.vercel.app";
const TITLE = "介護カスハラAI｜介護事業所のカスタマーハラスメント対応を15秒で｜運営基準対応";
const DESC = "介護事業所向けカスハラ対応支援AI。利用者・家族からのカスハラ・不当要求への返信文・断り文・証拠記録テンプレートを即生成。2026年度運営基準改正対応。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'></text></svg>" },
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
  manifest: "/manifest.json",
  other: { "theme-color": "#0B0F1E" },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "ホーム", "item": SITE_URL },
    { "@type": "ListItem", "position": 2, "name": "介護カスハラ対応AIツール", "item": `${SITE_URL}/tool` },
  ],
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
        { "@type": "Question", "name": "カスハラの証拠を記録する際の注意点は何ですか？", "acceptedAnswer": { "@type": "Answer", "text": "日時・場所・発言内容・対応者・対応経緯を必ず記録してください。録音は事業所ポリシーと就業規則を確認した上で行い、ICレコーダー使用は相手への通知が推奨されます。記録は第三者が読んでも状況がわかるよう客観的な表現で残し、複数人でサインすることで証拠力が高まります。" } },
        { "@type": "Question", "name": "録音は証拠として有効ですか？", "acceptedAnswer": { "@type": "Answer", "text": "録音データは証拠として有効ですが、無断録音は相手との信頼関係を損なうリスクがあります。事前に「記録のために録音します」と伝える方が訴訟対応でも有利です。録音データとともに書面記録を併用することで証拠力が向上します。本AIが録音開始前の告知文テンプレートも生成します。" } },
        { "@type": "Question", "name": "家族からのカスハラはどう対応しますか？", "acceptedAnswer": { "@type": "Answer", "text": "家族からの不当要求・暴言・過度な要求には、①初回の書面による対応方針通知、②連絡方法・時間帯の制限、③エスカレーション（管理者・弁護士・国保連）の段階的対応が有効です。本AIが家族向けの丁寧かつ毅然とした対応文書一式を生成します。" } },
        { "@type": "Question", "name": "2026年介護保険法改正後の対応はどう変わりますか？", "acceptedAnswer": { "@type": "Answer", "text": "2026年10月施行の改正労働施策総合推進法・介護運営基準改正により、事業者にカスハラ対策の「体制整備義務」が課せられます。方針の明文化・研修実施・相談窓口設置・記録管理が義務要件となり、未対応の場合は行政指導・監査リスクが生じます。本AIは義務化対応の書類一式を自動生成します。" } },
        { "@type": "Question", "name": "初めての利用で何が生成されますか？", "acceptedAnswer": { "@type": "Answer", "text": "カスハラの種類・発生状況・相手との関係を入力すると、①即時対応用の返答文、②書面による警告文・通知書、③証拠記録テンプレートの3点が生成されます。さらに法的根拠（条文引用）・エスカレーション手順も添付されます。" } },
        { "@type": "Question", "name": "無料で使えますか？", "acceptedAnswer": { "@type": "Answer", "text": "初回3回は無料でお試しいただけます。月額プラン（¥9,800/月・事業所プラン）では無制限生成・マニュアル自動作成・研修資料生成・複数スタッフ共有が可能です。介護事業所として導入される場合はお得な法人プランもご用意しています。" } },
        { "@type": "Question", "name": "スタッフのメンタルヘルスケアへの対応はありますか？", "acceptedAnswer": { "@type": "Answer", "text": "カスハラ被害を受けたスタッフへの上司からの声かけ文・相談対応フロー・産業医連携の通知文テンプレートも生成します。スタッフが安心して相談できる体制づくりのための内部向け文書も一括出力可能です。" } },
        { "@type": "Question", "name": "デイサービスで送迎中に起きたカスハラはどう対応しますか？", "acceptedAnswer": { "@type": "Answer", "text": "送迎中のカスハラ（暴言・暴力・わいせつ行為等）は、まず安全確保のため車両を停車し複数対応に切り替えます。本AIが送迎ルール変更通知・家族への状況説明文・サービス継続の条件通知書を生成します。ドライブレコーダー映像の保存も証拠として有効です。" } },
        { "@type": "Question", "name": "カスハラ対応でスタッフが体調を崩した場合はどうすればいいですか？", "acceptedAnswer": { "@type": "Answer", "text": "カスハラによる精神的・身体的被害は労働災害（労災）として認定される場合があります。管理者は即時の業務軽減措置・産業医面談の手配・労基署への相談を行い、スタッフを守る義務があります。本AIが上司向けの対応フロー文書・管轄機関への連絡文テンプレートを生成します。" } },
        { "@type": "Question", "name": "行政や国保連に報告が必要なカスハラはどのような場合ですか？", "acceptedAnswer": { "@type": "Answer", "text": "刑事事件に発展しうる暴行・脅迫・性的被害のほか、事業所運営の継続に影響する重大なカスハラは国保連（国民健康保険団体連合会）への報告が推奨されます。本AIが報告書のテンプレートと報告基準の判断チェックリストを生成します。" } },
      ],
    },
    {
      "@type": "SoftwareApplication",
      "name": "介護カスハラAI",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "url": SITE_URL,
      "description": DESC,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "JPY",
        "description": "初回3回無料・事業所プラン¥9,800/月"
      }
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`dark ${notoSansJP.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={`${notoSansJP.className} antialiased`}>
        {children}
        <InstallPrompt />
        <footer className="flex justify-center py-2">
          <FeedbackButton serviceName="介護カスハラAI" />
        </footer>
        <Analytics />
        <SpeedInsights />
        <GoogleAdScript />
        {process.env.NEXT_PUBLIC_CLARITY_ID && process.env.NODE_ENV === 'production' && (
          <Script
            id="clarity-init"
            strategy="afterInteractive"
          >
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${process.env.NEXT_PUBLIC_CLARITY_ID}");`}
          </Script>
        )}
      </body>
    </html>
  );
}
