import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "介護現場のカスハラ対策完全ガイド2026年【事業所必見】 | 介護カスハラAI",
  description: "介護現場のカスタマーハラスメント（カスハラ）とは何か、具体的な事例、2026年10月の義務化対応、対応文書の作り方まで徹底解説。介護事業所・デイサービス向け完全ガイド。",
  openGraph: {
    title: "介護現場のカスハラ対策完全ガイド2026年",
    description: "義務化直前！介護事業所が今すぐ取り組むべきカスハラ対策を詳しく解説",
  },
};

const KASUHARA_TYPES = [
  {
    type: "身体的暴力",
    icon: "👊",
    examples: ["殴る・蹴る等の暴力行為", "物を投げつける", "スタッフの身体への接触"],
    law: "刑法第208条（暴行罪）",
    response: "即時退避・記録・警察通報を検討",
  },
  {
    type: "精神的暴力",
    icon: "😡",
    examples: ["「殺すぞ」等の脅迫発言", "大声・怒鳴り続け", "侮辱・差別的発言"],
    law: "刑法第222条（脅迫罪）",
    response: "記録・書面対応・弁護士相談",
  },
  {
    type: "過剰な要求",
    icon: "📞",
    examples: ["1日何十回もの電話", "深夜の連絡要求", "契約外サービスの要求"],
    law: "業務妨害罪・不退去罪",
    response: "連絡ルール設定・書面通知",
  },
  {
    type: "セクシャルハラスメント",
    icon: "🚨",
    examples: ["性的言動・接触", "「担当を替えろ」の繰り返し", "卑猥な発言"],
    law: "強制わいせつ罪等",
    response: "複数体制・警察連携・通知書",
  },
  {
    type: "行政・法的脅迫",
    icon: "⚖️",
    examples: ["「監査を呼ぶ」", "「訴える・弁護士に頼む」", "国保連への申立脅迫"],
    law: "対応は記録と毅然対応が原則",
    response: "事実確認・記録蓄積・顧問弁護士相談",
  },
];

const CHECKLIST = [
  { phase: "方針策定", items: ["カスハラ対応方針の文書化", "就業規則への明記", "重要事項説明書への記載"], status: "必須" },
  { phase: "体制整備", items: ["相談窓口の設置", "担当者の指名・研修", "対応フローの文書化"], status: "必須" },
  { phase: "記録・報告", items: ["インシデント記録書式の整備", "行政報告様式の準備", "証拠保全ルールの整備"], status: "必須" },
  { phase: "周知・研修", items: ["全職員への研修実施", "カスハラ事例の共有", "対応ロールプレイ実施"], status: "推奨" },
];

const CASE_EXAMPLES = [
  {
    title: "ケース1: 毎日20回以上の電話攻撃",
    situation: "利用者の息子が「スタッフが足りない」「サービスが悪い」と毎日20回以上電話。深夜にも着信があり、スタッフが精神的に追い詰められた。",
    response: "AIで「連絡時間帯制限通知書」を生成。法的根拠（業務妨害）を明示した書面を郵送。",
    result: "書面送付後3日で電話回数が激減。「書面で来た」という事実が家族の認識を変えた。",
    docType: "連絡時間帯制限通知書",
  },
  {
    title: "ケース2: 「訴える・監査を呼ぶ」の脅迫",
    situation: "施設長に「訴えてやる」「監査を呼ぶ」と繰り返す家族。記録もなく証拠が残っていなかった。",
    response: "インシデント記録テンプレートと「法的措置示唆への書面対応文」をAIで生成。刑法上の脅迫罪に該当する旨を文書に明記。",
    result: "書面提出後、家族の言動が落ち着いた。記録が行政対応・第三者委員会への報告にも活用。",
    docType: "法的脅迫への書面通知文",
  },
  {
    title: "ケース3: 入浴介助中のセクハラ",
    situation: "入浴介助中の利用者による性的言動が複数回発生。スタッフが一人で対応しており、証拠もなかった。",
    response: "複数体制への切り替え通知書と再発時の契約解除予告通知書をAIで生成。",
    result: "体制変更後は問題が発生しなくなった。スタッフへのアンケートで「安心してケアできる」との回答が増加。",
    docType: "契約解除予告通知書",
  },
];

export default function KasuharaGuidePage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4 sticky top-0 bg-white/95 backdrop-blur z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" aria-label="介護カスハラAIトップページへ" className="font-bold text-gray-900">🏥 介護カスハラAI</Link>
          <Link href="/tool" aria-label="介護カスハラAIツールを無料で3回試す" className="bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">
            無料で試す（3回）
          </Link>
        </div>
      </nav>

      {/* パンくずリスト */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-xs text-gray-500">
        <nav aria-label="breadcrumb">
          <ol className="flex items-center gap-1 max-w-4xl mx-auto">
            <li><Link href="/" className="hover:text-teal-700">トップ</Link></li>
            <li>/</li>
            <li className="text-gray-700 font-medium">カスハラ対策完全ガイド</li>
          </ol>
        </nav>
      </div>

      {/* ヒーロー */}
      <section className="bg-gradient-to-br from-teal-700 to-emerald-600 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
            2026年10月 義務化対応
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-4">介護現場のカスハラ対策<br />完全ガイド2026年版</h1>
          <p className="text-teal-100 text-base mb-4">介護事業所・デイサービス・訪問介護向け。カスハラの定義から具体的な対応文書の作り方まで、現場で使える実践情報を徹底解説。</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-white/20 rounded-full px-3 py-1">2026年10月義務化</span>
            <span className="bg-white/20 rounded-full px-3 py-1">介護現場特化</span>
            <span className="bg-white/20 rounded-full px-3 py-1">厚労省GL準拠</span>
          </div>
        </div>
      </section>

      {/* 目次 */}
      <section className="py-8 px-4 bg-teal-50 border-b border-teal-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-bold text-teal-800 text-sm mb-3">📋 このガイドで分かること</h2>
          <ol className="space-y-1 text-sm text-teal-700">
            {[
              "介護カスハラとは何か（定義・具体例）",
              "カスハラの種類と法的対応（5種類解説）",
              "2026年10月義務化の対応チェックリスト",
              "介護現場のカスハラ対応成功事例3選",
              "対応文書の作り方（AIを活用した実践方法）",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="bg-teal-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 第1章: 定義 */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. 介護カスハラとは何か</h2>
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-5 mb-6">
            <p className="text-teal-800 font-bold text-sm mb-2">【定義】厚生労働省によるカスハラの定義</p>
            <p className="text-teal-700 text-sm leading-relaxed">
              カスタマーハラスメント（カスハラ）とは、顧客・利用者等からの著しい迷惑行為であり、「労働者の就業環境が害されるもの」を指します。介護分野では、利用者本人・その家族からの暴言・暴力・過剰要求・脅迫等が該当します。
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-amber-800 text-sm font-bold mb-1">✅ カスハラと正当な苦情の違い</p>
            <p className="text-amber-700 text-sm">利用者・家族の正当な改善要望はカスハラではありません。サービスの質向上のために真摯に受け止めるべき「正当な苦情」と、業務妨害・脅迫等の「カスハラ」を区別して対応することが重要です。</p>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            2023年の厚労省調査では、介護職員の約7割がカスハラを経験していると回答。主な行為として「暴言・怒鳴り」が最多で、次いで「過剰な要求」「繰り返しの電話」が続きます。カスハラは職員の離職率上昇・精神的健康被害の主要因となっており、事業所としての組織的対応が急務です。
          </p>
        </div>
      </section>

      {/* 第2章: 種類と法的対応 */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">2. カスハラの種類と法的根拠</h2>
          <div className="space-y-4">
            {KASUHARA_TYPES.map((k, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-teal-50 border-b border-teal-100 px-5 py-3 flex items-center gap-3">
                  <span className="text-2xl">{k.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{k.type}</h3>
                    <p className="text-xs text-teal-600">{k.law}</p>
                  </div>
                </div>
                <div className="p-5 grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-gray-600 mb-2">具体的な行為例</p>
                    <ul className="space-y-1">
                      {k.examples.map((e, j) => (
                        <li key={j} className="text-xs text-gray-600 flex items-start gap-1">
                          <span className="text-gray-400">▶</span>{e}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-3">
                    <p className="text-xs font-bold text-teal-700 mb-1">推奨対応</p>
                    <p className="text-xs text-teal-600">{k.response}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 第3章: 義務化チェックリスト */}
      <section className="py-12 px-4 bg-amber-50 border-y border-amber-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">3. 2026年10月義務化 対応チェックリスト</h2>
          <p className="text-gray-500 text-sm mb-6">改正労働施策総合推進法第30条の7・介護運営基準改正による必須対応項目</p>
          <div className="space-y-4">
            {CHECKLIST.map((phase, i) => (
              <div key={i} className="bg-white border border-amber-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-amber-50 border-b border-amber-100">
                  <h3 className="font-bold text-amber-800 text-sm">Phase {i + 1}: {phase.phase}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${phase.status === "必須" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                    {phase.status}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  {phase.items.map((item, j) => (
                    <div key={j} className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-5 h-5 border-2 border-amber-400 rounded flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-teal-50 border border-teal-200 rounded-xl p-5 text-center">
            <p className="font-bold text-teal-800 text-sm mb-2">このチェックリストの全項目をAIが文書化します</p>
            <Link href="/tool" aria-label="カスハラ義務化対応文書を無料でAI生成する" className="inline-block mt-2 bg-teal-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-teal-700 transition-colors text-sm">
              義務化対応文書を無料で生成する →
            </Link>
          </div>
        </div>
      </section>

      {/* 第4章: 対応成功事例 */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">4. 介護現場のカスハラ対応成功事例</h2>
          <div className="space-y-6">
            {CASE_EXAMPLES.map((c, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-teal-50 px-5 py-3 border-b border-teal-100">
                  <h3 className="font-bold text-gray-900 text-sm">{c.title}</h3>
                  <span className="text-xs bg-teal-600 text-white px-2 py-0.5 rounded-full">{c.docType}</span>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex gap-3">
                    <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded h-fit shrink-0">状況</span>
                    <p className="text-sm text-gray-700">{c.situation}</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded h-fit shrink-0">対応</span>
                    <p className="text-sm text-gray-700">{c.response}</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-xs font-bold text-teal-600 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded h-fit shrink-0">結果</span>
                    <p className="text-sm text-gray-700">{c.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">※事例はAIツール活用の参考例です。効果には個差があります。</p>
        </div>
      </section>

      {/* 第5章: AIツール活用法 */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. AIツールを使った対応文書の作り方</h2>
          <p className="text-gray-600 text-sm mb-6">介護カスハラAIを使えば、専門知識がなくても厚労省ガイドライン準拠の対応文書が15秒で作れます。</p>
          <div className="space-y-4">
            {[
              { step: 1, title: "カスハラの種別を選択", desc: "暴言・過剰電話・金銭要求・家族からのクレームなど、6種類から選択。" },
              { step: 2, title: "状況を入力（またはプリセット選択）", desc: "状況の詳細を入力するか、よくあるシナリオのプリセットをワンクリックで選択。" },
              { step: 3, title: "深刻度を選択（軽度/中度/重度）", desc: "深刻度に応じて、AIが適切な強度の対応文を生成。" },
              { step: 4, title: "15秒で3種類の文書が生成される", desc: "口頭スクリプト・書面通知文・インシデント記録テンプレートが同時に生成。" },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 items-start bg-white border border-gray-200 rounded-xl p-4">
                <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">{s.step}</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{s.title}</h3>
                  <p className="text-gray-600 text-xs mt-1">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/tool" className="inline-block bg-teal-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-teal-700 transition-colors">
              AIでカスハラ対応文書を無料生成する →
            </Link>
            <p className="text-xs text-gray-400 mt-2">登録不要・クレジットカード不要・3回無料</p>
          </div>
        </div>
      </section>

      {/* まとめ */}
      <section className="py-12 px-4 bg-teal-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-3">介護スタッフを守るために、今すぐ動こう</h2>
          <p className="text-teal-100 text-sm mb-6">2026年10月の義務化まで時間はありません。AIが対応方針・記録書式・対処文書を即座に生成します。</p>
          <Link href="/tool" className="inline-block bg-white text-teal-700 font-bold text-lg px-8 py-4 rounded-xl hover:bg-teal-50 shadow-lg transition-colors mb-3">
            無料で3回試す（登録不要）→
          </Link>
        </div>
      </section>

      <footer className="border-t py-6 text-center text-xs text-gray-400">
        <div className="space-x-4 mb-2">
          <Link href="/legal" className="hover:underline">特定商取引法に基づく表記</Link>
          <Link href="/privacy" className="hover:underline">プライバシーポリシー</Link>
          <Link href="/terms" className="hover:underline">利用規約</Link>
          <Link href="/" className="hover:underline">トップへ</Link>
        </div>
        <p>介護カスハラAI — ポッコリラボ</p>
        <p className="mt-1 text-gray-300">本AIの出力は参考情報です。実際の対応は管理者・法的専門家にご相談ください。</p>
      </footer>
    </div>
  );
}
