-- Schema with proper RLS policies for anonymous auth
-- Create tables for Pulse app

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  pairing_code TEXT UNIQUE NOT NULL,
  partner_id UUID REFERENCES users(id)
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  shared_with_partner BOOLEAN DEFAULT true
);

-- Event messages table
CREATE TABLE IF NOT EXISTS event_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  author TEXT CHECK (author IN ('me', 'partner')) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_event_messages_event_id ON event_messages(event_id);
CREATE INDEX IF NOT EXISTS idx_users_pairing_code ON users(pairing_code);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage own data" ON users;
DROP POLICY IF EXISTS "Users can view partner data" ON users;
DROP POLICY IF EXISTS "Users can manage own events" ON events;
DROP POLICY IF EXISTS "Users can view partner events" ON events;
DROP POLICY IF EXISTS "Users can manage own messages" ON event_messages;

-- Users policies - authenticated users can manage their own data
CREATE POLICY "Users can manage own data" ON users
  FOR ALL USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view partner data" ON users
  FOR SELECT USING (
    auth.uid() = partner_id OR 
    auth.uid() IN (SELECT partner_id FROM users WHERE id = auth.uid())
  );

-- Events policies 
CREATE POLICY "Users can manage own events" ON events
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view partner events" ON events
  FOR SELECT USING (
    user_id IN (
      SELECT partner_id FROM users WHERE id = auth.uid()
      UNION
      SELECT id FROM users WHERE partner_id = auth.uid()
    )
  );

-- Event messages policies
CREATE POLICY "Users can manage own messages" ON event_messages
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable anonymous authentication
-- (This needs to be enabled in Supabase Dashboard > Authentication > Settings)

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_messages;