CREATE TABLE IF NOT EXISTS family_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    elder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    family_email VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) DEFAULT 'OTHER',
    access_level VARCHAR(50) DEFAULT 'VIEW_ALL',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    resend_count INTEGER NOT NULL DEFAULT 0,
    last_sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(elder_id, family_email)
);

CREATE INDEX IF NOT EXISTS idx_family_invitations_elder_status
  ON family_invitations (elder_id, status, created_at DESC);
