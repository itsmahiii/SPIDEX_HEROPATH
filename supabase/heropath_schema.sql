-- HeroPath MVP Schema (Supabase) - No Auth (MVP Mode)

-- 1. Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert Dummy User
INSERT INTO users (id, email) VALUES ('00000000-0000-0000-0000-000000000000', 'demo@heropath.ai') ON CONFLICT DO NOTHING;

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

-- WE ARE DISABLING RLS FOR THIS HACKATHON MVP
-- All tables are publicly readable and writable by anyone with the Anon Key
