/*
  Warnings:

  - The values [DEPARTMENT_INTERVIEWING,APPROVED,REJECTED] on the enum `MemberApplicationState` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MemberApplicationState_new" AS ENUM ('SUBMITTED', 'CV_PENDING', 'CV_PASSED', 'CV_FAILED', 'DEPARTMENT_INTERVIEW_PENDING', 'DEPARTMENT_INTERVIEW_PASSED', 'DEPARTMENT_INTERVIEW_FAILED', 'FINAL_PENDING', 'FINAL_PASSED', 'FINAL_FAILED', 'WITHDRAWN');
ALTER TABLE "public"."memberApplications" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "memberApplications" ALTER COLUMN "state" TYPE "MemberApplicationState_new" USING ("state"::text::"MemberApplicationState_new");
ALTER TYPE "MemberApplicationState" RENAME TO "MemberApplicationState_old";
ALTER TYPE "MemberApplicationState_new" RENAME TO "MemberApplicationState";
DROP TYPE "public"."MemberApplicationState_old";
ALTER TABLE "memberApplications" ALTER COLUMN "state" SET DEFAULT 'SUBMITTED';
COMMIT;
