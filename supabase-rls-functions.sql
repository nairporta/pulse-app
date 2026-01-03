-- RLS対応のカスタム関数（auth スキーマを使わない版）
-- この関数をSupabaseのSQL Editorで実行してください

-- セッション管理テーブル
CREATE TABLE IF NOT EXISTS pulse_sessions (
  connection_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_pulse_sessions_user_id ON pulse_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pulse_sessions_expires ON pulse_sessions(expires_at);

-- pulse_sessionsテーブルは一時的にRLSを無効にする
-- （循環参照を避けるため、このテーブルだけは制限なし）
ALTER TABLE pulse_sessions DISABLE ROW LEVEL SECURITY;

-- 注意: pulse_sessionsは内部管理用のため、直接アプリからアクセスしない

-- 期限切れセッション削除関数
CREATE OR REPLACE FUNCTION cleanup_pulse_sessions()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM pulse_sessions WHERE expires_at < NOW();
END;
$$;

-- 現在のユーザーID取得関数（publicスキーマ）
CREATE OR REPLACE FUNCTION get_current_pulse_user_id() 
RETURNS UUID 
LANGUAGE plpgsql 
STABLE 
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- カスタム設定から取得
  BEGIN
    user_id := current_setting('app.current_pulse_user_id', true)::UUID;
    IF user_id IS NOT NULL THEN
      RETURN user_id;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      NULL;
  END;
  
  -- セッションテーブルから取得
  SELECT ps.user_id INTO user_id 
  FROM pulse_sessions ps 
  WHERE ps.expires_at > NOW() 
  ORDER BY ps.created_at DESC 
  LIMIT 1;
  
  RETURN COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::UUID);
END;
$$;

-- セッション設定関数
CREATE OR REPLACE FUNCTION set_pulse_user_context(user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
AS $$
BEGIN
  -- 古いセッションをクリーンアップ
  PERFORM cleanup_pulse_sessions();
  
  -- 新しいセッションを作成
  INSERT INTO pulse_sessions (user_id) VALUES (user_id);
  
  -- アプリ設定でユーザーIDを設定
  PERFORM set_config('app.current_pulse_user_id', user_id::text, true);
  
  RETURN user_id;
END;
$$;

-- セッションクリア関数
CREATE OR REPLACE FUNCTION clear_pulse_user_context()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- 設定をクリア
  PERFORM set_config('app.current_pulse_user_id', '', true);
  
  -- セッションテーブルをクリーンアップ
  PERFORM cleanup_pulse_sessions();
END;
$$;