-- Clean setup for Pulse app - drop and recreate all tables
-- Execute this after dropping all existing tables

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS event_messages CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop all existing policies (just in case)
DROP POLICY IF EXISTS "Users can manage own data" ON users;
DROP POLICY IF EXISTS "Users can view partner data" ON users;
DROP POLICY IF EXISTS "Users can manage own events" ON events;
DROP POLICY IF EXISTS "Users can view partner events" ON events;
DROP POLICY IF EXISTS "Users can manage own messages" ON event_messages;

-- Users table (standalone, no auth.users dependency)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  pairing_code TEXT UNIQUE NOT NULL,
  partner_id UUID REFERENCES users(id),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
CREATE INDEX idx_users_name_code ON users(name, pairing_code);

-- Completely disable RLS for simplicity
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_messages DISABLE ROW LEVEL SECURITY;

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE users;