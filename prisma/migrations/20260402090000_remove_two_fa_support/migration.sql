-- Remove all 2FA-related schema objects
ALTER TABLE "users"
  DROP COLUMN IF EXISTS "two_fa_enabled",
  DROP COLUMN IF EXISTS "two_fa_secret",
  DROP COLUMN IF EXISTS "two_fa_setup_verified",
  DROP COLUMN IF EXISTS "two_fa_setup_code",
  DROP COLUMN IF EXISTS "two_fa_setup_code_expiry";

ALTER TABLE "positions"
  DROP COLUMN IF EXISTS "two_fa_required";

DROP TABLE IF EXISTS "two_fa_verification_attempts" CASCADE;
DROP TABLE IF EXISTS "trusted_devices" CASCADE;
DROP TABLE IF EXISTS "two_fa_backup_codes" CASCADE;
DROP TABLE IF EXISTS "audit_logs" CASCADE;
