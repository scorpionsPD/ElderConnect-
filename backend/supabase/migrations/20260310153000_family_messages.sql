-- Shared family chat thread per elder between elder and connected family members.
CREATE TABLE IF NOT EXISTS family_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    elder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_family_messages_elder_created
  ON family_messages (elder_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_family_messages_sender
  ON family_messages (sender_id, created_at DESC);
