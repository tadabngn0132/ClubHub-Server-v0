/*
  Warnings:

  - You are about to drop the column `cv_review_comment` on the `memberApplications` table. All the data in the column will be lost.
  - You are about to drop the column `cv_reviewed_at` on the `memberApplications` table. All the data in the column will be lost.
  - You are about to drop the column `cv_reviewer_id` on the `memberApplications` table. All the data in the column will be lost.
  - You are about to drop the column `cv_status` on the `memberApplications` table. All the data in the column will be lost.
  - You are about to drop the column `final_review_comment` on the `memberApplications` table. All the data in the column will be lost.
  - You are about to drop the column `final_reviewed_at` on the `memberApplications` table. All the data in the column will be lost.
  - You are about to drop the column `final_reviewer_id` on the `memberApplications` table. All the data in the column will be lost.
  - You are about to drop the column `final_status` on the `memberApplications` table. All the data in the column will be lost.
  - You are about to drop the `department_member_applications` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MemberApplicationState" AS ENUM ('SUBMITTED', 'CV_PENDING', 'CV_PASSED', 'CV_FAILED', 'DEPARTMENT_INTERVIEWING', 'FINAL_PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- DropForeignKey
ALTER TABLE "department_member_applications" DROP CONSTRAINT "department_member_applications_department_id_fkey";

-- DropForeignKey
ALTER TABLE "department_member_applications" DROP CONSTRAINT "department_member_applications_interviewer_id_fkey";

-- DropForeignKey
ALTER TABLE "department_member_applications" DROP CONSTRAINT "department_member_applications_member_application_id_fkey";

-- DropForeignKey
ALTER TABLE "memberApplications" DROP CONSTRAINT "memberApplications_cv_reviewer_id_fkey";

-- DropForeignKey
ALTER TABLE "memberApplications" DROP CONSTRAINT "memberApplications_final_reviewer_id_fkey";

-- DropIndex
DROP INDEX "memberApplications_cv_reviewer_id_idx";

-- DropIndex
DROP INDEX "memberApplications_final_reviewer_id_idx";

-- AlterTable
ALTER TABLE "memberApplications" DROP COLUMN "cv_review_comment",
DROP COLUMN "cv_reviewed_at",
DROP COLUMN "cv_reviewer_id",
DROP COLUMN "cv_status",
DROP COLUMN "final_review_comment",
DROP COLUMN "final_reviewed_at",
DROP COLUMN "final_reviewer_id",
DROP COLUMN "final_status",
ADD COLUMN     "state" "MemberApplicationState" NOT NULL DEFAULT 'SUBMITTED';

-- DropTable
DROP TABLE "department_member_applications";

-- CreateTable
CREATE TABLE "cvReviews" (
    "id" SERIAL NOT NULL,
    "member_application_id" INTEGER NOT NULL,
    "reviewer_id" INTEGER,
    "status" "CVStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_at" TIMESTAMP(3),
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cvReviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departmentInterviews" (
    "id" SERIAL NOT NULL,
    "member_application_id" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,
    "interviewer_id" INTEGER,
    "status" "InterviewStatus" NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 1,
    "interviewed_at" TIMESTAMP(3),
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "departmentInterviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finalReviews" (
    "id" SERIAL NOT NULL,
    "member_application_id" INTEGER NOT NULL,
    "reviewer_id" INTEGER,
    "status" "FinalStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_at" TIMESTAMP(3),
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finalReviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cvReviews_member_application_id_key" ON "cvReviews"("member_application_id");

-- CreateIndex
CREATE INDEX "cvReviews_reviewer_id_idx" ON "cvReviews"("reviewer_id");

-- CreateIndex
CREATE INDEX "departmentInterviews_member_application_id_idx" ON "departmentInterviews"("member_application_id");

-- CreateIndex
CREATE INDEX "departmentInterviews_department_id_idx" ON "departmentInterviews"("department_id");

-- CreateIndex
CREATE INDEX "departmentInterviews_interviewer_id_idx" ON "departmentInterviews"("interviewer_id");

-- CreateIndex
CREATE UNIQUE INDEX "departmentInterviews_member_application_id_department_id_key" ON "departmentInterviews"("member_application_id", "department_id");

-- CreateIndex
CREATE UNIQUE INDEX "finalReviews_member_application_id_key" ON "finalReviews"("member_application_id");

-- CreateIndex
CREATE INDEX "finalReviews_reviewer_id_idx" ON "finalReviews"("reviewer_id");

-- CreateIndex
CREATE INDEX "memberApplications_email_idx" ON "memberApplications"("email");

-- CreateIndex
CREATE INDEX "memberApplications_state_idx" ON "memberApplications"("state");

-- AddForeignKey
ALTER TABLE "cvReviews" ADD CONSTRAINT "cvReviews_member_application_id_fkey" FOREIGN KEY ("member_application_id") REFERENCES "memberApplications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cvReviews" ADD CONSTRAINT "cvReviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departmentInterviews" ADD CONSTRAINT "departmentInterviews_member_application_id_fkey" FOREIGN KEY ("member_application_id") REFERENCES "memberApplications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departmentInterviews" ADD CONSTRAINT "departmentInterviews_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departmentInterviews" ADD CONSTRAINT "departmentInterviews_interviewer_id_fkey" FOREIGN KEY ("interviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finalReviews" ADD CONSTRAINT "finalReviews_member_application_id_fkey" FOREIGN KEY ("member_application_id") REFERENCES "memberApplications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finalReviews" ADD CONSTRAINT "finalReviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
