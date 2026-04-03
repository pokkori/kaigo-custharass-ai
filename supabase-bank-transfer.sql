-- 銀行振込申し込みテーブル
-- Supabase SQL Editorで実行してください

CREATE TABLE IF NOT EXISTS bank_transfer_applications (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name             text NOT NULL,
  email            text NOT NULL,
  plan             text NOT NULL,
  plan_label       text NOT NULL,
  amount           integer NOT NULL,
  is_active        boolean NOT NULL DEFAULT false,
  activation_token text NOT NULL UNIQUE,
  app_id           text NOT NULL DEFAULT 'kaigo-cusharass-ai',
  activated_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_bta_email   ON bank_transfer_applications (email);
CREATE INDEX IF NOT EXISTS idx_bta_token   ON bank_transfer_applications (activation_token);
CREATE INDEX IF NOT EXISTS idx_bta_app_id  ON bank_transfer_applications (app_id);

-- RLS: service_role のみアクセス可（APIルートはservice_role_keyを使用）
ALTER TABLE bank_transfer_applications ENABLE ROW LEVEL SECURITY;

-- service_role は RLS をバイパスするので追加ポリシー不要
-- 管理者が Supabase Dashboard から閲覧するためのポリシー（オプション）
-- CREATE POLICY "authenticated users can read" ON bank_transfer_applications
--   FOR SELECT USING (auth.role() = 'authenticated');
