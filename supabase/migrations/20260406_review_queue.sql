-- review_queue テーブル
-- 審査待機中のタスクキューを管理
-- Claude Batch APIと連携して審査期間中にコンテンツを自動生成

create table if not exists review_queue (
  id uuid primary key default gen_random_uuid(),
  service_name text not null,           -- サービス名（例: 'kaigo-kasuhara-ai'）
  review_type text not null,            -- 審査種別（'komoju', 'app_store', 'adsense'）
  tasks text[] not null default '{}',   -- 実行タスク（'seo_meta', 'sns_posts', 'lp_improvements'）
  status text not null default 'pending', -- pending/batch_submitted/completed/failed
  run_after timestamptz not null default now(), -- 実行開始日時
  batch_id text,                        -- Claude Batch API のバッチID
  results jsonb,                        -- バッチ結果（キー: custom_id）
  submitted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- インデックス
create index idx_review_queue_status on review_queue(status);
create index idx_review_queue_run_after on review_queue(run_after) where status = 'pending';
create index idx_review_queue_batch_id on review_queue(batch_id) where status = 'batch_submitted';

-- updated_at 自動更新
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger review_queue_updated_at
  before update on review_queue
  for each row execute function update_updated_at_column();

-- RLS
alter table review_queue enable row level security;

-- サービスロールのみアクセス可能（cronはサービスロールキーで実行）
create policy "service_role_only" on review_queue
  for all using (auth.role() = 'service_role');

-- サンプルデータ（KOMOJU審査中の場合）
-- insert into review_queue (service_name, review_type, tasks, run_after)
-- values ('kaigo-kasuhara-ai', 'komoju', array['seo_meta', 'sns_posts', 'lp_improvements'], now());
