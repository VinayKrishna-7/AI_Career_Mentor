-- 001_initial_schema.sql
-- PostgreSQL Migration for AI Career Mentor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    education VARCHAR(255),
    degree VARCHAR(255),
    skills TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    experience_level VARCHAR(100) DEFAULT 'Beginner',
    target_career VARCHAR(255),
    career_goals TEXT,
    learning_preferences VARCHAR(100) DEFAULT 'Hands-on projects',
    weekly_study_hours INT DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- 3. CAREER ROLES
CREATE TABLE IF NOT EXISTS career_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    recommended_projects JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_career_roles_title ON career_roles(title);

-- 4. ROADMAPS
CREATE TABLE IF NOT EXISTS roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    career_role_id UUID REFERENCES career_roles(id) ON DELETE SET NULL,
    career_title VARCHAR(255) NOT NULL,
    roadmap_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON roadmaps(user_id);

-- 5. ROADMAP TASKS
CREATE TABLE IF NOT EXISTS roadmap_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    phase_name VARCHAR(255) NOT NULL,
    phase_order INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'Not Started', -- 'Not Started', 'Learning', 'Completed'
    estimated_hours INT DEFAULT 5,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_roadmap_id ON roadmap_tasks(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_status ON roadmap_tasks(status);

-- 6. CHAT CONVERSATIONS
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'Career Mentorship',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);

-- 7. CHAT MESSAGES
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'user', 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conv_id ON chat_messages(conversation_id);

-- 8. RESUME ANALYSES
CREATE TABLE IF NOT EXISTS resume_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_role VARCHAR(255),
    analysis_result JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resume_analyses_user_id ON resume_analyses(user_id);

-- 9. MOCK INTERVIEWS
CREATE TABLE IF NOT EXISTS mock_interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_role VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) NOT NULL DEFAULT 'Medium',
    interview_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mock_interviews_user_id ON mock_interviews(user_id);

-- 10. LEARNING RESOURCES
CREATE TABLE IF NOT EXISTS learning_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    skill_name VARCHAR(100),
    resource_type VARCHAR(100) DEFAULT 'Documentation',
    difficulty VARCHAR(50) DEFAULT 'Beginner',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_learning_resources_skill ON learning_resources(skill_name);
