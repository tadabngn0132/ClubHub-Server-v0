/*
  Warnings:

  - You are about to drop the column `is_completed` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `review_comment` on the `memberApplications` table. All the data in the column will be lost.
  - You are about to drop the column `reviewed_at` on the `memberApplications` table. All the data in the column will be lost.
  - You are about to drop the column `reviewer_id` on the `memberApplications` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `memberApplications` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `memberApplications` table. All the data in the column will be lost.
  - You are about to drop the column `isPrimary` on the `userPositions` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - The `status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `email` to the `memberApplications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullname` to the `memberApplications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `memberApplications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `major` to the `memberApplications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `memberApplications` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `level` on the `positions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `department_id` on table `positions` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CVStatus" AS ENUM ('PENDING', 'PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "FinalStatus" AS ENUM ('PENDING', 'PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('PENDING', 'SCHEDULED', 'INTERVIEWED', 'PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'DONE', 'CANCELLED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "PositionLevel" AS ENUM ('MEMBER', 'MIDDLE_VICE_HEAD', 'MIDDLE_HEAD', 'TOP_VICE_HEAD', 'TOP_HEAD');

-- DropForeignKey
ALTER TABLE "memberApplications" DROP CONSTRAINT "memberApplications_reviewer_id_fkey";

-- DropForeignKey
ALTER TABLE "memberApplications" DROP CONSTRAINT "memberApplications_user_id_fkey";

-- DropIndex
DROP INDEX "memberApplications_user_id_key";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "is_completed",
ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'NEW';

-- AlterTable
ALTER TABLE "memberApplications" DROP COLUMN "review_comment",
DROP COLUMN "reviewed_at",
DROP COLUMN "reviewer_id",
DROP COLUMN "status",
DROP COLUMN "user_id",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "cv_review_comment" TEXT,
ADD COLUMN     "cv_reviewed_at" TIMESTAMP(3),
ADD COLUMN     "cv_reviewer_id" INTEGER,
ADD COLUMN     "cv_status" "CVStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "date_of_birth" TIMESTAMP(3),
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "final_review_comment" TEXT,
ADD COLUMN     "final_reviewed_at" TIMESTAMP(3),
ADD COLUMN     "final_reviewer_id" INTEGER,
ADD COLUMN     "final_status" "FinalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "fullname" TEXT NOT NULL,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "major" TEXT NOT NULL,
ADD COLUMN     "phone_number" VARCHAR(15),
ADD COLUMN     "student_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "positions" DROP COLUMN "level",
ADD COLUMN     "level" "PositionLevel" NOT NULL,
ALTER COLUMN "department_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "userPositions" DROP COLUMN "isPrimary",
ADD COLUMN     "is_primary" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "department",
DROP COLUMN "position",
DROP COLUMN "role",
ADD COLUMN     "root_department_id" INTEGER,
DROP COLUMN "status",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "major" DROP NOT NULL,
ALTER COLUMN "student_id" DROP NOT NULL;

-- DropEnum
DROP TYPE "Status";

-- CreateTable
CREATE TABLE "assigneeTasks" (
    "id" SERIAL NOT NULL,
    "task_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "confirmed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evidence_url" TEXT,
    "additional_comments" TEXT,

    CONSTRAINT "assigneeTasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_member_applications" (
    "id" SERIAL NOT NULL,
    "member_application_id" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,
    "interview_status" "InterviewStatus" NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 1,
    "interviewed_at" TIMESTAMP(3),
    "interviewer_id" INTEGER,
    "interview_comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_member_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assigneeTasks_task_id_idx" ON "assigneeTasks"("task_id");

-- CreateIndex
CREATE INDEX "assigneeTasks_user_id_idx" ON "assigneeTasks"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "assigneeTasks_task_id_user_id_key" ON "assigneeTasks"("task_id", "user_id");

-- CreateIndex
CREATE INDEX "department_member_applications_member_application_id_idx" ON "department_member_applications"("member_application_id");

-- CreateIndex
CREATE INDEX "department_member_applications_department_id_idx" ON "department_member_applications"("department_id");

-- CreateIndex
CREATE INDEX "department_member_applications_interviewer_id_idx" ON "department_member_applications"("interviewer_id");

-- CreateIndex
CREATE UNIQUE INDEX "department_member_applications_member_application_id_depart_key" ON "department_member_applications"("member_application_id", "department_id");

-- CreateIndex
CREATE INDEX "memberApplications_cv_reviewer_id_idx" ON "memberApplications"("cv_reviewer_id");

-- CreateIndex
CREATE INDEX "memberApplications_final_reviewer_id_idx" ON "memberApplications"("final_reviewer_id");

-- CreateIndex
CREATE INDEX "users_root_department_id_idx" ON "users"("root_department_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_root_department_id_fkey" FOREIGN KEY ("root_department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assigneeTasks" ADD CONSTRAINT "assigneeTasks_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assigneeTasks" ADD CONSTRAINT "assigneeTasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberApplications" ADD CONSTRAINT "memberApplications_cv_reviewer_id_fkey" FOREIGN KEY ("cv_reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberApplications" ADD CONSTRAINT "memberApplications_final_reviewer_id_fkey" FOREIGN KEY ("final_reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_member_applications" ADD CONSTRAINT "department_member_applications_member_application_id_fkey" FOREIGN KEY ("member_application_id") REFERENCES "memberApplications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_member_applications" ADD CONSTRAINT "department_member_applications_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_member_applications" ADD CONSTRAINT "department_member_applications_interviewer_id_fkey" FOREIGN KEY ("interviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
