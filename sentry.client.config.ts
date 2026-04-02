import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV ?? "production",
  // パフォーマンス監視（本番10%サンプリング）
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  // 404エラーは無視
  ignoreErrors: ["NotFoundError", "NEXT_NOT_FOUND"],
  beforeSend(event) {
    // APIキーなどの機密情報をフィルタ
    if (event.request?.headers) {
      delete (event.request.headers as Record<string, unknown>)["authorization"];
      delete (event.request.headers as Record<string, unknown>)["x-api-key"];
    }
    return event;
  },
});
