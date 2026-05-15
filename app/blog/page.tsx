import { getSupabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "介護カスハラ対策コラム | 介護カスハラAI",
  description: "介護施設のカスタマーハラスメント対策に役立つ情報を発信。義務化対応・クレームマニュアル・AI活用事例を解説します。",
};

export const dynamic = "force-dynamic";

interface SeoArticle {
  slug: string;
  title: string;
  meta_description: string;
  keyword: string;
  published_at: string;
}

export default async function BlogIndex() {
  const supabase = getSupabaseAdmin();
  const { data: articles } = await supabase
    .from("seo_articles")
    .select("slug, title, meta_description, keyword, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(20);

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">介護カスハラ対策コラム</h1>
      <p className="text-gray-600 mb-8 text-sm">義務化対応・クレーム対応マニュアル・AI活用事例を解説</p>

      {/* 静的記事 */}
      <div className="space-y-6">
        <article className="border-b pb-6">
          <Link href="/blog/kasuhara-guide" className="block group">
            <h2 className="text-lg font-semibold group-hover:text-blue-600 transition-colors mb-1">
              介護カスハラ完全ガイド：義務化対応から記録方法まで
            </h2>
            <p className="text-gray-600 text-sm">介護施設でのカスタマーハラスメント対策の基本から実践まで解説します。</p>
          </Link>
        </article>

        {/* 自動生成記事 */}
        {(articles as SeoArticle[] | null)?.map((article) => (
          <article key={article.slug} className="border-b pb-6">
            <Link href={`/blog/${article.slug}`} className="block group">
              <h2 className="text-lg font-semibold group-hover:text-blue-600 transition-colors mb-1">
                {article.title}
              </h2>
              <p className="text-gray-600 text-sm line-clamp-2">{article.meta_description}</p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(article.published_at).toLocaleDateString("ja-JP")}
              </p>
            </Link>
          </article>
        ))}
      </div>

      {(!articles || articles.length === 0) && (
        <p className="text-gray-500 text-sm mt-4">記事を準備中です。</p>
      )}
    </main>
  );
}
