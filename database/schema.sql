-- SQLite schema for BasketBuddy

CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS grocery_lists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  color TEXT,
  FOREIGN KEY (created_by) REFERENCES members(id)
);

CREATE TABLE IF NOT EXISTS list_shares (
  list_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  PRIMARY KEY (list_id, member_id),
  FOREIGN KEY (list_id) REFERENCES grocery_lists(id),
  FOREIGN KEY (member_id) REFERENCES members(id)
);

CREATE TABLE IF NOT EXISTS grocery_items (
  id TEXT PRIMARY KEY,
  list_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  quantity REAL NOT NULL,
  unit TEXT,
  added_by TEXT,
  added_at TEXT NOT NULL,
  FOREIGN KEY (list_id) REFERENCES grocery_lists(id),
  FOREIGN KEY (added_by) REFERENCES members(id)
);

-- BasketBuddy Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- nullable for OAuth users
    name VARCHAR(255) NOT NULL,
    avatar VARCHAR(10) DEFAULT '👤',
    phone VARCHAR(20),
    location VARCHAR(255),
    bio TEXT,
    date_of_birth DATE,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- User preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    language VARCHAR(10) DEFAULT 'en',
    currency VARCHAR(10) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'UTC',
    notifications JSONB DEFAULT '{
        "email": true,
        "push": true,
        "listUpdates": true,
        "aiRecommendations": true,
        "weeklyReports": false
    }',
    dietary_restrictions JSONB DEFAULT '{
        "vegetarian": false,
        "vegan": false,
        "glutenFree": false,
        "dairyFree": false,
        "nutFree": false,
        "organic": false
    }',
    shopping_preferences JSONB DEFAULT '{
        "budgetAlerts": true,
        "priceTracking": true,
        "expirationReminders": true,
        "autoSort": false,
        "smartSuggestions": true
    }',
    privacy_settings JSONB DEFAULT '{
        "shareAnalytics": true,
        "publicProfile": false,
        "showOnlineStatus": true
    }',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Family groups table
CREATE TABLE family_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    invite_code VARCHAR(20) UNIQUE DEFAULT encode(gen_random_bytes(10), 'base64'),
    max_members INTEGER DEFAULT 10 CHECK (max_members > 0 AND max_members <= 50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Family members table
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_group_id UUID REFERENCES family_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
    joined_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(family_group_id, user_id)
);

-- Grocery lists table
CREATE TABLE grocery_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    family_group_id UUID REFERENCES family_groups(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    color VARCHAR(100) DEFAULT 'bg-gradient-to-br from-primary/20 to-secondary/10',
    is_template BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    due_date TIMESTAMP,
    budget_limit DECIMAL(10,2) CHECK (budget_limit >= 0),
    total_spent DECIMAL(10,2) DEFAULT 0 CHECK (total_spent >= 0),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Grocery items table
CREATE TABLE grocery_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grocery_list_id UUID REFERENCES grocery_lists(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'Other',
    quantity DECIMAL(10,2) DEFAULT 1 CHECK (quantity > 0),
    unit VARCHAR(50) DEFAULT 'piece',
    price DECIMAL(10,2) CHECK (price >= 0),
    notes TEXT,
    is_purchased BOOLEAN DEFAULT FALSE,
    purchased_by UUID REFERENCES users(id) ON DELETE SET NULL,
    purchased_at TIMESTAMP,
    added_by UUID REFERENCES users(id) ON DELETE SET NULL,
    priority INTEGER DEFAULT 1 CHECK (priority IN (1, 2, 3)), -- 1=low, 2=medium, 3=high
    expiration_date DATE,
    barcode VARCHAR(50),
    brand VARCHAR(100),
    store VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- List sharing table
CREATE TABLE list_sharing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grocery_list_id UUID REFERENCES grocery_lists(id) ON DELETE CASCADE,
    shared_with_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permission_level VARCHAR(20) DEFAULT 'edit' CHECK (permission_level IN ('view', 'edit', 'admin')),
    shared_by UUID REFERENCES users(id) ON DELETE SET NULL,
    shared_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(grocery_list_id, shared_with_user_id)
);

-- Activity log table
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    family_group_id UUID REFERENCES family_groups(id) ON DELETE CASCADE,
    grocery_list_id UUID REFERENCES grocery_lists(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- AI recommendations table
CREATE TABLE ai_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    grocery_list_id UUID REFERENCES grocery_lists(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL,
    content JSONB NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    is_accepted BOOLEAN,
    is_dismissed BOOLEAN DEFAULT FALSE,
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    feedback_comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User sessions table (for JWT token management)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_used TIMESTAMP DEFAULT NOW()
);

-- Price history table (for price tracking)
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    brand VARCHAR(100),
    store VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50),
    location VARCHAR(255),
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Shopping templates table
CREATE TABLE shopping_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    family_group_id UUID REFERENCES family_groups(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    template_data JSONB NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_last_login ON users(last_login);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

CREATE INDEX idx_family_groups_created_by ON family_groups(created_by);
CREATE INDEX idx_family_groups_invite_code ON family_groups(invite_code);

CREATE INDEX idx_family_members_family_group_id ON family_members(family_group_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);

CREATE INDEX idx_grocery_lists_family_group_id ON grocery_lists(family_group_id);
CREATE INDEX idx_grocery_lists_created_by ON grocery_lists(created_by);
CREATE INDEX idx_grocery_lists_created_at ON grocery_lists(created_at);
CREATE INDEX idx_grocery_lists_due_date ON grocery_lists(due_date);

CREATE INDEX idx_grocery_items_list_id ON grocery_items(grocery_list_id);
CREATE INDEX idx_grocery_items_added_by ON grocery_items(added_by);
CREATE INDEX idx_grocery_items_category ON grocery_items(category);
CREATE INDEX idx_grocery_items_is_purchased ON grocery_items(is_purchased);
CREATE INDEX idx_grocery_items_created_at ON grocery_items(created_at);

CREATE INDEX idx_list_sharing_list_id ON list_sharing(grocery_list_id);
CREATE INDEX idx_list_sharing_user_id ON list_sharing(shared_with_user_id);

CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_family_group_id ON activity_log(family_group_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);
CREATE INDEX idx_activity_log_action_type ON activity_log(action_type);

CREATE INDEX idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX idx_ai_recommendations_list_id ON ai_recommendations(grocery_list_id);
CREATE INDEX idx_ai_recommendations_created_at ON ai_recommendations(created_at);
CREATE INDEX idx_ai_recommendations_expires_at ON ai_recommendations(expires_at);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

CREATE INDEX idx_price_history_item_name ON price_history(item_name);
CREATE INDEX idx_price_history_category ON price_history(category);
CREATE INDEX idx_price_history_recorded_at ON price_history(recorded_at);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_groups_updated_at BEFORE UPDATE ON family_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grocery_lists_updated_at BEFORE UPDATE ON grocery_lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grocery_items_updated_at BEFORE UPDATE ON grocery_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_templates_updated_at BEFORE UPDATE ON shopping_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update total_spent when items are purchased
CREATE OR REPLACE FUNCTION update_list_total_spent()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_purchased = TRUE AND OLD.is_purchased = FALSE THEN
        UPDATE grocery_lists 
        SET total_spent = total_spent + COALESCE(NEW.price, 0)
        WHERE id = NEW.grocery_list_id;
    ELSIF NEW.is_purchased = FALSE AND OLD.is_purchased = TRUE THEN
        UPDATE grocery_lists 
        SET total_spent = total_spent - COALESCE(OLD.price, 0)
        WHERE id = NEW.grocery_list_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_list_total_spent_trigger AFTER UPDATE ON grocery_items
    FOR EACH ROW EXECUTE FUNCTION update_list_total_spent();

-- Views for common queries
CREATE VIEW user_family_groups AS
SELECT 
    fg.id,
    fg.name,
    fg.description,
    fg.created_by,
    fg.invite_code,
    fg.max_members,
    fg.created_at,
    fm.user_id,
    fm.role,
    fm.joined_at
FROM family_groups fg
JOIN family_members fm ON fg.id = fm.family_group_id
WHERE fg.is_active = TRUE AND fm.is_active = TRUE;

CREATE VIEW list_with_stats AS
SELECT 
    gl.*,
    COUNT(gi.id) as item_count,
    COUNT(CASE WHEN gi.is_purchased = TRUE THEN 1 END) as purchased_count,
    SUM(CASE WHEN gi.is_purchased = TRUE THEN gi.price ELSE 0 END) as actual_spent
FROM grocery_lists gl
LEFT JOIN grocery_items gi ON gl.id = gi.grocery_list_id
WHERE gl.is_archived = FALSE
GROUP BY gl.id;

-- Sample data for development
INSERT INTO users (id, name, email, password_hash, avatar) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'John Doe', 'john@example.com', '$2b$10$example_hash', '👨'),
('550e8400-e29b-41d4-a716-446655440002', 'Jane Smith', 'jane@example.com', '$2b$10$example_hash', '👩'),
('550e8400-e29b-41d4-a716-446655440003', 'Alex Johnson', 'alex@example.com', '$2b$10$example_hash', '🧑');

INSERT INTO family_groups (id, name, description, created_by, invite_code) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'The Doe Family', 'Our family grocery sharing group', '550e8400-e29b-41d4-a716-446655440001', 'DOEFAM2025');

INSERT INTO family_members (family_group_id, user_id, role) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'admin'),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 'member'),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', 'member');

-- Grant permissions (adjust as needed for your environment)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
