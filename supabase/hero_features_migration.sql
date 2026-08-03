-- Add new columns to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_profile JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS weak_spots JSONB;

-- Add completed_at to interview_sessions
ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Create interview_comparisons table
CREATE TABLE IF NOT EXISTS interview_comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id_old UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    session_id_new UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    improved_areas JSONB, -- array of strings
    still_weak_areas JSONB, -- array of strings
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS for interview_comparisons
ALTER TABLE interview_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own comparisons" ON interview_comparisons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own comparisons" ON interview_comparisons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comparisons" ON interview_comparisons FOR UPDATE USING (auth.uid() = user_id);
