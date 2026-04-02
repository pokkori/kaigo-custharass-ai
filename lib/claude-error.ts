/**
 * Claude API エラーハンドリングユーティリティ
 * 429（レート制限）・529（過負荷）・タイムアウト時のリトライ＆ユーザー向けメッセージ
 */

export interface ClaudeErrorResult {
  ok: false;
  message: string;
  retryable: boolean;
  status: number;
}

/** HTTPステータスコードからユーザー向けエラーメッセージを生成 */
export function getClaudeErrorMessage(status: number, message?: string): string {
  const messages: Record<number, string> = {
    429: "アクセスが集中しています。少し待ってから再試行してください。",
    529: "AIサーバーが混雑しています。しばらくお待ちください。",
    401: "APIキーが無効です。管理者にお問い合わせください。",
    413: "入力が長すぎます。テキストを短くして再試行してください。",
    500: "AIサービスで一時的なエラーが発生しました。もう一度お試しください。",
    503: "AIサービスが一時的に利用できません。しばらくお待ちください。",
  };
  return messages[status] ?? message ?? `エラーが発生しました（コード: ${status}）`;
}

/** リトライ可能なステータスコードか判定 */
export function isRetryableStatus(status: number): boolean {
  return [429, 500, 503, 529].includes(status);
}

/** 指数バックオフで待機（ジッター付き） */
export async function waitWithBackoff(attempt: number, baseMs = 1000): Promise<void> {
  const delay = baseMs * Math.pow(2, attempt) + Math.random() * 500;
  await new Promise(resolve => setTimeout(resolve, Math.min(delay, 30000)));
}

/** API Route の catch ブロックで使う共通エラーレスポンス生成 */
export function createErrorResponse(error: unknown): Response {
  console.error("[Claude API Error]", error);

  if (error instanceof Error) {
    const status = (error as unknown as { status?: number }).status ?? 500;
    const message = getClaudeErrorMessage(status, error.message);
    return Response.json({ error: message }, { status: isRetryableStatus(status) ? 503 : 400 });
  }

  return Response.json(
    { error: "予期しないエラーが発生しました。もう一度お試しください。" },
    { status: 500 }
  );
}
