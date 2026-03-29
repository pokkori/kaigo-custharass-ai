import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PAYJP_API = "https://api.pay.jp/v1";

function auth() {
  return "Basic " + Buffer.from(process.env.PAYJP_SECRET_KEY! + ":").toString("base64");
}

export async function GET(req: NextRequest) {
  const premium = req.cookies.get("premium")?.value;
  const subId = req.cookies.get("payjp_sub_id")?.value;

  if (!premium || !subId) {
    return NextResponse.json({ isPremium: false });
  }

  // PAY.JP API でサブスクリプション状態をリアルタイム検証
  try {
    const res = await fetch(`${PAYJP_API}/subscriptions/${subId}`, {
      headers: { Authorization: auth() },
    });
    const data = await res.json();
    const active = data?.status === "active" || data?.status === "trial";

    if (!active) {
      const response = NextResponse.json({ isPremium: false });
      response.cookies.delete("premium");
      response.cookies.delete("payjp_sub_id");
      return response;
    }

    return NextResponse.json({ isPremium: true, plan: premium });
  } catch {
    // API障害時はcookieをフォールバック
    return NextResponse.json({ isPremium: !!premium });
  }
}
