-- RLS版スキーマ - カスタム認証 + 適切なセキュリティポリシー
-- 実行前にSupabaseダッシュボードでの設定が必要です

-- 既存テーブル削除
DROP TABLE IF EXISTS event_messages CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 注意: この前に supabase-rls-functions.sql を実行してください

-- Users テーブル
CREATE TABLE users (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  pairing_code TEXT UNIQUE NOT NULL,
  partner_id UUID REFERENCES users(id),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events テーブル
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  shared_with_partner BOOLEAN DEFAULT true
);

-- Event messages テーブル
CREATE TABLE event_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  author TEXT CHECK (author IN ('me', 'partner')) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL
);

-- インデックス
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_event_messages_event_id ON event_messages(event_id);
CREATE INDEX idx_users_pairing_code ON users(pairing_code);
CREATE INDEX idx_users_name_code ON users(name, pairing_code);

-- RLS有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_messages ENABLE ROW LEVEL SECURITY;

-- Users テーブルのRLSポリシー
-- 自分のデータと、自分がパートナーのデータのみアクセス可能
CREATE POLICY "Users can view own and partner data" ON users
  FOR SELECT USING (
    id = get_current_pulse_user_id() OR 
    partner_id = get_current_pulse_user_id()
  );

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (id = get_current_pulse_user_id())
  WITH CHECK (id = get_current_pulse_user_id());

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (id = get_current_pulse_user_id());

-- Events テーブルのRLSポリシー
-- 自分のイベントと、パートナーのイベントにアクセス可能
CREATE POLICY "Users can view own and partner events" ON events
  FOR SELECT USING (
    user_id = get_current_pulse_user_id() OR 
    user_id IN (
      SELECT partner_id FROM users 
      WHERE id = get_current_pulse_user_id() AND partner_id IS NOT NULL
    )
  );

CREATE POLICY "Users can manage own events" ON events
  FOR ALL USING (user_id = get_current_pulse_user_id())
  WITH CHECK (user_id = get_current_pulse_user_id());

-- Event messages テーブルのRLSポリシー
CREATE POLICY "Users can view accessible event messages" ON event_messages
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events WHERE 
        user_id = get_current_pulse_user_id() OR 
        user_id IN (
          SELECT partner_id FROM users 
          WHERE id = get_current_pulse_user_id() AND partner_id IS NOT NULL
        )
    )
  );

CREATE POLICY "Users can insert messages for accessible events" ON event_messages
  FOR INSERT WITH CHECK (
    user_id = get_current_pulse_user_id() AND
    event_id IN (
      SELECT id FROM events WHERE 
        user_id = get_current_pulse_user_id() OR 
        user_id IN (
          SELECT partner_id FROM users 
          WHERE id = get_current_pulse_user_id() AND partner_id IS NOT NULL
        )
    )
  );

-- リアルタイム機能有効化
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE users;