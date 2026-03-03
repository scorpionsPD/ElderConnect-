-- Typing indicators for real-time chat UX
CREATE TABLE IF NOT EXISTS typing_indicators (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_typing BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, recipient_id),
    CONSTRAINT different_typing_users CHECK (user_id != recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_typing_recipient ON typing_indicators(recipient_id, updated_at DESC);

ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their typing state"
  ON typing_indicators FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view typing state sent to them"
  ON typing_indicators FOR SELECT
  USING (auth.uid() = recipient_id OR auth.uid() = user_id);
