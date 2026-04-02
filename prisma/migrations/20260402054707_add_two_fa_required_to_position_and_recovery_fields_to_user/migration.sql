-- AlterTable
ALTER TABLE "positions" ADD COLUMN     "two_fa_required" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "account_recovery_token" TEXT,
ADD COLUMN     "account_recovery_token_expiry" TIMESTAMP(3);
