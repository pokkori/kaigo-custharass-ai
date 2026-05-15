import { getSupabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("seo_articles")
    .select("title, meta_description")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!data) return { title: "記事が見つかりません" };

  return {
    title: `${data.title} | 介護カスハラAI`,
    description: data.meta_description,
  };
}

interface FaqItem {
  question: string;
  answer: string;
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const supabase = getSupabaseAdmin();
  const { data: article } = await supabase
    .from("seo_articles")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!article) return notFound();

  let faqItems: FaqItem[] = [];
  try {
    faqItems = JSON.parse(article.faq_json || "[]");
  } catch {
    faqItems = [];
  }

  // FAQ JSON-LD
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f: FaqItem) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      {faqItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/blog" className="hover:underline">コラム一覧</Link>
          <span className="mx-2">&gt;</span>
          <span>{article.title}</span>
        </nav>

        <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
        <p className="text-xs text-gray-400 mb-8">
          {new Date(article.published_at).toLocaleDateString("ja-JP")} 公開
          {" "}｜ キーワード: {article.keyword}
        </p>

        <div
          className="prose prose-sm max-w-none [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-3 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ul>li]:mb-1"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {faqItems.length > 0 && (
          <section className="mt-12 border-t pt-8">
            <h2 className="text-xl font-bold mb-6">よくある質問</h2>
            <div className="space-y-6">
              {faqItems.map((faq: FaqItem, i: number) => (
                <div key={i}>
                  <p className="font-semibold mb-1">Q. {faq.question}</p>
                  <p className="text-gray-700 text-sm">A. {faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <p className="font-bold text-blue-900 mb-2">介護カスハラAIで義務化対応を自動化</p>
          <p className="text-sm text-blue-800 mb-4">
            クレーム記録・対応マニュアル生成・証拠保全を一括対応。IT導入補助金活用で実質7,450円/月〜。
          </p>
          <a
            href="https://kaigo-custharass-ai.vercel.app"
            className="inline-block bg-blue-600 text-white px-5 py-2 rounded text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            無料デモを試す（30分）
          </a>
        </div>
      </main>
    </>
  );
}
