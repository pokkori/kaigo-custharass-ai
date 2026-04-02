-- ==========================================
-- ストリーク機能 + Web Push サブスクリプション
-- Supabase テーブル定義
-- 実行: Supabase Dashboard > SQL Editor にペーストして実行
-- ==========================================

-- ストリーク管理テーブル
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE,
  streak_freeze_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ストリーク更新時に updated_at を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_user_streaks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_streaks_updated_at ON user_streaks;
CREATE TRIGGER trg_user_streaks_updated_at
  BEFORE UPDATE ON user_streaks
  FOR EACH ROW EXECUTE FUNCTION update_user_streaks_updated_at();

-- デイリーミッションテーブル
CREATE TABLE IF NOT EXISTS daily_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mission_date DATE DEFAULT CURRENT_DATE,
  mission_type TEXT NOT NULL,
  target_count INT DEFAULT 1,
  current_count INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  reward_xp INT DEFAULT 10,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, mission_date, mission_type)
);

-- Web Push サブスクリプションテーブル
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_push_subscriptions_updated_at ON push_subscriptions;
CREATE TRIGGER trg_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_push_subscriptions_updated_at();

-- RLS（Row Level Security）は Service Role Key 経由のサーバーサイドのみアクセス
-- アプリ側は SUPABASE_SERVICE_ROLE_KEY を使うため RLS は無効にしておく
ALTER TABLE user_streaks DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_missions DISABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions DISABLE ROW LEVEL SECURITY;
