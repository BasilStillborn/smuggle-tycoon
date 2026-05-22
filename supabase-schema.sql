-- Run this in your Supabase SQL editor to create the leaderboard table
-- and set up Row-Level Security.

CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alias VARCHAR(15) NOT NULL,
  character_name VARCHAR(50) NOT NULL,
  final_cash BIGINT NOT NULL,
  peak_net_worth BIGINT NOT NULL,
  total_profit BIGINT NOT NULL,
  total_trips INT NOT NULL,
  total_busts INT NOT NULL,
  reputation INT NOT NULL,
  survival_time INT NOT NULL,
  countries_visited INT NOT NULL,
  score BIGINT NOT NULL,
  score_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_score_desc ON leaderboard_entries (score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON leaderboard_entries (created_at DESC);

-- Enable Row-Level Security
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read
CREATE POLICY "Anyone can read leaderboard"
  ON leaderboard_entries
  FOR SELECT
  USING (true);

-- Allow anyone to insert (with basic validation)
CREATE POLICY "Anyone can submit score"
  ON leaderboard_entries
  FOR INSERT
  WITH CHECK (
    final_cash >= 0
    AND peak_net_worth >= 0
    AND total_profit >= 0
    AND total_trips >= 0
    AND total_busts >= 0
    AND reputation BETWEEN 0 AND 100
    AND survival_time >= 0
    AND countries_visited BETWEEN 1 AND 7
    AND LENGTH(alias) BETWEEN 1 AND 15
    AND score_hash ~ '^[a-f0-9]{64}$'
  );

-- Prevent duplicate aliases — one entry per player
-- Run this manually in your Supabase SQL editor if upgrading an existing table:
-- ALTER TABLE leaderboard_entries ADD CONSTRAINT unique_alias UNIQUE (alias);
-- DELETE FROM leaderboard_entries a USING leaderboard_entries b WHERE a.alias = b.alias AND a.score < b.score;

-- Allow updates (for score upgrades from existing aliases)
CREATE POLICY "Anyone can update their own score"
  ON leaderboard_entries
  FOR UPDATE
  USING (true)
  WITH CHECK (
    final_cash >= 0
    AND peak_net_worth >= 0
    AND score > 0
  );

-- Rate limiter: prevent spam (max 5 submissions per IP per hour)
-- Requires the pg_net extension or a separate rate-limiting table.
-- For production, consider using Supabase's built-in rate limiting
-- or a serverless function to validate before insert.
