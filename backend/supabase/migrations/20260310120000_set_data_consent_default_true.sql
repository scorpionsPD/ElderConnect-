-- Ensure profile visibility/data sharing is enabled by default for legacy users
-- without overriding explicit user choices.

-- 1) Make new rows default to TRUE when not explicitly provided.
ALTER TABLE users
  ALTER COLUMN data_consent SET DEFAULT TRUE;
-- 2) Backfill only rows that were never set (NULL), preserving existing TRUE/FALSE.
UPDATE users
SET data_consent = TRUE
WHERE data_consent IS NULL;
