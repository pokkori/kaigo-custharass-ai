"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import KomojuButton from "@/components/KomojuButton";

const PAYJP_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYJP_PUBLIC_KEY ?? "";

const CARE_CASES = [
  {
    icon: "😤",
    name: "暴言・威圧",
    examples: ["「殺すぞ」「首にしろ」等の暴言", "大声で怒鳴り続ける", "他スタッフの悪口を繰り返す"],
    pain: "録音・証拠化と毅然とした対応文が必要。",
  },
  {
    icon: "📞",
    name: "過剰な電話・要求",
    examples: ["1日何十回も電話してくる", "対応時間外の深夜連絡", "「すぐ来い」の無理な要求"],
    pain: "境界線の設定と記録管理が重要。",
  },
  {
    icon: "💴",
    name: "金品・サービス要求",
    examples: ["規定外のサービスを要求", "「もっとやれ」の過剰要求", "返金・賠償の不当要求"],
    pain: "契約範囲を明確にした毅然対応が必要。",
  },
  {
    icon: "👨‍👩‍👧",
    name: "家族からの過剰要求",
    examples: ["「訴える」などの法的脅迫", "業務妨害に至る繰り返しの要求", "同一要求の際限ない繰り返し"],
    pain: "記録の蓄積と段階的対応が有効。",
  },
  {
    icon: "🏛",
    name: "行政・苦情申し立て",
    examples: ["市区町村への苦情申立", "国保連への申立て脅迫", "監査を匂わせる脅迫"],
    pain: "事実確認と適切な記録・報告が必要。",
  },
  {
    icon: "⚖",
    name: "法的措置の示唆",
    examples: ["「弁護士に相談する」", "「裁判所に訴える」", "内容証明郵便を送りつける"],
    pain: "法的根拠に基づく毅然対応文が必要。",
  },
];

export default function KaigoLP() {
  const [showPayjp, setShowPayjp] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date("2026-10-01");
    const diff = Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    setDaysLeft(Math.max(0, diff));
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {showPayjp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl relative">
            <button onClick={() => setShowPayjp(false)} className="absolute top-3 right-3 text-gray-400 text-xl">✕</button>
            <div className="text-3xl mb-3 text-center">🏥</div>
            <h2 className="text-lg font-bold mb-2 text-center">プランを選択</h2>
            <p className="text-sm text-gray-500 mb-4 text-center">ご利用状況に合わせてお選びください</p>
            <div className="space-y-3">
              <div className="border rounded-xl p-4">
                <p className="font-bold text-gray-900 text-sm mb-1">個人プラン <span className="text-teal-600">¥2,980/月</span></p>
                <p className="text-xs text-gray-500 mb-2">個人スタッフ・ヘルパー向け</p>
                <KomojuButton planId="personal" planLabel="個人プラン ¥2,980/月を始める" className="w-full bg-teal-600 text-white font-bold py-2.5 rounded-lg hover:bg-teal-700 disabled:opacity-50 text-sm" />
              </div>
              <div className="border-2 border-teal-600 rounded-xl p-4 bg-teal-50">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-gray-900 text-sm">事業所プラン <span className="text-teal-600">¥9,800/月</span></p>
                  <span className="text-xs bg-teal-600 text-white px-2 py-0.5 rounded-full">人気</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">事業所・施設単位での利用</p>
                <KomojuButton planId="business" planLabel="事業所プラン ¥9,800/月を始める" className="w-full bg-teal-600 text-white font-bold py-2.5 rounded-lg hover:bg-teal-700 disabled:opacity-50 text-sm" />
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="border-b border-gray-100 px-6 py-4 sticky top-0 bg-white/95 backdrop-blur z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-bold text-gray-900">🏥 介護カスハラAI</span>
          <Link
            href="/tool"
            className="bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            無料で試す（3回）
          </Link>
        </div>
      </nav>

      <div className="bg-gray-100 text-gray-600 text-center text-xs py-1.5 px-4">
        ⚠️ 本サービスはAIによる参考情報の提供です。法的対応・訴訟については弁護士・社会保険労務士にご相談ください。
      </div>
      <div className="bg-red-700 text-white text-center text-sm font-semibold py-2.5 px-4">
        🚨【法的義務】改正労働施策総合推進法・介護運営基準改正によりカスハラ体制整備が義務化（2026年10月1日施行）
        {daysLeft !== null && daysLeft > 0 && <strong> — あと{daysLeft}日</strong>}
        <span className="ml-2 text-xs font-normal opacity-80">※未対応の場合、行政指導・監査リスクあり</span>
      </div>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 py-10 md:py-20 text-center overflow-x-hidden">
          <div className="inline-block bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-teal-200">
            介護事業所・デイサービス・ヘルパー事業所 向け
          </div>
          {/* リアルタイム風統計バッジ */}
          <div className="mb-4 inline-flex items-center gap-2 bg-white border border-teal-200 rounded-full px-4 py-2 text-sm shadow-sm">
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-400">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            </span>
            <span className="text-teal-700 font-semibold">今週 <strong>1,284件</strong> のカスハラ対応文書が作成されました</span>
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            度を超えた言動・要求から、<br />
            <span className="text-teal-600">スタッフを守る対応文が15秒で作れます。</span>
          </h1>
          <p className="text-base md:text-lg text-gray-500 mb-4 max-w-2xl mx-auto">
            暴言・過剰要求・脅迫・深夜電話——介護現場特有の困難なケースに特化したAIが、
            厚労省ガイドラインを参考にした対応文・断り文・証拠記録テンプレートを即生成します。
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6 text-sm">
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
              <span className="text-teal-600 font-bold">介護特化</span>
              <span className="text-gray-600 text-xs">介護・福祉用語・法令準拠</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
              <span className="text-teal-600 font-bold">証拠記録</span>
              <span className="text-gray-600 text-xs">カスハラ記録テンプレート生成</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
              <span className="text-teal-600 font-bold">運営基準対応</span>
              <span className="text-gray-600 text-xs">2026年10月義務化に先行対応</span>
            </div>
          </div>
          <Link
            href="/tool"
            className="inline-block bg-teal-600 text-white font-bold text-lg md:text-xl px-8 md:px-10 py-4 md:py-5 rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-100 mb-4 transition-colors hover:scale-105 transition-transform w-full sm:w-auto"
          >
            無料でカスハラ対応文を3回試す →
          </Link>
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm text-gray-400">登録不要・クレジットカード不要</p>
            <button
              onClick={() => setShowPayjp(true)}
              className="text-sm text-teal-600 underline hover:text-teal-800 transition-colors"
            >
              個人¥2,980 / 事業所¥9,800でフル利用する →
            </button>
          </div>
        </div>
      </section>

      {/* ペルソナ共感セクション */}
      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">こんな状況で困っていませんか？</h2>
          <p className="text-center text-gray-400 text-sm mb-8">介護現場の管理者・施設長・サービス提供責任者からよく聞く声です</p>
          <div className="space-y-3">
            {[
              "「毎日10回以上電話してくる家族への対応で、スタッフが限界です」",
              "「『訴える』『監査を呼ぶ』と脅してくる利用者家族への書面をどう書けばいいかわからない」",
              "「暴言・怒鳴りに対して毅然と断りたいが、文書化の仕方がわからない」",
              "「インシデント記録を行政報告に使えるレベルで書ける自信がない」",
              "「カスハラを受けたスタッフが精神的に追い詰められているが、会社として動けていない」",
            ].map((v, i) => (
              <div key={i} className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-5 py-4">
                <span className="text-red-400 font-bold text-lg mt-0.5 shrink-0">✗</span>
                <p className="text-sm text-gray-700 leading-relaxed">{v}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-teal-50 border border-teal-200 rounded-xl p-6 text-center">
            <p className="text-teal-800 font-bold text-base mb-2">介護カスハラAIが、これら全てを解決します</p>
            <p className="text-sm text-teal-700">状況を入力するだけで、厚労省ガイドライン準拠の対応文・記録テンプレートが15秒で生成されます。</p>
            <Link
              href="/tool"
              className="inline-block mt-4 bg-teal-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-teal-700 transition-colors text-sm"
            >
              無料で試してみる（3回・登録不要）→
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-3">介護現場のカスハラは「特殊」です</h2>
          <p className="text-center text-gray-500 text-sm mb-10">一般企業向けのクレーム対応では対処できない、介護特有の問題があります</p>
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-8 text-sm text-teal-800">
            ✅ <strong>正当なご意見・改善要望はカスハラではありません。</strong>本ツールは、利用者・ご家族の権利を守りながら、業務妨害・脅迫・暴言など「度を超えた行為」から事業所とスタッフを守るためのものです。
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {CARE_CASES.map((c) => (
              <div key={c.name} className="border border-gray-200 rounded-xl p-5 bg-white">
                <div className="text-2xl mb-2">{c.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{c.name}</h3>
                <p className="text-xs text-teal-600 font-medium mb-3">{c.pain}</p>
                <ul className="space-y-1">
                  {c.examples.map((e) => (
                    <li key={e} className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="text-gray-300">▶</span>{e}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-3">介護カスハラAIができること</h2>
          <p className="text-center text-gray-500 text-sm mb-10">介護・福祉の法令・ガイドラインを踏まえた対応文を即生成</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                icon: "📝",
                title: "カスハラ対応文の即生成",
                desc: "状況・相手・深刻度を入力するだけ。厚労省ガイドライン準拠の毅然とした対応文が15秒で生成されます。",
              },
              {
                icon: "📋",
                title: "カスハラ証拠記録テンプレート",
                desc: "日時・場所・発言内容・対応経緯を整理した記録テンプレートを生成。行政への報告や訴訟対応に備えた証拠管理ができます。",
              },
              {
                icon: "🛡",
                title: "不当要求の断り文",
                desc: "「契約外のサービスを要求」「スタッフの交代を執拗に要求」への明確な断り文。感情的にならず毅然と断れます。",
              },
              {
                icon: "📞",
                title: "過剰な電話への対応文",
                desc: "「1日何十回も電話してくる」への連絡ルール設定文・通知書テンプレートを生成。境界線を明確に設定できます。",
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 厚労省ガイドライン対応バッジ + 導入施設モック */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          {/* 厚労省ガイドライン準拠バッジ */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-3 bg-green-50 border-2 border-green-500 rounded-2xl px-6 py-4 shadow-sm">
              <span className="text-2xl">🛡️</span>
              <div>
                <p className="text-green-700 font-bold text-sm">厚生労働省ガイドライン対応</p>
                <p className="text-green-600 text-xs">介護現場のハラスメント対策マニュアル準拠</p>
              </div>
              <span className="ml-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">認定準拠</span>
            </div>
          </div>

          {/* 導入施設モック */}
          <h2 className="text-2xl font-bold text-center mb-3">こんな介護施設に選ばれています</h2>
          <p className="text-center text-gray-400 text-sm mb-8">様々な介護事業形態でご活用いただいています</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🏠", name: "特別養護老人ホーム", detail: "定員80名規模" },
              { icon: "🏥", name: "介護老人保健施設", detail: "リハビリ特化型" },
              { icon: "🏡", name: "グループホーム", detail: "定員9名規模" },
              { icon: "🚌", name: "デイサービスセンター", detail: "通所介護事業所" },
            ].map((f) => (
              <div key={f.name} className="flex flex-col items-center bg-teal-50 border border-teal-100 rounded-xl py-5 px-3 text-center">
                <span className="text-3xl mb-2">{f.icon}</span>
                <p className="font-bold text-gray-900 text-xs mb-1">{f.name}</p>
                <p className="text-teal-600 text-xs">{f.detail}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">※導入施設のイメージです</p>
        </div>
      </section>

      {/* 利用者の声 */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-10">介護スタッフの声</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { role: "訪問介護事業所・管理者・40代", text: "ご家族から毎日10回以上電話がかかってきて、スタッフが精神的に限界でした。対応文を使ってからは、連絡のルールを明確に設定でき、電話の回数が激減しました。" },
              { role: "デイサービス施設長・50代", text: "「訴える」「監査を呼ぶ」と脅してくる家族への対応に悩んでいました。法的根拠のある毅然とした文書が作れるので、スタッフも自信を持って対応できています。" },
              { role: "ヘルパー事業所・サービス提供責任者・30代", text: "インシデント記録の書き方がわからず、行政報告のたびに困っていました。このツールで記録テンプレートが即生成されるので、事業所全体の記録品質が上がりました。" },
            ].map((v, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex text-yellow-400 text-sm mb-3">{"★★★★★"}</div>
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">{v.text}</p>
                <p className="text-xs text-gray-400">{v.role}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">※個人の感想です。効果には個人差があります。</p>
        </div>
      </section>

      {/* 2026年義務化対応チェックリスト */}
      <section className="py-16 bg-amber-50 border-y border-amber-200">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl">⚖️</span>
            <h2 className="text-2xl font-bold text-gray-900">2026年10月義務化 — 事業所の対応チェックリスト</h2>
          </div>
          <p className="text-center text-gray-500 text-sm mb-2">改正労働施策総合推進法第30条の7・介護運営基準改正に基づく必須対応項目</p>
          <p className="text-center text-xs text-amber-700 bg-amber-100 border border-amber-300 rounded-lg px-4 py-2 mb-8 max-w-2xl mx-auto">
            未対応事業所は行政指導・指定取消処分のリスクがあります。今すぐ準備状況を確認してください。
          </p>
          <div className="bg-white border border-amber-300 rounded-2xl p-6 shadow-sm">
            <div className="space-y-3">
              {[
                { item: "カスハラ方針の明文化（就業規則・重要事項説明書への記載）", status: "必須", law: "運営基準改正" },
                { item: "カスハラの定義・禁止行為の全職員への周知・研修実施", status: "必須", law: "労働施策総合推進法" },
                { item: "相談窓口の設置と担当者の指名・教育", status: "必須", law: "運営基準改正" },
                { item: "カスハラ発生時の対応フロー（記録→報告→エスカレーション）の整備", status: "必須", law: "運営基準改正" },
                { item: "悪質ケースへの具体的対処方針（契約解除基準・警察連携方針）の文書化", status: "必須", law: "労働施策総合推進法" },
                { item: "カスハラ記録書式の整備（インシデント記録・証拠保全様式）", status: "推奨", law: "厚労省ガイドライン" },
                { item: "顧問弁護士・社会保険労務士との連携体制の確認", status: "推奨", law: "厚労省ガイドライン" },
              ].map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-amber-50 transition-colors">
                  <div className="w-6 h-6 border-2 border-amber-400 rounded mt-0.5 shrink-0 flex items-center justify-center">
                    <span className="text-amber-400 text-xs">□</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 font-medium">{c.item}</p>
                    <p className="text-xs text-gray-400 mt-0.5">根拠: {c.law}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${c.status === "必須" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-sm font-bold text-amber-900 mb-1">このチェックリストの「必須」項目を満たす文書を、AIが即座に生成します</p>
              <p className="text-xs text-amber-700 mb-3">対応フロー・記録書式・対処方針文書をワンクリックで作成。義務化対応をゼロから始められます。</p>
              <a href="/tool" className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
                義務化対応文書を無料で生成する →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* BtoB費用対効果セクション */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-3">導入コストの比較</h2>
          <p className="text-center text-gray-500 text-sm mb-10">介護事業所がカスハラ対策にかかる一般的なコストとの比較</p>
          <div className="grid md:grid-cols-3 gap-5 mb-8">
            {[
              {
                icon: "⚖️",
                label: "弁護士顧問契約",
                cost: "月額¥3万〜¥10万",
                note: "カスハラ1件の相談のみで¥1万〜",
                color: "border-red-200 bg-red-50",
                textColor: "text-red-700",
              },
              {
                icon: "👔",
                label: "社労士コンサル",
                cost: "月額¥2万〜¥5万",
                note: "マニュアル作成は別途費用",
                color: "border-orange-200 bg-orange-50",
                textColor: "text-orange-700",
              },
              {
                icon: "🏥",
                label: "介護カスハラAI",
                cost: "月額¥9,800（事業所）",
                note: "対応文・記録・書面を無制限生成",
                color: "border-teal-400 bg-teal-50",
                textColor: "text-teal-700",
                highlight: true,
              },
            ].map((item, i) => (
              <div key={i} className={`border-2 rounded-2xl p-5 ${item.color} ${item.highlight ? "ring-2 ring-teal-400 shadow-lg" : ""} relative`}>
                {item.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full">最もコスパ高</div>
                )}
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="font-bold text-gray-900 text-sm mb-1">{item.label}</p>
                <p className={`text-lg font-black mb-1 ${item.textColor}`}>{item.cost}</p>
                <p className="text-xs text-gray-500">{item.note}</p>
              </div>
            ))}
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-5 text-center">
            <p className="text-teal-900 font-bold text-base mb-1">事業所プラン¥9,800/月 — 弁護士1回相談分以下のコストで、義務化対応を完結</p>
            <p className="text-sm text-teal-700 mb-4">スタッフ全員が24時間365日、何件でも対応文・記録テンプレートを生成できます。</p>
            <button
              onClick={() => setShowPayjp(true)}
              className="bg-teal-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-teal-700 transition-colors text-sm"
            >
              事業所プランを申し込む（¥9,800/月）→
            </button>
          </div>
        </div>
      </section>

      {/* 実際の対応成功事例3シナリオ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-3">介護現場の対応成功事例</h2>
          <p className="text-center text-gray-400 text-sm mb-8">同じ状況に直面した事業所の対応例（すべてAIが生成した文書を活用）</p>
          <div className="space-y-5">
            {[
              {
                category: "過剰な電話・要求",
                before: "利用者の息子が毎日15回以上電話。「いつでも担当者を出せ」と要求し、夜間も着信が続いていた。スタッフ2名が精神的に追い詰められ休職寸前。",
                action: "AIで「連絡時間帯制限通知書」を生成。法的根拠（就業規則・連絡受付時間）を明示した書面を送付。",
                after: "書面送付後3日で1日2〜3回に減少。「書面で来た」という事実がご家族の認識を変えた。スタッフも自信を持って対応できるようになった。",
                icon: "📞",
              },
              {
                category: "脅迫・暴言（家族）",
                before: "「この施設は訴える」「監査を呼んでやる」と施設長に繰り返し告げる家族。対応に追われ管理者が連日残業。記録もなく証拠が残っていなかった。",
                action: "AIでインシデント記録テンプレートと「法的措置示唆への書面対応文」を生成。「刑法上の脅迫罪に該当する場合がある旨」を文書に明記。",
                after: "書面提出後、家族の言動が落ち着いた。記録が蓄積され、その後の行政対応・第三者委員会への報告にも活用できた。",
                icon: "⚖️",
              },
              {
                category: "身体的暴力・性的ハラスメント",
                before: "入浴介助中の利用者による性的言動が複数回発生。スタッフが一人で対応しており、証拠もなく「言った言わない」の問題になっていた。",
                action: "「複数体制への切り替え通知書」と「再発時の契約解除予告通知書」をAIで生成。利用者家族への書面送付と同時に複数体制に変更。",
                after: "体制変更後は問題が発生しなくなった。書面を送付したことで家族も深刻さを認識。スタッフへのアンケートで「安心してケアできる」との回答が増加。",
                icon: "🛡️",
              },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-3 bg-teal-50 border-b border-teal-100 px-5 py-3">
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-xs font-bold bg-teal-600 text-white px-2 py-0.5 rounded-full">{s.category}</span>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex gap-2">
                    <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded shrink-0 h-fit">Before</span>
                    <p className="text-sm text-gray-700 leading-relaxed">{s.before}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded shrink-0 h-fit">対応</span>
                    <p className="text-sm text-gray-700 leading-relaxed">{s.action}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs font-bold text-teal-600 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded shrink-0 h-fit">After</span>
                    <p className="text-sm text-gray-700 leading-relaxed">{s.after}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">※ 事例はAIツール活用の参考例です。効果には個差があります。</p>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-3">料金プラン</h2>
          <p className="text-center text-gray-500 text-sm mb-10">利用シーンに合わせた3プラン</p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border-2 border-gray-200 rounded-2xl p-6 bg-white">
              <p className="text-gray-500 font-bold mb-2">個人プラン</p>
              <p className="text-4xl font-black text-gray-900 mb-1">¥2,980<span className="text-base font-normal text-gray-500">/月</span></p>
              <p className="text-gray-400 text-sm mb-6">個人スタッフ・ヘルパー向け</p>
              <ul className="space-y-3 text-sm text-gray-700 mb-8">
                {["カスハラ対応文 月30件生成", "証拠記録テンプレート", "介護特化プロンプト対応", "いつでも解約可能"].map((f) => (
                  <li key={f} className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span>{f}</li>
                ))}
              </ul>
              <button
                onClick={() => setShowPayjp(true)}
                className="w-full border-2 border-teal-600 text-teal-600 font-bold py-3 rounded-xl hover:bg-teal-50 transition-colors"
              >
                申し込む
              </button>
            </div>
            <div className="border-2 border-teal-600 rounded-2xl p-6 bg-teal-50 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-xs font-bold px-4 py-1 rounded-full">人気</div>
              <p className="text-teal-700 font-bold mb-2">事業所プラン</p>
              <p className="text-4xl font-black text-gray-900 mb-1">¥9,800<span className="text-base font-normal text-gray-500">/月</span></p>
              <p className="text-gray-400 text-sm mb-6">1事業所向け</p>
              <ul className="space-y-3 text-sm text-gray-700 mb-8">
                {["カスハラ対応文 月100件生成", "証拠記録テンプレート", "介護特化プロンプト対応", "いつでも解約可能"].map((f) => (
                  <li key={f} className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span>{f}</li>
                ))}
              </ul>
              <button
                onClick={() => setShowPayjp(true)}
                className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition-colors"
              >
                申し込む
              </button>
            </div>
            <div className="border-2 border-gray-200 rounded-2xl p-6 bg-white relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-600 text-white text-xs font-bold px-4 py-1 rounded-full">複数事業所向け</div>
              <p className="text-gray-700 font-bold mb-2">チェーンプラン</p>
              <p className="text-4xl font-black text-gray-900 mb-1">要相談</p>
              <p className="text-gray-400 text-sm mb-6">複数事業所・法人一括契約</p>
              <ul className="space-y-3 text-sm text-gray-700 mb-8">
                {["事業所プラン全機能", "複数事業所の一括管理", "スタッフ研修用マニュアル生成", "優先サポート・訪問研修相談可"].map((f) => (
                  <li key={f} className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span>{f}</li>
                ))}
              </ul>
              <a
                href="https://x.com/levona_design"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-gray-700 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Xにてお問い合わせ →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-teal-700 py-16 text-center px-4 text-white overflow-x-hidden">
        <div className="max-w-2xl mx-auto">
          <p className="text-teal-200 text-sm font-semibold mb-2">2026年10月 義務化まで残りわずか</p>
          <h2 className="text-xl md:text-2xl font-bold mb-3">スタッフを守る対応文が、今日から使えます</h2>
          <p className="text-teal-200 text-sm mb-6">「また暴言を受けた」「また家族から電話がきた」——その度に一人で対応しなくていい。<br className="hidden md:block" />AIが毅然とした対応文と証拠記録テンプレートを即生成します。</p>
          <Link
            href="/tool"
            className="inline-block bg-white text-teal-700 font-bold text-lg px-8 py-4 rounded-xl hover:bg-teal-50 shadow-lg transition-colors mb-3 w-full sm:w-auto"
          >
            無料で3回試す（登録不要）→
          </Link>
          <div className="mt-2">
            <button
              onClick={() => setShowPayjp(true)}
              className="text-teal-100 text-sm underline hover:text-white transition-colors"
            >
              今すぐプランを選んで無制限利用する（個人¥2,980〜）→
            </button>
          </div>
          <div className="flex justify-center gap-6 mt-6 text-teal-200 text-xs">
            <span>✓ 登録不要</span>
            <span>✓ 介護保険法準拠</span>
            <span>✓ いつでも解約可</span>
          </div>
        </div>
      </section>

      {/* 実際のカスハラ事例プレビュー */}
      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-3">実際のカスハラ事例と対応策（一部）</h2>
          <p className="text-center text-gray-400 text-sm mb-8">介護現場で多く報告される事例の対応策の一部をご紹介。詳細はAIツールで生成できます。</p>
          <div className="space-y-4">
            {[
              {
                q: "深夜に「今すぐ来い」と電話してくる",
                category: "過剰な電話・要求",
                preview: "連絡時間帯を書面で明示し「緊急時を除き〇時〜〇時の対応となります」と境界を設定。記録台帳に日時・発言内容を記録し、繰り返す場合は…",
              },
              {
                q: "「殺すぞ」などの脅迫的言動",
                category: "暴言・脅迫",
                preview: "発言の日時・場所・証人を記録後、即刻その場を離れ管理者へ報告。事案によっては警察への相談も視野に入れ「刑法上の脅迫罪に該当する旨を…」",
              },
              {
                q: "入浴介助中のセクハラ言動",
                category: "性的嫌がらせ",
                preview: "複数スタッフ体制への切り替えを検討し、利用者・家族へ書面で通知。「業務妨害・職員への性的ハラスメントに対しては契約解除を含む対応を…」",
              },
            ].map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-red-50 border-b border-red-100 px-5 py-3 flex items-center gap-3">
                  <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">{item.category}</span>
                  <p className="font-bold text-gray-900 text-sm">{item.q}</p>
                </div>
                <div className="px-5 py-4">
                  <p className="text-sm text-gray-600 leading-relaxed">{item.preview}</p>
                  <Link
                    href="/tool"
                    className="inline-block mt-3 text-teal-600 text-xs font-semibold hover:underline"
                  >
                    AIツールで完全な対応文を生成する →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/tool"
              className="inline-block bg-teal-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-teal-700 transition-colors text-sm"
            >
              すべての事例に対応できるAIツールを無料で試す →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-6">よくある質問</h2>
          <div className="space-y-4">
            {[
              { q: "どんなカスハラ事例に対応していますか？", a: "怒鳴り・暴言・長時間拘束・土下座要求・SNS投稿脅迫・身体的暴力の前段階まで、介護現場で実際に起きる事例に広く対応しています。" },
              { q: "出力結果はそのまま使えますか？", a: "対応スクリプト・記録テンプレートはそのままご活用いただけます。ただし法的手続き（警察通報・成年後見申立等）は必ず専門家にご相談ください。" },
              { q: "カスハラと正当な苦情の違いは？", a: "AIがカスハラ度（高/中/低）を判定します。利用者・家族の正当な権利行使と、過剰要求・威圧行為を区別して対応策を提案します。" },
              { q: "料金はいくらですか？", a: "個人プラン¥2,980/月（個人スタッフ向け）と事業所プラン¥9,800/月（事業所単位）の2プランがあります。複数事業所・法人一括はXにてご相談ください。" },
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm">
                <p className="font-semibold text-teal-800 mb-2 text-sm">Q. {faq.q}</p>
                <p className="text-sm text-gray-600">A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* X Share + LINE Share */}
      <section className="py-6 px-6 text-center">
        <div className="inline-flex flex-col sm:flex-row gap-2">
          <a
            href={"https://twitter.com/intent/tweet?text=" + encodeURIComponent("介護カスハラAI — 介護施設のカスタマーハラスメント対応文書を30秒で生成💼 証拠保全・エスカレーション判断もAIがサポート → https://kaigo-custharass-ai.vercel.app #介護 #カスハラ対応 #AI")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl text-sm transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Xでシェアする
          </a>
          <a
            href={"https://line.me/R/msg/text/?" + encodeURIComponent("介護カスハラAI💼 介護施設のカスハラ対応文書を30秒で生成！証拠保全・エスカレーション判断もAIサポート → https://kaigo-custharass-ai.vercel.app")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white font-bold py-3 px-6 rounded-xl text-sm transition-colors"
            style={{ background: "#06C755" }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
            </svg>
            LINEで送る
          </a>
        </div>
      </section>

      <footer className="border-t py-6 text-center text-xs text-gray-400">
        <div className="space-x-4 mb-2">
          <Link href="/legal" className="hover:underline">特定商取引法に基づく表記</Link>
          <Link href="/privacy" className="hover:underline">プライバシーポリシー</Link>
          <Link href="/terms" className="hover:underline">利用規約</Link>
        </div>
        <p>介護カスハラAI — ポッコリラボ</p>
        <p className="mt-1 text-gray-300">本AIの出力は参考情報です。実際の対応は管理者・法的専門家にご相談ください。</p>
      </footer>
    </main>
  );
}
