-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "google_calendar_event_id" TEXT;

-- CreateIndex
CREATE INDEX "activities_google_calendar_event_id_idx" ON "activities"("google_calendar_event_id");
