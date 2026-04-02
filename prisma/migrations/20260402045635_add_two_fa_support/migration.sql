-- AlterTable
ALTER TABLE "users" ADD COLUMN     "two_fa_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "two_fa_secret" TEXT,
ADD COLUMN     "two_fa_setup_code" TEXT,
ADD COLUMN     "two_fa_setup_code_expiry" TIMESTAMP(3),
ADD COLUMN     "two_fa_setup_verified" BOOLEAN NOT NULL DEFAULT false;
