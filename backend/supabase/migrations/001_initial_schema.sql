-- ElderConnect+ Initial Schema
-- GDPR-compliant PostgreSQL schema for community-driven elderly support platform
-- Created: 2024
-- Purpose: Complete schema for user management, messaging, emergency, and donations

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM (
    'ELDER',
    'VOLUNTEER',
    'PROFESSIONAL',
    'FAMILY',
    'ADMIN'
);

CREATE TYPE verification_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'EXPIRED'
);

CREATE TYPE companion_request_status AS ENUM (
    'PENDING',
    'ACCEPTED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);

CREATE TYPE task_status AS ENUM (
    'OPEN',
    'ASSIGNED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);

CREATE TYPE emergency_status AS ENUM (
    'TRIGGERED',
    'ACKNOWLEDGED',
    'RESPONDED',
    'RESOLVED',
    'FALSE_ALARM'
);

CREATE TYPE audit_action AS ENUM (
    'CREATE',
    'READ',
    'UPDATE',
    'DELETE',
    'LOGIN',
    'LOGOUT',
    'DATA_EXPORT',
    'DATA_DELETE'
);

-- ============================================================================
-- MAIN TABLES
-- ============================================================================

-- Users table (Core authentication & profile)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) DEFAULT '',
    date_of_birth DATE,
    role user_role NOT NULL DEFAULT 'ELDER',
    profile_picture_url TEXT,
    bio TEXT,
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    postcode VARCHAR(10),
    country VARCHAR(100) DEFAULT 'UK',
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    preferred_language VARCHAR(5) DEFAULT 'en',
    accessibility_large_fonts BOOLEAN DEFAULT FALSE,
    accessibility_high_contrast BOOLEAN DEFAULT FALSE,
    accessibility_voice_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    data_consent BOOLEAN DEFAULT FALSE,
    consent_date TIMESTAMP WITH TIME ZONE,
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Background Verification (for volunteers and professionals)
CREATE TABLE background_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    status verification_status DEFAULT 'PENDING',
    verification_type VARCHAR(50) NOT NULL, -- 'DBS_CHECK', 'REFERENCE_CHECK', 'ID_VERIFICATION'
    verified_by_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    verification_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_type CHECK (verification_type IN ('DBS_CHECK', 'REFERENCE_CHECK', 'ID_VERIFICATION'))
);

-- User Qualifications (for professionals)
CREATE TABLE user_qualifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    qualification_name VARCHAR(200) NOT NULL,
    issuing_organization VARCHAR(200),
    issue_date DATE,
    expiry_date DATE,
    document_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Companion Requests (Elder requesting volunteer)
CREATE TABLE companion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    elder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status companion_request_status DEFAULT 'PENDING',
    requested_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accepted_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    activity_type VARCHAR(100), -- 'SHOPPING', 'VISIT', 'ERRANDS', 'SOCIAL_ACTIVITY'
    description TEXT,
    preferred_time_start TIME,
    preferred_time_end TIME,
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),
    rating_by_elder DECIMAL(2, 1),
    feedback_by_elder TEXT,
    rating_by_volunteer DECIMAL(2, 1),
    feedback_by_volunteer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_activity CHECK (activity_type IN ('SHOPPING', 'VISIT', 'ERRANDS', 'SOCIAL_ACTIVITY', 'OTHER'))
);

-- Task Assistance (Professional services booking)
CREATE TABLE task_assistance_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    elder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    status task_status DEFAULT 'OPEN',
    task_category VARCHAR(100) NOT NULL, -- 'HEALTHCARE', 'LEGAL', 'FINANCIAL', 'HOME_REPAIR', 'TECHNOLOGY'
    task_description TEXT NOT NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    estimated_duration_minutes INTEGER,
    actual_duration_minutes INTEGER,
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),
    is_virtual BOOLEAN DEFAULT FALSE,
    rating DECIMAL(2, 1),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_category CHECK (task_category IN ('HEALTHCARE', 'LEGAL', 'FINANCIAL', 'HOME_REPAIR', 'TECHNOLOGY', 'OTHER'))
);

-- Medication Reminders
CREATE TABLE medication_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100), -- 'ONCE_DAILY', 'TWICE_DAILY', 'THREE_TIMES_DAILY', 'AS_NEEDED'
    time_of_day TIME,
    start_date DATE NOT NULL,
    end_date DATE,
    notes TEXT,
    reminder_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Health Check-ins (Daily wellness log)
CREATE TABLE health_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    checkin_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    mood_level INTEGER CHECK (mood_level BETWEEN 1 AND 5),
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
    physical_pain_level INTEGER CHECK (physical_pain_level BETWEEN 0 AND 10),
    sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
    notes TEXT,
    medication_taken BOOLEAN,
    meals_eaten INTEGER CHECK (meals_eaten BETWEEN 0 AND 3),
    water_intake_glasses INTEGER,
    exercise_minutes INTEGER,
    social_interactions_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Emergency Alerts
CREATE TABLE emergency_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status emergency_status DEFAULT 'TRIGGERED',
    alert_type VARCHAR(50) NOT NULL, -- 'HEALTH_EMERGENCY', 'SECURITY_THREAT', 'ACCIDENT', 'OTHER'
    description TEXT,
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    acknowledged_by_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    responded_by_volunteer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    responded_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_alert_type CHECK (alert_type IN ('HEALTH_EMERGENCY', 'SECURITY_THREAT', 'ACCIDENT', 'OTHER'))
);

-- In-App Messages (Chat)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT,
    message_type VARCHAR(20) DEFAULT 'TEXT', -- 'TEXT', 'IMAGE', 'VIDEO', 'FILE'
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT different_users CHECK (sender_id != recipient_id)
);

-- Video Call Scheduling
CREATE TABLE video_call_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    call_type VARCHAR(20) NOT NULL DEFAULT 'ONE_TO_ONE', -- 'ONE_TO_ONE', 'GROUP'
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    call_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'ACTIVE', 'COMPLETED', 'MISSED', 'DECLINED'
    video_room_id VARCHAR(255), -- Jitsi Meet room ID or similar
    recording_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT different_call_users CHECK (initiator_id != recipient_id)
);

-- Community Events
CREATE TABLE community_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    event_end_date TIMESTAMP WITH TIME ZONE,
    location_name VARCHAR(255),
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),
    event_type VARCHAR(50), -- 'SOCIAL', 'EDUCATIONAL', 'HEALTH', 'WELLNESS', 'COMMUNITY_SUPPORT'
    max_participants INTEGER,
    image_url TEXT,
    is_virtual BOOLEAN DEFAULT FALSE,
    virtual_meeting_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event Attendees
CREATE TABLE event_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES community_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attendance_status VARCHAR(20) DEFAULT 'INTERESTED', -- 'INTERESTED', 'ATTENDING', 'DECLINED', 'ATTENDED', 'NO_SHOW'
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);

-- Family Dashboard Access (Multi-family member view for elder)
CREATE TABLE family_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    elder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    family_member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relationship VARCHAR(100), -- 'CHILD', 'SPOUSE', 'SIBLING', 'GRANDCHILD', 'OTHER'
    access_level VARCHAR(50) DEFAULT 'VIEW_HEALTH_ONLY', -- 'VIEW_HEALTH_ONLY', 'VIEW_ALL', 'EDIT_PROFILE'
    verified BOOLEAN DEFAULT FALSE,
    verified_by_elder BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(10),
    verification_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(elder_id, family_member_id)
);

-- Donations (Monetary support)
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    donation_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    donation_type VARCHAR(50), -- 'ONE_TIME', 'MONTHLY_SUBSCRIPTION', 'ANNUAL_SUBSCRIPTION'
    donation_method VARCHAR(50), -- 'CARD', 'BANK_TRANSFER', 'PAYPAL', 'APPLE_PAY', 'GOOGLE_PAY'
    is_anonymous BOOLEAN DEFAULT FALSE,
    donor_message TEXT,
    status VARCHAR(20) DEFAULT 'COMPLETED', -- 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'
    payment_reference VARCHAR(255),
    receipt_email VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT donation_amount_positive CHECK (donation_amount > 0)
);

-- Donation Impact (Track what donations funded)
CREATE TABLE donation_impacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    impact_title VARCHAR(255) NOT NULL,
    impact_description TEXT,
    category VARCHAR(100), -- 'FEATURE_DEVELOPMENT', 'INFRASTRUCTURE', 'VOLUNTEER_TRAINING', 'COMMUNITY_SUPPORT'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- AUDIT & LOGGING TABLES
-- ============================================================================

-- Audit Log (GDPR compliance - track all data access)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action audit_action NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'SUCCESS', -- 'SUCCESS', 'FAILURE'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Data Deletion Requests (GDPR Right to be Forgotten)
CREATE TABLE gdpr_deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    requested_by_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'
    reason TEXT,
    completed_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Data Export Requests (GDPR Right to data portability)
CREATE TABLE gdpr_export_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'
    export_format VARCHAR(20) DEFAULT 'JSON', -- 'JSON', 'CSV'
    file_url TEXT,
    download_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Background verification indexes
CREATE INDEX idx_bg_verification_user_id ON background_verifications(user_id);
CREATE INDEX idx_bg_verification_status ON background_verifications(status);

-- Companion requests indexes
CREATE INDEX idx_companion_elder_id ON companion_requests(elder_id);
CREATE INDEX idx_companion_volunteer_id ON companion_requests(volunteer_id);
CREATE INDEX idx_companion_status ON companion_requests(status);
CREATE INDEX idx_companion_created_at ON companion_requests(created_at);

-- Task assistance indexes
CREATE INDEX idx_task_elder_id ON task_assistance_bookings(elder_id);
CREATE INDEX idx_task_professional_id ON task_assistance_bookings(professional_id);
CREATE INDEX idx_task_status ON task_assistance_bookings(status);
CREATE INDEX idx_task_created_at ON task_assistance_bookings(created_at);

-- Messages indexes
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_unread ON messages(recipient_id, is_read);

-- Health checkins indexes
CREATE INDEX idx_checkin_user_id ON health_checkins(user_id);
CREATE INDEX idx_checkin_date ON health_checkins(checkin_date);

-- Emergency alerts indexes
CREATE INDEX idx_emergency_user_id ON emergency_alerts(user_id);
CREATE INDEX idx_emergency_status ON emergency_alerts(status);
CREATE INDEX idx_emergency_triggered_at ON emergency_alerts(triggered_at);

-- Video call indexes
CREATE INDEX idx_video_call_initiator ON video_call_sessions(initiator_id);
CREATE INDEX idx_video_call_recipient ON video_call_sessions(recipient_id);
CREATE INDEX idx_video_call_created_at ON video_call_sessions(created_at);

-- Donations indexes
CREATE INDEX idx_donations_created_at ON donations(created_at);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_donor_id ON donations(donor_id);

-- Event indexes
CREATE INDEX idx_event_organizer ON community_events(organizer_id);
CREATE INDEX idx_event_date ON community_events(event_date);
CREATE INDEX idx_event_is_active ON community_events(is_active);

-- Audit log indexes
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_table ON audit_logs(table_name);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Active users view
CREATE VIEW active_users AS
SELECT * FROM users
WHERE is_active = TRUE AND deleted_at IS NULL;

-- Verified volunteers view
CREATE VIEW verified_volunteers AS
SELECT u.* FROM users u
WHERE u.role = 'VOLUNTEER'
  AND u.is_active = TRUE
  AND EXISTS (
    SELECT 1 FROM background_verifications bv
    WHERE bv.user_id = u.id AND bv.status = 'APPROVED'
  );

-- Pending companion requests view
CREATE VIEW pending_companion_requests AS
SELECT cr.*, u.first_name as elder_first_name, u.last_name as elder_last_name
FROM companion_requests cr
JOIN users u ON cr.elder_id = u.id
WHERE cr.status = 'PENDING'
ORDER BY cr.requested_date ASC;

-- Recent donations view
CREATE VIEW recent_donations AS
SELECT SUM(donation_amount) as total_amount, COUNT(*) as donation_count, 
       DATE_TRUNC('month', created_at) as donation_month
FROM donations
WHERE status = 'COMPLETED'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY donation_month DESC;

-- ============================================================================
-- SECURITY & RLS POLICIES
-- ============================================================================

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE companion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assistance_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Users can view public user data
CREATE POLICY "Users can view public profiles"
  ON users FOR SELECT
  USING (is_active = TRUE);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can create their own profile row after signup
CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admin can view all user data
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING ((auth.jwt() ->> 'role') = 'ADMIN');

-- Messages: only sender and recipient can view
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

-- Emergency alerts: admins and volunteers can view
CREATE POLICY "Admins and volunteers can view emergency alerts"
  ON emergency_alerts FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('ADMIN', 'VOLUNTEER')
    OR user_id = auth.uid()
  );

-- Health checkins: user and family can view
CREATE POLICY "Users can view their checkins"
  ON health_checkins FOR SELECT
  USING (
    user_id = auth.uid()
    OR user_id IN (
      SELECT elder_id FROM family_access 
      WHERE family_member_id = auth.uid() AND verified = TRUE
    )
  );

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_action audit_action,
  p_table_name VARCHAR,
  p_record_id UUID,
  p_old_values JSONB,
  p_new_values JSONB
)
RETURNS void AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
  VALUES (p_user_id, p_action, p_table_name, p_record_id, p_old_values, p_new_values);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to soft delete users (GDPR compliant)
CREATE OR REPLACE FUNCTION soft_delete_user(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET deleted_at = CURRENT_TIMESTAMP, is_active = FALSE
  WHERE id = p_user_id;
  
  INSERT INTO audit_logs (user_id, action, table_name, record_id)
  VALUES (auth.uid(), 'DELETE', 'users', p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update modified timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at on all tables
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER background_verifications_updated_at BEFORE UPDATE ON background_verifications
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER companion_requests_updated_at BEFORE UPDATE ON companion_requests
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER task_assistance_bookings_updated_at BEFORE UPDATE ON task_assistance_bookings
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER messages_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER video_call_sessions_updated_at BEFORE UPDATE ON video_call_sessions
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER medication_reminders_updated_at BEFORE UPDATE ON medication_reminders
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER donations_updated_at BEFORE UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ============================================================================
-- INITIAL DATA (OPTIONAL SEED DATA)
-- ============================================================================

-- Insert sample admin account (to be updated with real credentials)
-- Password should be set via authentication provider (Supabase Auth)
-- INSERT INTO users (email, first_name, last_name, role, is_verified)
-- VALUES ('admin@elderconnect.plus', 'System', 'Administrator', 'ADMIN', TRUE);

COMMIT;
