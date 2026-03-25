-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "messages_is_deleted_idx" ON "messages"("is_deleted");
