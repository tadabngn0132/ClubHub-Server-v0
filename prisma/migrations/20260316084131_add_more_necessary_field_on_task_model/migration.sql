-- CreateEnum
CREATE TYPE "TaskAssigneeScope" AS ENUM ('ALL', 'COMMUNICATION_DEPT', 'DESIGN_DEPT', 'CONTENT_DEPT', 'LOGISTICS_DEPT', 'HUMAN_RESOURCES_DEPT', 'EXPERT_COMMITTEE_DEPT', 'MEDIA_DEPT');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "assignee_scope" "TaskAssigneeScope" NOT NULL DEFAULT 'ALL',
ADD COLUMN     "assignor_id" INTEGER,
ADD COLUMN     "is_check_cf_task" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignor_id_fkey" FOREIGN KEY ("assignor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
