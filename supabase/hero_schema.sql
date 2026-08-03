-- Hero Schema for Mission 5: Train the Next Hero

-- Create custom types for Enums
CREATE TYPE quest_status AS ENUM ('assigned', 'completed', 'failed');
CREATE TYPE skill_status AS ENUM ('locked', 'in_progress', 'mastered');
CREATE TYPE quest_content_type AS ENUM ('reading', 'quiz', 'practical');
CREATE TYPE interview_status AS ENUM ('in_progress', 'completed');

-- 1. Users & Profiles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID, -- References auth.users(id) if using Supabase Auth
    display_name VARCHAR(255) NOT NULL,
    target_role VARCHAR(255),
    current_level INTEGER DEFAULT 1,
    total_xp INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. AI Resume Roaster
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_file_url TEXT,
    parsed_content JSONB,
    ats_score INTEGER,
    feedback_summary JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Interactive Skill Trees & Roadmaps
CREATE TABLE skill_trees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tree_id UUID NOT NULL REFERENCES skill_trees(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    parent_skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
    required_xp INTEGER DEFAULT 0
);

CREATE TABLE user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    status skill_status DEFAULT 'locked',
    progress_percentage INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_id)
);

-- 4. Contextual Action Plans (Quests)
CREATE TABLE quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content_type quest_content_type NOT NULL,
    content_payload JSONB,
    xp_reward INTEGER DEFAULT 0
);

CREATE TABLE user_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    status quest_status DEFAULT 'assigned',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, quest_id)
);

-- 5. "Prove It" Mock Interviews & Tone Detection
CREATE TABLE mock_interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
    status interview_status DEFAULT 'in_progress',
    overall_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE interview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES mock_interviews(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    context_source TEXT,
    expected_skills JSONB
);

CREATE TABLE interview_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES interview_questions(id) ON DELETE CASCADE,
    transcript TEXT,
    audio_url TEXT,
    duration_seconds INTEGER,
    filler_words_count INTEGER DEFAULT 0,
    speaking_rate_wpm INTEGER,
    composure_score INTEGER,
    technical_score INTEGER,
    ai_feedback TEXT
);

-- Create indexes for performance
CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_user_quests_user_id ON user_quests(user_id);
CREATE INDEX idx_mock_interviews_user_id ON mock_interviews(user_id);
