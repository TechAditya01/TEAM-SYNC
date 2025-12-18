-- Add hackathon features: voting, comments, user profiles

-- Add voting columns to alerts table
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS downvotes INTEGER DEFAULT 0;

-- Create alert_comments table
CREATE TABLE IF NOT EXISTS alert_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_votes table to track individual votes
CREATE TABLE IF NOT EXISTS user_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, alert_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_alert_comments_alert_id ON alert_comments(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_comments_user_id ON alert_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_votes_user_id ON user_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_votes_alert_id ON user_votes(alert_id);

-- Enable RLS on new tables
ALTER TABLE alert_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_votes ENABLE ROW LEVEL SECURITY;

-- RLS policies for alert_comments
CREATE POLICY "Anyone can view comments" ON alert_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON alert_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON alert_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON alert_comments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for user_votes
CREATE POLICY "Users can view their own votes" ON user_votes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can vote" ON user_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON user_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON user_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update vote counts
CREATE OR REPLACE FUNCTION update_alert_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE alerts
  SET
    upvotes = (SELECT COUNT(*) FROM user_votes WHERE alert_id = NEW.alert_id AND vote_type = 'up'),
    downvotes = (SELECT COUNT(*) FROM user_votes WHERE alert_id = NEW.alert_id AND vote_type = 'down')
  WHERE id = NEW.alert_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update vote counts
DROP TRIGGER IF EXISTS trigger_update_alert_vote_counts ON user_votes;
CREATE TRIGGER trigger_update_alert_vote_counts
  AFTER INSERT OR UPDATE OR DELETE ON user_votes
  FOR EACH ROW EXECUTE FUNCTION update_alert_vote_counts();

-- Add reputation system to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reputation INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alerts_submitted INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alerts_verified INTEGER DEFAULT 0;

-- Function to update user reputation
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS TRIGGER AS $$
BEGIN
  -- Update reputation based on alerts submitted and verified
  UPDATE profiles
  SET
    reputation = (
      (SELECT COUNT(*) FROM alerts WHERE user_id = NEW.user_id AND status = 'verified') * 10 +
      (SELECT COUNT(*) FROM alerts WHERE user_id = NEW.user_id) * 2 +
      (SELECT COUNT(*) FROM alert_comments WHERE user_id = NEW.user_id) * 1
    ),
    alerts_submitted = (SELECT COUNT(*) FROM alerts WHERE user_id = NEW.user_id),
    alerts_verified = (SELECT COUNT(*) FROM alerts WHERE user_id = NEW.user_id AND status = 'verified')
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for reputation updates
DROP TRIGGER IF EXISTS trigger_update_reputation_on_alert ON alerts;
CREATE TRIGGER trigger_update_reputation_on_alert
  AFTER INSERT OR UPDATE OR DELETE ON alerts
  FOR EACH ROW EXECUTE FUNCTION update_user_reputation();

DROP TRIGGER IF EXISTS trigger_update_reputation_on_comment ON alert_comments;
CREATE TRIGGER trigger_update_reputation_on_comment
  AFTER INSERT OR UPDATE OR DELETE ON alert_comments
  FOR EACH ROW EXECUTE FUNCTION update_user_reputation();
