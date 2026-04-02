import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * BankTransferModal E2Eテスト
 *
 * 銀行振込モーダルはPayjpModal内の「銀行振込で申し込む」ボタン経由で開く。
 * フローは:
 *   1. トップページを開く
 *   2. 料金セクションの「お申し込みはこちら」等のボタンでPayjpModalを開く
 *   3. PayjpModal内の「銀行振込で申し込む」テキストリンクをクリック
 *   4. BankTransferModalが開く
 */

test.describe('BankTransferModal', () => {
  // ページが重いためdescribeブロック全体のタイムアウトを60秒に設定
  test.describe.configure({ timeout: 60000 })

  // PayjpModal を開いて BankTransferModal まで遷移する共通ヘルパー
  async function openBankTransferModal(page: import('@playwright/test').Page) {
    await page.goto('/')
    // PayjpModalを開くボタンを探す（aria-labelまたはテキストで検索）
    const payjpTrigger = page
      .getByRole('button', { name: /プラン選択モーダルを開く|申し込みモーダルを開く/ })
      .first()
    await payjpTrigger.waitFor({ state: 'visible', timeout: 15000 })
    await payjpTrigger.click()
    // PayjpModal内の「銀行振込で申し込む」リンクを待つ
    const bankLink = page.getByRole('button', { name: '銀行振込で申し込むフォームを開く' })
    await bankLink.waitFor({ state: 'visible', timeout: 10000 })
    await bankLink.click()
    // BankTransferModalが開くまで待つ
    await page.getByRole('dialog', { name: /銀行振込/ }).waitFor({ state: 'visible', timeout: 10000 })
  }

  test('トップページに「銀行振込で申し込む」テキストが存在する', async ({ page }) => {
    await page.goto('/')
    // ページ全体（JS描画後）に「銀行振込で申し込む」という文字が存在すること
    // PayjpModalを開いてから確認する
    const payjpTrigger = page
      .getByRole('button', { name: /プラン選択モーダルを開く|申し込みモーダルを開く/ })
      .first()
    await payjpTrigger.waitFor({ state: 'visible', timeout: 15000 })
    await payjpTrigger.click()
    const bankLink = page.getByRole('button', { name: '銀行振込で申し込むフォームを開く' })
    await expect(bankLink).toBeVisible({ timeout: 10000 })
    await expect(bankLink).toHaveText('銀行振込で申し込む')
  })

  test('「銀行振込で申し込む」クリックでモーダルが開く', async ({ page }) => {
    await openBankTransferModal(page)
    const dialog = page.getByRole('dialog', { name: /銀行振込/ })
    await expect(dialog).toBeVisible()
    // モーダルのh2タイトルが表示されていること
    const modalHeading = dialog.getByRole('heading', { name: '銀行振込で申し込む' })
    await expect(modalHeading).toBeVisible({ timeout: 5000 })
  })

  test('個人プランと事業所プランのラジオボタンが存在して切り替えられる', async ({ page }) => {
    await openBankTransferModal(page)
    const personalRadio = page.getByRole('radio', { name: /個人プラン/ })
    const businessRadio = page.getByRole('radio', { name: /事業所プラン/ })
    await expect(personalRadio).toBeVisible()
    await expect(businessRadio).toBeVisible()
    // 初期値は個人プラン
    await expect(personalRadio).toBeChecked()
    await expect(businessRadio).not.toBeChecked()
    // 事業所プランに切り替え
    await businessRadio.click()
    await expect(businessRadio).toBeChecked()
    await expect(personalRadio).not.toBeChecked()
    // 個人プランに戻す
    await personalRadio.click()
    await expect(personalRadio).toBeChecked()
  })

  test('名前・メールが空のまま送信するとバリデーションエラーが表示される', async ({ page }) => {
    await openBankTransferModal(page)
    // 送信ボタンをクリック（名前・メール空のまま）
    const submitBtn = page.getByRole('button', { name: '振込先をメールで受け取る' })
    await submitBtn.click()
    // バリデーションエラーが role="alert" で表示されること
    const nameError = page.getByRole('alert').filter({ hasText: 'お名前を入力してください' })
    const emailError = page.getByRole('alert').filter({ hasText: 'メールアドレスを入力してください' })
    await expect(nameError).toBeVisible({ timeout: 5000 })
    await expect(emailError).toBeVisible({ timeout: 5000 })
  })

  test('名前のみ入力でメール未入力だとメールエラーが表示される', async ({ page }) => {
    await openBankTransferModal(page)
    await page.getByLabel('お名前').fill('山田 太郎')
    const submitBtn = page.getByRole('button', { name: '振込先をメールで受け取る' })
    await submitBtn.click()
    const emailError = page.getByRole('alert').filter({ hasText: 'メールアドレスを入力してください' })
    await expect(emailError).toBeVisible({ timeout: 5000 })
    // 名前エラーは出ないこと
    const nameError = page.locator('#bt-name-error')
    await expect(nameError).toHaveCount(0)
  })

  test('不正なメールアドレスを入力するとバリデーションエラーが表示される', async ({ page }) => {
    await openBankTransferModal(page)
    await page.getByLabel('お名前').fill('山田 太郎')
    await page.getByLabel('メールアドレス').fill('invalid-email')
    const submitBtn = page.getByRole('button', { name: '振込先をメールで受け取る' })
    await submitBtn.click()
    const emailError = page.getByRole('alert').filter({ hasText: '正しいメールアドレスを入力してください' })
    await expect(emailError).toBeVisible({ timeout: 5000 })
  })

  test('正しい入力でAPIモック時に送信が実行される', async ({ page }) => {
    // /api/bank-transfer をモックして成功レスポンスを返す
    await page.route('**/api/bank-transfer', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true }),
        })
      } else {
        await route.continue()
      }
    })
    await openBankTransferModal(page)
    await page.getByLabel('お名前').fill('山田 太郎')
    await page.getByLabel('メールアドレス').fill('taro@example.com')
    const submitBtn = page.getByRole('button', { name: '振込先をメールで受け取る' })
    await expect(submitBtn).toBeEnabled()
    await submitBtn.click()
    // 成功状態（「お申し込みを受け付けました」）が表示されること
    await expect(page.getByText('お申し込みを受け付けました')).toBeVisible({ timeout: 10000 })
  })

  test('モーダルを閉じるボタンでモーダルが消える', async ({ page }) => {
    await openBankTransferModal(page)
    const closeBtn = page.getByRole('button', { name: '銀行振込申し込みモーダルを閉じる' })
    await expect(closeBtn).toBeVisible()
    await closeBtn.click()
    // モーダルが消えること
    const dialog = page.getByRole('dialog', { name: /銀行振込/ })
    await expect(dialog).toHaveCount(0, { timeout: 5000 })
  })

  test('BankTransferModal開いた状態でaxe-core違反が0件', async ({ page }) => {
    await openBankTransferModal(page)
    // BankTransferModal のダイアログ内のみをスコープにして検査
    const dialogLocator = page.getByRole('dialog', { name: /銀行振込/ })
    const results = await new AxeBuilder({ page })
      .include(await dialogLocator.evaluate(el => {
        // ダイアログ要素に一意IDを付けて include する
        if (!el.id) el.id = '__axe-bank-transfer-dialog'
        return '#' + el.id
      }))
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(results.violations).toEqual([])
  })
})
