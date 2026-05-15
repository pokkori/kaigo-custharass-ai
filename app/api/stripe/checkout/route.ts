import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

// planId -> STRIPE_PRICE_ID のマッピング
// Stripe承認後に各プランの price_id を環境変数で設定
const PRICE_MAP: Record<string, string | undefined> = {
  standard: process.env.STRIPE_PRICE_STANDARD,
  personal: process.env.STRIPE_PRICE_PERSONAL,
  business: process.env.STRIPE_PRICE_BUSINESS,
  btob: process.env.STRIPE_PRICE_BTOB,
  // 年額プラン
  standard_annual: process.env.STRIPE_PRICE_STANDARD_ANNUAL,
  personal_annual: process.env.STRIPE_PRICE_PERSONAL_ANNUAL,
  business_annual: process.env.STRIPE_PRICE_BUSINESS_ANNUAL,
  btob_annual: process.env.STRIPE_PRICE_BTOB_ANNUAL,
};

export async function POST(req: Request) {
  try {
    const { planId } = await req.json();
    const priceId = PRICE_MAP[planId ?? "standard"] ?? PRICE_MAP["standard"];

    if (!priceId) {
      return NextResponse.json(
        { error: "Payment not configured. Please try again later." },
        { status: 503 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://kaigo-custharass-ai.vercel.app";

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/`,
      locale: "ja",
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[stripe/checkout] error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
