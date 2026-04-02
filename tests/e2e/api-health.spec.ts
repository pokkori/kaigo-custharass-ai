import { test, expect } from '@playwright/test'

/**
 * APIエンドポイント基本疎通テスト（APIリクエストレベル）
 *
 * Playwright の request コンテキストを使って HTTP リクエストを直接送信する。
 * 外部サービス（Resend / Supabase）への接続はしないため、
 * バリデーションより前に返る 400 レスポンスのみを検証する。
 */

test.describe('API ヘルスチェック', () => {
  test('POST /api/bank-transfer: 空ボディを送ると 400 が返る', async ({ request }) => {
    const res = await request.post('/api/bank-transfer', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    })
    expect(res.status()).toBe(400)
    const body = await res.json() as { error?: string }
    expect(body.error).toBeTruthy()
  })

  test('POST /api/bank-transfer: name のみ送ると 400 が返る（emailなし）', async ({ request }) => {
    const res = await request.post('/api/bank-transfer', {
      data: { name: '山田 太郎' },
      headers: { 'Content-Type': 'application/json' },
    })
    expect(res.status()).toBe(400)
    const body = await res.json() as { error?: string }
    expect(body.error).toMatch(/メールアドレス/)
  })

  test('POST /api/bank-transfer: 不正なメールアドレスを送ると 400 が返る', async ({ request }) => {
    const res = await request.post('/api/bank-transfer', {
      data: { name: '山田 太郎', email: 'invalid-email', plan: 'personal' },
      headers: { 'Content-Type': 'application/json' },
    })
    expect(res.status()).toBe(400)
    const body = await res.json() as { error?: string }
    expect(body.error).toMatch(/メールアドレス/)
  })

  test('POST /api/bank-transfer: 不正なプランを送ると 400 が返る', async ({ request }) => {
    const res = await request.post('/api/bank-transfer', {
      data: { name: '山田 太郎', email: 'taro@example.com', plan: 'unknown_plan' },
      headers: { 'Content-Type': 'application/json' },
    })
    expect(res.status()).toBe(400)
    const body = await res.json() as { error?: string }
    expect(body.error).toMatch(/プラン/)
  })

  test('GET /api/bank-transfer/activate: token なしでアクセスすると 400 が返る', async ({ request }) => {
    const res = await request.get('/api/bank-transfer/activate')
    expect(res.status()).toBe(400)
    // レスポンスは HTML（buildHtml で返している）
    const text = await res.text()
    expect(text).toContain('tokenとemailは必須です')
  })

  test('GET /api/bank-transfer/activate: token のみ（email なし）でアクセスすると 400 が返る', async ({ request }) => {
    const res = await request.get('/api/bank-transfer/activate?token=abc123')
    expect(res.status()).toBe(400)
    const text = await res.text()
    expect(text).toContain('tokenとemailは必須です')
  })

  test('POST /api/trial/register: 空ボディを送ると 400 が返る', async ({ request }) => {
    const res = await request.post('/api/trial/register', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    })
    expect(res.status()).toBe(400)
    const body = await res.json() as { error?: string }
    expect(body.error).toBeTruthy()
  })

  test('POST /api/trial/register: 不正なメールアドレスを送ると 400 が返る', async ({ request }) => {
    const res = await request.post('/api/trial/register', {
      data: { email: 'not-an-email' },
      headers: { 'Content-Type': 'application/json' },
    })
    expect(res.status()).toBe(400)
    const body = await res.json() as { error?: string }
    expect(body.error).toMatch(/メールアドレス/)
  })

  test('POST /api/trial/register: JSONでないボディを送ると 400 が返る', async ({ request }) => {
    const res = await request.post('/api/trial/register', {
      data: 'invalid body',
      headers: { 'Content-Type': 'application/json' },
    })
    // JSON パースエラーで 400
    expect(res.status()).toBe(400)
  })
})
