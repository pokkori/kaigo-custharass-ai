import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

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
        { "@type": "Question", "name": "2026年度の運営基準改正に対応していますか？", "acceptedAnswer": { "@type": "Answer", "text": "はい。2026年度の介護運営基準改正によるカスハラ体制整備義務化に先行対応しています。" } },
        { "@type": "Question", "name": "解約はいつでもできますか？", "acceptedAnswer": { "@type": "Answer", "text": "はい、いつでも解約可能です。解約後は次の更新日まで引き続きご利用いただけます。" } },
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
