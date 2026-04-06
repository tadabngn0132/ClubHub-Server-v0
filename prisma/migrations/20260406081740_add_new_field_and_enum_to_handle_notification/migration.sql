-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('GENERAL', 'ACTIVITY', 'TASK', 'SYSTEM');

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "type" "NotificationType" NOT NULL DEFAULT 'GENERAL';
