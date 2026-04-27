/*
  Warnings:

  - The values [COMMUNICATION_DEPT,DESIGN_DEPT,CONTENT_DEPT,LOGISTICS_DEPT,HUMAN_RESOURCES_DEPT,EXPERT_COMMITTEE_DEPT,MEDIA_DEPT] on the enum `TaskAssigneeScope` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TaskAssigneeScope_new" AS ENUM ('ALL', 'DEPTS', 'MEMBERS');
ALTER TABLE "public"."Task" ALTER COLUMN "assignee_scope" DROP DEFAULT;
ALTER TABLE "Task" ALTER COLUMN "assignee_scope" TYPE "TaskAssigneeScope_new" USING ("assignee_scope"::text::"TaskAssigneeScope_new");
ALTER TYPE "TaskAssigneeScope" RENAME TO "TaskAssigneeScope_old";
ALTER TYPE "TaskAssigneeScope_new" RENAME TO "TaskAssigneeScope";
DROP TYPE "public"."TaskAssigneeScope_old";
ALTER TABLE "Task" ALTER COLUMN "assignee_scope" SET DEFAULT 'ALL';
COMMIT;
