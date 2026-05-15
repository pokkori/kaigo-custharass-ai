import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const PLANS: Record<string, { amount: number; description: string; cookieValue: string }> = {
  standard: { amount: 980, description: '介護カスハラAI スタンダードプラン（月額）', cookieValue: '1' },
  personal: { amount: 2980, description: '介護カスハラAI 個人プラン（月額）', cookieValue: '1' },
  business: { amount: 9800, description: '介護カスハラAI 事業所プラン（月額）', cookieValue: 'biz' },
  btob: { amount: 29800, description: '介護カスハラAI 施設BtoBプラン（月額）', cookieValue: 'biz' },
  // 年額プラン（月額×8: 2ヶ月分無料）
  standard_annual: { amount: 980 * 8, description: '介護カスハラAI スタンダードプラン（年額）', cookieValue: '1' },
  personal_annual: { amount: 2980 * 8, description: '介護カスハラAI 個人プラン（年額）', cookieValue: '1' },
  business_annual: { amount: 9800 * 8, description: '介護カスハラAI 事業所プラン（年額）', cookieValue: 'biz' },
  btob_annual: { amount: 29800 * 8, description: '介護カスハラAI 施設BtoBプラン（年額）', cookieValue: 'biz' },
}

export async function POST(req: Request) {
  try {
    const { planId, amount } = await req.json()
    // amount が指定された場合（年額など動的金額）は上書き

    const plan = PLANS[planId ?? 'standard']
    if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    // 動的金額（年額など）が指定された場合は上書き
    const finalAmount = typeof amount === 'number' && amount > 0 ? amount : plan.amount

    const secretKey = process.env.KOMOJU_SECRET_KEY?.trim()
    if (!secretKey) return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kaigo-custharass-ai.vercel.app'

    const response = await fetch('https://komoju.com/api/v1/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(secretKey + ':').toString('base64'),
      },
      body: JSON.stringify({
        amount: finalAmount,
        currency: 'JPY',
        default_locale: 'ja',
        payment_types: ['credit_card'],
        metadata: { planId: planId ?? 'standard' },
        return_url: `${baseUrl}/success`,
        cancel_url: `${baseUrl}/`,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Komoju session error:', err)
      return NextResponse.json({ error: err }, { status: 500 })
    }

    const session = await response.json()
    return NextResponse.json({ url: session.session_url, sessionId: session.id })
  } catch (e) {
    console.error('Komoju checkout error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
