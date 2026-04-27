-- AlterTable
ALTER TABLE "departmentInterviews" ALTER COLUMN "priority" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "memberApplications" ADD COLUMN     "root_department_id" INTEGER;

-- CreateIndex
CREATE INDEX "memberApplications_root_department_id_idx" ON "memberApplications"("root_department_id");
