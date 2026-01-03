-- Create tables for Pulse app

-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  pairing_code TEXT UNIQUE NOT NULL,
  partner_id UUID REFERENCES users(id)
);

-- Events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  shared_with_partner BOOLEAN DEFAULT true
);

-- Event messages table
CREATE TABLE event_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  author TEXT CHECK (author IN ('me', 'partner')) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL
);

-- Indexes for better performance
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_event_messages_event_id ON event_messages(event_id);
CREATE INDEX idx_users_pairing_code ON users(pairing_code);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_messages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data and their partner's data
CREATE POLICY "Users can view own and partner data" ON users
  FOR SELECT USING (
    id = auth.uid()::text::uuid 
    OR partner_id = auth.uid()::text::uuid
  );

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (id = auth.uid()::text::uuid);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (id = auth.uid()::text::uuid);

-- Events policies
CREATE POLICY "Users can view own and partner events" ON events
  FOR SELECT USING (
    user_id = auth.uid()::text::uuid 
    OR user_id IN (
      SELECT partner_id FROM users WHERE id = auth.uid()::text::uuid
    )
  );

CREATE POLICY "Users can insert own events" ON events
  FOR INSERT WITH CHECK (user_id = auth.uid()::text::uuid);

CREATE POLICY "Users can update own events" ON events
  FOR UPDATE USING (user_id = auth.uid()::text::uuid);

CREATE POLICY "Users can delete own events" ON events
  FOR DELETE USING (user_id = auth.uid()::text::uuid);

-- Event messages policies
CREATE POLICY "Users can view messages for accessible events" ON event_messages
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events WHERE 
        user_id = auth.uid()::text::uuid 
        OR user_id IN (
          SELECT partner_id FROM users WHERE id = auth.uid()::text::uuid
        )
    )
  );

CREATE POLICY "Users can insert messages for accessible events" ON event_messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid()::text::uuid
    AND event_id IN (
      SELECT id FROM events WHERE 
        user_id = auth.uid()::text::uuid 
        OR user_id IN (
          SELECT partner_id FROM users WHERE id = auth.uid()::text::uuid
        )
    )
  );

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_messages;