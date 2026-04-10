import type { Metadata } from "next";
import Link from "next/link";

interface KeywordData {
  title: string;
  h1: string;
  description: string;
  features: { icon: string; title: string; text: string }[];
  faqs: { q: string; a: string }[];
  lastUpdated: string;
}

const KEYWORDS: Record<string, KeywordData> = {
  "kaigo-customer-harassment-taisaku": {
    title: "介護 カスタマーハラスメント 対策 方法 | 介護カスハラAI",
    h1: "介護 カスタマーハラスメント 対策 方法",
    description: "介護現場のカスタマーハラスメント対策をAIがサポート。利用者・家族からの不当な要求への対応方法と記録書類を作成します。",
    features: [
      { icon: "🛡️", title: "AI対応文生成", text: "カスハラ状況を入力するだけで適切な対応文書をAIが即時生成" },
      { icon: "📋", title: "記録書類作成", text: "ハラスメント記録・報告書・警告文書をAIが適切な形式で作成" },
      { icon: "⚖️", title: "法的根拠の説明", text: "介護事業者の権利と法的対応について分かりやすく解説" },
    ],
    faqs: [
      { q: "介護カスハラとはどういうもの？", a: "利用者や家族からの暴言・過剰要求・脅迫・身体的暴力など、介護職員の就業環境を害する行為です。厚生労働省も対策を推進しています。" },
      { q: "カスハラへの適切な対応は？", a: "記録を残す、複数人で対応する、必要に応じてサービス提供を断るなどの対応が重要です。AIが状況に応じた対応方法を提案します。" },
      { q: "サービスを断ることはできる？", a: "正当な理由があればサービス提供の拒否は可能です。AIが適切な断り方と書類作成をサポートします。" },
    ],
    lastUpdated: "2026-03-31",
  },
  "kaigo-riyousha-kazoku-monku": {
    title: "介護施設 利用者 家族 クレーム 対応 | 介護カスハラAI",
    h1: "介護施設 利用者 家族 クレーム 対応",
    description: "介護施設への利用者・家族クレームへの適切な対応方法を解説。AIが状況に応じた対応文と解決策を作成します。",
    features: [
      { icon: "🤝", title: "クレーム対応文生成", text: "クレーム内容を入力するとAIが誠意ある対応文書を自動生成" },
      { icon: "🔍", title: "クレーム分類", text: "正当なクレームとカスハラを区別。AIが適切な対応レベルを判断" },
      { icon: "📊", title: "解決策提案", text: "再発防止策と改善計画をAIが具体的に提案" },
    ],
    faqs: [
      { q: "利用者家族からの過剰クレームへの対処は？", a: "まず事実確認を行い、正当な部分は誠実に対応し、不当な要求には毅然とした態度で対応することが重要です。AIが対応の仕方を支援します。" },
      { q: "クレームを記録する目的は？", a: "再発防止・スタッフ保護・法的トラブル時の証拠として重要です。AIが適切な記録フォーマットと記載方法を提供します。" },
      { q: "クレームが介護事故に関するものの場合は？", a: "介護事故クレームは特に慎重な対応が必要です。AIが初期対応・報告・改善計画の文書作成をサポートします。" },
    ],
    lastUpdated: "2026-03-31",
  },
  "kaigo-staff-harassment-kiroku": {
    title: "介護職員 ハラスメント 記録 書き方 | 介護カスハラAI",
    h1: "介護職員 ハラスメント 記録 書き方",
    description: "介護職員へのハラスメント記録の書き方を解説。AIが5W1Hに基づいた正確な記録書類と報告書を作成します。",
    features: [
      { icon: "📝", title: "記録書類自動生成", text: "ハラスメントの状況を入力するとAIが5W1Hに基づいた正確な記録を生成" },
      { icon: "🗂️", title: "証拠整理支援", text: "日時・場所・発言内容・証人などの情報をAIが整理して証拠として活用できる形式に変換" },
      { icon: "📣", title: "上長報告書作成", text: "管理職への報告書・行政への相談書類をAIが適切なフォーマットで作成" },
    ],
    faqs: [
      { q: "ハラスメント記録で必ず記載すべき項目は？", a: "日時・場所・行為者・行為内容・目撃者・自分の反応の6項目が基本です。AIが漏れなく記録できるフォームを提供します。" },
      { q: "記録はどこに保管すれば？", a: "施設の書面保管と個人のコピー保管の両方を推奨します。AIが記録の適切な保管方法も説明します。" },
      { q: "記録を証拠として使用できる？", a: "適切に作成された記録は法的手続き・行政相談で証拠として有効です。AIが証拠能力の高い記録の書き方をサポートします。" },
    ],
    lastUpdated: "2026-03-31",
  },
  "kaigo-service-kyohi-taishou": {
    title: "介護 サービス 拒否 対象者 対応 | 介護カスハラAI",
    h1: "介護 サービス 拒否 対象者 対応",
    description: "介護サービス提供を断る際の適切な手順と書類作成をAIがサポート。正当な理由に基づいたサービス拒否の方法を解説します。",
    features: [
      { icon: "🚫", title: "サービス拒否通知書作成", text: "法的に適切なサービス提供拒否通知書をAIが作成。理由・代替サービスの案内も含む" },
      { icon: "⚖️", title: "正当理由の確認", text: "サービス拒否が認められる正当理由をAIが確認。法的リスクを最小化するアドバイスを提供" },
      { icon: "🔄", title: "移行支援計画", text: "サービス拒否後の利用者への他事業者紹介・引き継ぎ計画をAIが作成" },
    ],
    faqs: [
      { q: "介護サービスを断ることは法律上問題ない？", a: "正当な理由がある場合はサービス拒否が認められています。カスハラ・暴力・脅迫などが正当理由に該当します。AIが法的根拠も含めて解説します。" },
      { q: "サービス拒否する際の手順は？", a: "管理者への相談→事実確認→警告→改善されない場合の拒否通知という手順が適切です。AIが各ステップの文書作成をサポートします。" },
      { q: "拒否後に苦情が来た場合は？", a: "適切に記録・手続きを踏んだ上での拒否なら対応可能です。AIが苦情対応文書と行政への相談書類を作成します。" },
    ],
    lastUpdated: "2026-03-31",
  },
  "kaigo-homon-custharass": {
    title: "訪問介護 カスハラ 対策 安全 | 介護カスハラAI",
    h1: "訪問介護 カスハラ 対策 安全",
    description: "訪問介護特有のカスハラリスクと対策を解説。一人での訪問時の安全確保と適切な対応方法をAIがサポートします。",
    features: [
      { icon: "🏠", title: "訪問介護特化対策", text: "一人訪問特有のリスクに対応した安全確保マニュアルをAIが作成" },
      { icon: "📱", title: "緊急時対応プロトコル", text: "ハラスメント発生時の即座の対応手順と連絡体制をAIが整備" },
      { icon: "🔒", title: "安全訪問計画", text: "リスクの高い訪問先への対応策と訪問前後の確認事項をAIが提案" },
    ],
    faqs: [
      { q: "訪問介護でのカスハラ事例は？", a: "性的な言動・暴力・過剰なサービス要求・深夜の呼び出し・無断録音などが代表的な事例です。AIが具体的な対応方法を提案します。" },
      { q: "一人訪問時に危険を感じたら？", a: "すぐに退出して事業所に連絡することが最優先です。AIが訪問中断の適切な手順と報告書作成をサポートします。" },
      { q: "訪問前にリスクを把握できる？", a: "過去の記録・担当者引き継ぎ情報からリスクを事前確認することが重要です。AIがリスクアセスメントの方法を提供します。" },
    ],
    lastUpdated: "2026-03-31",
  },
  "kaigo-verbal-abuse-taio": {
    title: "介護 暴言 暴力 対応 マニュアル | 介護カスハラAI",
    h1: "介護 暴言 暴力 対応 マニュアル",
    description: "介護現場での暴言・暴力への対応マニュアルをAIが作成。初動対応から記録・報告・再発防止まで体系的にサポートします。",
    features: [
      { icon: "⚡", title: "即時対応マニュアル", text: "暴言・暴力発生時の初動対応手順をAIがその場で生成。スタッフが迷わず動ける内容" },
      { icon: "📋", title: "インシデントレポート", text: "暴力行為の詳細なインシデントレポートをAIが自動作成。医療・法的対応に活用可能" },
      { icon: "🔄", title: "再発防止計画", text: "再発防止のための環境改善・対応変更・スタッフ教育計画をAIが提案" },
    ],
    faqs: [
      { q: "利用者の暴言・暴力は認知症が原因なら仕方ない？", a: "認知症による行動であっても、スタッフへのハラスメントを放置することは問題です。AIが認知症ケアを考慮した対応方法を提案します。" },
      { q: "暴力行為を警察に届けることは可能？", a: "正当防衛・業務妨害・傷害に該当する場合は警察への届け出が可能です。AIが判断基準と手続きを説明します。" },
      { q: "管理職がハラスメントを軽視している場合は？", a: "行政機関（都道府県・労働局）への相談も選択肢です。AIが外部相談窓口への相談書類作成をサポートします。" },
    ],
    lastUpdated: "2026-03-31",
  },
  "kaigo-custharass-jirei": {
    title: "介護 カスハラ 事例 対処法 | 介護カスハラAI",
    h1: "介護 カスハラ 事例 対処法",
    description: "介護現場でのカスハラ実際の事例と対処法を解説。AIが事例に基づいた適切な対応方法と書類作成をサポートします。",
    features: [
      { icon: "📚", title: "事例データベース", text: "介護カスハラの典型的な事例と対応結果のデータベースをAIが提供" },
      { icon: "🎯", title: "事例別対応策", text: "類似事例を参照した最適な対応策をAIが提案" },
      { icon: "🏆", title: "対応改善点提示", text: "事例から学んだ組織的な改善ポイントをAIが抽出して提案" },
    ],
    faqs: [
      { q: "介護カスハラの代表的な事例は？", a: "「もっと早くしろ」などの暴言、身体的暴力、性的発言、過剰なサービス要求、長時間の電話苦情などが多い事例です。" },
      { q: "他施設の対応事例を参考にできる？", a: "AIが様々な対応事例のパターンを学習しており、類似状況への最適な対応策を提案できます。" },
      { q: "カスハラを受けた職員のケアは？", a: "被害を受けた職員のメンタルサポートも重要です。AIが職員ケアの方法と産業医への相談書類作成をサポートします。" },
    ],
    lastUpdated: "2026-03-31",
  },
  "kaigo-mental-health-staff": {
    title: "介護職 メンタルヘルス 燃え尽き 対策 | 介護カスハラAI",
    h1: "介護職 メンタルヘルス 燃え尽き 対策",
    description: "介護職員のメンタルヘルスと燃え尽き症候群（バーンアウト）対策を解説。AIがストレスチェックと回復プログラムをサポートします。",
    features: [
      { icon: "💚", title: "ストレスチェックAI", text: "職場ストレスの状態をAIが分析。燃え尽き症候群の早期発見をサポート" },
      { icon: "🧘", title: "メンタルケアプラン", text: "介護職特有のストレス要因に対応したセルフケア方法をAIが提案" },
      { icon: "🏥", title: "専門機関連携サポート", text: "産業医・EAP・カウンセリング機関への相談書類作成をAIがサポート" },
    ],
    faqs: [
      { q: "介護職に多いメンタル不調のサインは？", a: "意欲低下・感情の鈍化・身体的疲労の蓄積・利用者への冷淡な態度などがバーンアウトのサインです。AIが早期発見チェックリストを提供します。" },
      { q: "カスハラとメンタル不調の関係は？", a: "カスハラを繰り返し受けると深刻なメンタル不調につながります。AIが組織的な対策とスタッフケアを総合的にサポートします。" },
      { q: "メンタル不調で休職したいが言いにくい？", a: "AIが産業医・上司への相談文書や休職申請書類の作成をサポートします。適切な形で休職に向けた手続きを進められます。" },
    ],
    lastUpdated: "2026-03-31",
  },
  "kaigo-complaint-manual": {
    title: "介護施設 クレーム 対応 マニュアル | 介護カスハラAI",
    h1: "介護施設 クレーム 対応 マニュアル",
    description: "介護施設向けのクレーム対応マニュアルをAIが作成。初動対応から解決・再発防止まで体系的なマニュアルを提供します。",
    features: [
      { icon: "📖", title: "施設別マニュアル生成", text: "施設の種別・規模・特性に合わせたクレーム対応マニュアルをAIが作成" },
      { icon: "🎓", title: "スタッフ教育資料", text: "マニュアルをベースにしたスタッフ研修資料をAIが自動作成" },
      { icon: "🔄", title: "定期更新サポート", text: "クレーム事例の蓄積に基づいたマニュアルの定期更新をAIがサポート" },
    ],
    faqs: [
      { q: "クレーム対応マニュアルに含めるべき内容は？", a: "初動対応手順・記録方法・エスカレーション基準・法的対応・再発防止策が基本項目です。AIが施設に合ったマニュアルを作成します。" },
      { q: "マニュアルをスタッフに浸透させるには？", a: "定期的な研修・ロールプレイング・事例の共有が効果的です。AIが研修プログラムの設計もサポートします。" },
      { q: "小規模施設でもマニュアルは必要？", a: "規模に関わらず基本的な対応フローの整備は重要です。AIが小規模施設向けのシンプルなマニュアルを作成します。" },
    ],
    lastUpdated: "2026-03-31",
  },
  "kaigo-custharass-horitsu": {
    title: "介護 カスハラ 法律 対応 権利 | 介護カスハラAI",
    h1: "介護 カスハラ 法律 対応 権利",
    description: "介護カスハラに関する法律と事業者・職員の権利を解説。AIが法的根拠に基づいた対応書類と相談サポートを提供します。",
    features: [
      { icon: "⚖️", title: "法的根拠の説明", text: "介護保険法・労働安全衛生法・刑法など関連法律をAIが分かりやすく解説" },
      { icon: "📜", title: "法的対応文書作成", text: "警告書・告訴状・行政相談書など法的効力のある書類をAIがサポート" },
      { icon: "🏛️", title: "相談機関への誘導", text: "弁護士・労働局・都道府県担当部署など適切な相談窓口をAIが案内" },
    ],
    faqs: [
      { q: "介護カスハラは犯罪になる？", a: "暴行罪・傷害罪・脅迫罪・不退去罪などに該当する可能性があります。AIが行為の内容から該当する法律を説明します。" },
      { q: "事業者がカスハラ対策を怠ると問題がある？", a: "安全配慮義務違反として事業者が訴えられる可能性があります。AIが組織的なカスハラ対策の整備をサポートします。" },
      { q: "カスハラ被害者が使える法律上の権利は？", a: "労働基準法・労働安全衛生法の保護を受けられます。AIが具体的な権利行使の方法と書類作成をサポートします。" },
    ],
    lastUpdated: "2026-03-31",
  },
};

const ALL_SLUGS = Object.keys(KEYWORDS);

export function generateStaticParams() {
  return ALL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = KEYWORDS[slug];
  if (!data) return { title: "Not Found" };

  return {
    title: data.title,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      type: "article",
      modifiedTime: data.lastUpdated,
      url: `https://kaigo-custharass-ai.vercel.app/keywords/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.description,
    },
    alternates: {
      canonical: `https://kaigo-custharass-ai.vercel.app/keywords/${slug}`,
    },
    other: {
      "article:modified_time": data.lastUpdated,
    },
  };
}

export default async function KeywordPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = KEYWORDS[slug];

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h1>ページが見つかりません</h1>
          <Link href="/" style={{ color: "#f97316" }}>トップページへ戻る</Link>
        </div>
      </div>
    );
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "dateModified": data.lastUpdated,
    "mainEntity": data.faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": { "@type": "Answer", "text": faq.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #431407 50%, #0f172a 100%)", color: "#e2e8f0", padding: "2rem 1rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛡️</div>
            <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: "bold", marginBottom: "1rem", background: "linear-gradient(90deg, #f97316, #ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {data.h1}
            </h1>
            <p style={{ fontSize: "1.1rem", color: "#94a3b8", marginBottom: "2rem" }}>{data.description}</p>
            <Link href="/" style={{ display: "inline-block", background: "linear-gradient(135deg, #f97316, #ef4444)", color: "#fff", padding: "1rem 2.5rem", borderRadius: "50px", fontWeight: "bold", fontSize: "1.1rem", textDecoration: "none" }}>
              今すぐ無料で対応文を作成 →
            </Link>
          </div>

          <div style={{ marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem", textAlign: "center", color: "#f97316" }}>AIがサポートする3つのポイント</h2>
            <div style={{ display: "grid", gap: "1rem" }}>
              {data.features.map((f, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: "12px", padding: "1.5rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "2rem" }}>{f.icon}</span>
                  <div>
                    <h3 style={{ fontWeight: "bold", marginBottom: "0.5rem", color: "#f97316" }}>{f.title}</h3>
                    <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>{f.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem", textAlign: "center", color: "#f97316" }}>よくある質問</h2>
            <div style={{ display: "grid", gap: "1rem" }}>
              {data.faqs.map((faq, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: "12px", padding: "1.5rem" }}>
                  <h3 style={{ fontWeight: "bold", marginBottom: "0.75rem", color: "#f97316", fontSize: "1rem" }}>Q: {faq.q}</h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>A: {faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: "center", marginBottom: "3rem", padding: "2rem", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: "16px" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem", color: "#f97316" }}>介護カスハラ対応をAIがサポート</h2>
            <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>状況を入力するだけで適切な対応文書をAIが即時作成</p>
            <Link href="/" style={{ display: "inline-block", background: "linear-gradient(135deg, #f97316, #ef4444)", color: "#fff", padding: "1rem 2.5rem", borderRadius: "50px", fontWeight: "bold", textDecoration: "none" }}>
              無料で対応文を作成する →
            </Link>
          </div>

          <p style={{ textAlign: "center", color: "#475569", fontSize: "0.8rem", marginBottom: "2rem" }}>最終更新: {data.lastUpdated}</p>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "2rem" }}>
            <h3 style={{ textAlign: "center", color: "#94a3b8", marginBottom: "1rem" }}>他のAIツールも試してみる</h3>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="https://pawahara-ai.vercel.app" style={{ color: "#f97316", textDecoration: "none", fontSize: "0.9rem" }}>パワハラ対策AI</Link>
              <Link href="https://iryou-claim-ai.vercel.app" style={{ color: "#f97316", textDecoration: "none", fontSize: "0.9rem" }}>医療クレームAI</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
