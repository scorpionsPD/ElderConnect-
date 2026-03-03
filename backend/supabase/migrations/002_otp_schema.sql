-- OTP Verification Table
-- Add this to the initial schema for handling one-time passwords

CREATE TABLE otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    code VARCHAR(10) NOT NULL,
    code_type VARCHAR(20) NOT NULL, -- 'EMAIL', 'SMS'
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempt_count INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT otp_code_length CHECK (LENGTH(code) = 4)
);

-- Indexes for OTP lookup
CREATE INDEX idx_otp_email ON otp_codes(email);
CREATE INDEX idx_otp_phone ON otp_codes(phone_number);
CREATE INDEX idx_otp_expires_at ON otp_codes(expires_at);
CREATE INDEX idx_otp_code ON otp_codes(code);

-- Function to verify OTP
CREATE OR REPLACE FUNCTION verify_otp(
    p_email VARCHAR,
    p_code VARCHAR
)
RETURNS TABLE(success BOOLEAN, user_id UUID, message TEXT) AS $$
DECLARE
    v_otp_record RECORD;
    v_user_id UUID;
BEGIN
    -- Find the OTP record
    SELECT * INTO v_otp_record FROM otp_codes
    WHERE email = p_email
    AND code = p_code
    AND is_used = FALSE
    AND expires_at > CURRENT_TIMESTAMP
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF v_otp_record IS NULL THEN
        RETURN QUERY SELECT FALSE::BOOLEAN, NULL::UUID, 'Invalid or expired OTP'::TEXT;
        RETURN;
    END IF;
    
    IF v_otp_record.attempt_count >= v_otp_record.max_attempts THEN
        RETURN QUERY SELECT FALSE::BOOLEAN, NULL::UUID, 'Too many attempts. OTP expired.'::TEXT;
        RETURN;
    END IF;
    
    -- Check if user exists
    SELECT id INTO v_user_id FROM users WHERE email = p_email;
    
    -- Mark OTP as used
    UPDATE otp_codes
    SET is_used = TRUE, used_at = CURRENT_TIMESTAMP
    WHERE id = v_otp_record.id;
    
    RETURN QUERY SELECT TRUE::BOOLEAN, v_user_id, 'OTP verified successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM otp_codes
    WHERE expires_at < CURRENT_TIMESTAMP
    AND is_used = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on OTP table
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- OTP table is only accessible by auth functions, no direct user access
CREATE POLICY "Only auth functions can access OTP"
  ON otp_codes FOR ALL
  USING (FALSE)
  WITH CHECK (FALSE);
