-- 既存のpulse_sessionsテーブルのRLS設定を修正
-- このSQLをSupabaseのSQL Editorで実行してください

-- まず既存のポリシーがあれば削除
DROP POLICY IF EXISTS "Users can only access own sessions" ON pulse_sessions;

-- pulse_sessionsテーブルのRLSを無効化
-- （循環参照を避けるため）
ALTER TABLE pulse_sessions DISABLE ROW LEVEL SECURITY;

-- 確認: 現在のRLS設定状態を表示
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('pulse_sessions', 'users', 'events', 'event_messages')
ORDER BY tablename;