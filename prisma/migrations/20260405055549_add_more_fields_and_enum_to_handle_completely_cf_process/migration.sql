-- CreateEnum
CREATE TYPE "AssigneeTaskStatus" AS ENUM ('PENDING', 'CONFIRMED', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "assigneeTasks" ADD COLUMN     "reviewer_comments" TEXT,
ADD COLUMN     "status" "AssigneeTaskStatus" NOT NULL DEFAULT 'PENDING';
