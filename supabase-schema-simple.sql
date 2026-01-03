-- Simple schema without RLS for development
-- Create tables for Pulse app

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Disable RLS for now
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_messages DISABLE ROW LEVEL SECURITY;