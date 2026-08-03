-- HeroPath MVP Schema (Supabase)

-- 1. Users
-- Extending Supabase Auth (auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Resumes
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    parsed_text TEXT,
    parsed_json JSONB, -- { skills: [], experience_claims: [], education: [], summary: "" }
    target_role VARCHAR(255),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Gap Analyses
CREATE TABLE gap_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    missing_skills JSONB, -- array of { skill, why_it_matters }
    match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
    action_plan JSONB, -- array of { skill, reason, micro_module }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Roadmaps
CREATE TABLE roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_role VARCHAR(255),
    weeks JSONB, -- array of { week_number, topic, resources, completed }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Interview Sessions
CREATE TABLE interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
    target_role VARCHAR(255),
    questions JSONB, -- array of { question, source_claim, user_answer, feedback }
    status VARCHAR(50) DEFAULT 'in_progress',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS (Row Level Security) - Important for Supabase
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gap_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

-- Create Policies for RLS (Allowing users to access only their own data)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own resumes" ON resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resumes" ON resumes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own gap analyses" ON gap_analyses FOR SELECT USING (
    resume_id IN (SELECT id FROM resumes WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert own gap analyses" ON gap_analyses FOR INSERT WITH CHECK (
    resume_id IN (SELECT id FROM resumes WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view own roadmaps" ON roadmaps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own roadmaps" ON roadmaps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own roadmaps" ON roadmaps FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own interviews" ON interview_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own interviews" ON interview_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own interviews" ON interview_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
