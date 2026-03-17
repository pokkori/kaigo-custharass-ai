import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isActiveSubscription } from "@/lib/supabase";

export const dynamic = "force-dynamic";

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

const systemPrompt = `あなたは企業法務・労務の現場実務に精通した専門アドバイザーであり、介護事業所のカスタマーハラスメント対応の専門コンサルタントです。
厚生労働省「介護現場のハラスメント対策マニュアル（2024年改訂版）」および2026年10月施行の介護運営基準改正（カスハラ対策体制整備の義務化）を熟知しています。

## 出力の絶対ルール

1. **即使えるコピペ文を必ず含める**
   - 口頭スクリプト・書面通知文・インシデント記録の3種類を必ず出力する
   - 各文書は指定文字数を厳守する（短縮禁止）
   - 氏名・日付・施設名は「（施設名）」「（山田 花子）」形式のプレースホルダーで示す

2. **リスクの根拠を法的根拠で示す**
   - 介護保険法・社会福祉法・厚生労働省ガイドラインの根拠を適切に引用する
   - 「リスクが高い」ではなく「〇〇法〇条に基づき対応が必要」と記述する

3. **3段階の選択肢を提示する**
   - 【A案: 強硬対応】法的効果が最大。ただし関係悪化リスクあり
   - 【B案: 標準対応】実務バランスが最良。多くの場面で推奨
   - 【C案: 穏便対応】関係維持を優先。法的効果は限定的

4. **深刻度を必ずスコアで示す**
   - 法的リスク: 低(1-3) / 中(4-6) / 高(7-9) / 重大(10) で数値化
   - 緊急度: 「即日対応必須」「1週間以内」「余裕あり」の3段階

5. **共感フレーズを冒頭1〜2文で示す**
   「それは辛い状況ですね」等の共感フレーズを必ず冒頭に入れる。ただし共感は1〜2文のみ。本論に素早く移行する。`;
const FREE_LIMIT = 3;
const COOKIE_KEY = "kaigo_use_count";
const APP_ID = "kaigo-custharass-ai";

const rateLimit = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) { rateLimit.set(ip, { count: 1, resetAt: now + 60000 }); return true; }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

const VALID_CASE_TYPES = ["暴言・威圧", "過剰な電話・要求", "金品・サービス要求", "家族からのクレーム", "行政・苦情申し立て", "法的措置の示唆"];
const VALID_REQUESTER = ["利用者本人", "家族・親族", "その他"];
const VALID_SEVERITY = ["軽度", "中度", "重度"];

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "リクエストが多すぎます。しばらく待ってから再試行してください。" }, { status: 429 });
  }
  const email = req.cookies.get("user_email")?.value;
  let isPremium = false;
  if (email) {
    isPremium = await isActiveSubscription(email, APP_ID);
  } else {
    const pv = req.cookies.get("premium")?.value;
    isPremium = pv === "1" || pv === "biz";
  }
  const cookieCount = parseInt(req.cookies.get(COOKIE_KEY)?.value || "0");
  if (!isPremium && cookieCount >= FREE_LIMIT) {
    return NextResponse.json({ error: "LIMIT_REACHED" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "リクエストの形式が正しくありません" }, { status: 400 }); }

  const { caseType, requesterType, severity, situation } = body as Record<string, string>;
  if (!situation || !situation.trim()) return NextResponse.json({ error: "状況を入力してください" }, { status: 400 });
  if (situation.length > 1500) return NextResponse.json({ error: "状況は1500文字以内で入力してください" }, { status: 400 });
  if (caseType && !VALID_CASE_TYPES.includes(caseType)) return NextResponse.json({ error: "不正なカスハラ種別です" }, { status: 400 });
  if (requesterType && !VALID_REQUESTER.includes(requesterType)) return NextResponse.json({ error: "不正な要求者種別です" }, { status: 400 });
  if (severity && !VALID_SEVERITY.includes(severity)) return NextResponse.json({ error: "不正な深刻度です" }, { status: 400 });

  const safSituation = situation.replace(/[<>]/g, "");

  const severityGuidance =
    severity === "重度"
      ? "弁護士・警察・行政機関への連携が視野に入る深刻なケースです。毅然とした対応と証拠保全を最優先し、必要に応じてサービス提供の一時停止・拒否を明示してください。"
      : severity === "軽度"
      ? "初期段階のクレームです。誠実な傾聴と適切な境界線設定で早期解決を目指してください。"
      : "繰り返し発生または感情的なカスハラです。事実確認・記録・毅然とした対応の3点が核心です。";

  const prompt = `あなたは介護事業所の管理者・施設長を15年以上支援してきた、カスタマーハラスメント対応の専門コンサルタントです。
厚生労働省「介護現場のハラスメント対策マニュアル（2024年改訂版）」および2026年10月施行の介護運営基準改正（カスハラ対策体制整備の義務化）を熟知しています。
50件以上の介護現場カスハラ対応を直接支援し、全件で行政指導なしに解決した実績を持ちます。

介護事業所の管理者・生活相談員がそのまま使用できる、プロ品質の対応文一式を生成してください。

【重要な品質基準】
- 各対応文は必ず指定文字数を満たすこと（短縮禁止）
- 「速やかに対応します」「検討いたします」等の抽象表現は禁止。期日・部署名・具体的措置を必ず明記
- 介護保険法・社会福祉法・厚生労働省ガイドラインの根拠を適切に引用
- 利用者・家族の権利と事業所スタッフの尊厳保護の両立を明示
- カスハラと正当な苦情・要望を明確に区別した対応を取ること

【カスハラ種別】${caseType || "不明"}
【要求者】${requesterType || "不明"}
【深刻度】${severity || "中度"}
【状況の詳細】
${safSituation}

【対応方針】
${severityGuidance}

以下の3種類の対応文を生成してください。各対応文は「---」（ハイフン3つのみの行）で区切ってください。

---
## 口頭・電話対応スクリプト

管理者・生活相談員が直接読み上げるセリフ形式で、**必ず500〜700文字**で生成してください。

【必須要素】
- 冒頭：受け止めの言葉（感情的にならず、落ち着いて傾聴する姿勢を示す。例：「この度はご不満をお伝えいただき、ありがとうございます。担当管理者の[氏名]でございます」）
- カスハラの事実認定（例：「先ほどのお電話で○○とのご発言がございましたが、スタッフへの威圧的な言動については、事業所として受け入れることができません」）
- 介護保険法・ガイドラインへの言及（例：「厚生労働省のハラスメント対策指針において、事業所はスタッフの安全を守る責務があります」）
- 具体的な次のアクションと期限（例：「本件については本日17時までに施設長と協議し、明日午前中に書面にて回答いたします」）
- 深刻度「重度」の場合：サービス継続の条件または一時停止の告知（例：「今後同様の行為が続く場合、介護保険法第9条に基づきサービス提供の継続を検討させていただく場合がございます」）
- 家族からのカスハラの場合：利用者本人との関係性を確認し、利用者の意思確認を行う旨を追記

【文体】敬語・丁寧語を徹底。箇条書き禁止（流れるセリフ形式）。読み上げやすい文節で区切る。

---
## 書面・通知文

事業所名義の正式文書として、**必ず500〜700文字**で生成してください。

【必須要素】
- 文書冒頭：日付・宛名・差出人のプレースホルダー（例：令和　　年　　月　　日 / ○○様 / ○○介護事業所 管理者 ○○　/ 件名：ハラスメント行為に関するご通知）
- 第1段落：事実の確認と受け止め（日時・場所・具体的発言・行為を客観的に記述）
- 第2段落：介護保険法・ガイドラインに基づく事業所の立場の明示（「介護保険法および厚生労働省ハラスメント対策指針に基づき、本事業所はスタッフの安全確保を優先する義務を負っております」等）
- 第3段落：今後の対応方針と条件（期日を明記。例：「○月○日までに書面にてご回答いただけない場合、本ガイドラインに基づき…」）
- 深刻度「重度」の場合：警告文言と法的措置への言及（「今後同様の行為が継続する場合、警察への通報・弁護士への相談を含む法的対応を検討いたします」等）
- 末尾：担当者・部署・連絡先のプレースホルダー

【文体】公用文体（「ます・です」調）。段落は一行空け。「拝啓・敬具」等の頭語・結語を使用。

---
## インシデント記録テンプレート

行政報告・法的対応・保険会社への報告に耐えうる客観的記述で生成してください。**全フィールドに今回の状況に即した具体的な記載例を補記すること。**

【必須フィールド（全項目を状況に合わせて埋めること）】
- 記録番号：KAIGO-YYYYMMDD-（連番）　※例：KAIGO-20261015-001
- 記録日時：　　※例：2026年10月15日 14:30
- 対応者氏名・部署・役職：　　※例：山田花子 / 生活相談員 / 主任
- 発生日時：　　発生場所：　　受付方法（電話 / 来所 / 書面等）：
- 要求者情報（氏名・利用者との関係・連絡先。不明の場合は「取得不可」と記載）：
- カスハラ種別：${caseType || "不明"}　　深刻度：${severity || "中度"}
- 行為の詳細（5W1Hで事実のみ記述。推測・感情表現は排除）：
- 発言の逐語録（記憶の限り正確に。語気・トーンも付記）：
- 要求・主張の内容（具体的に列挙）：
- 対応経緯（時系列で。日時・対応者・内容を記録）：
- 証拠の有無（録音・録画・書面・目撃者等）：
- 今後の対応方針・担当者・期限：
- 関係機関への報告（国保連・市区町村・警察等）：
- 法的リスク評価（低 / 中 / 高）・理由：
- 承認者氏名・承認日：

---
※ 本ツールが生成する対応文はAIによる参考案です。法的効力を持つものではありません。重大なカスハラや法的問題が生じた場合は必ず専門家（弁護士・社会保険労務士）にご相談ください。`;

  const newCount = cookieCount + 1;
  const headers: Record<string, string> = {
    "Content-Type": "text/plain; charset=utf-8",
    "Transfer-Encoding": "chunked",
    "X-New-Count": String(newCount),
    "Set-Cookie": `${COOKIE_KEY}=${newCount}; Max-Age=${60 * 60 * 24 * 30}; Path=/; SameSite=Lax; HttpOnly; Secure`,
  };

  try {
    const stream = getClient().messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              controller.enqueue(new TextEncoder().encode(chunk.delta.text));
            }
          }
        } catch (err) {
          console.error(err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, { headers });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "AI生成中にエラーが発生しました。しばらく待ってから再試行してください。" }, { status: 500 });
  }
}
