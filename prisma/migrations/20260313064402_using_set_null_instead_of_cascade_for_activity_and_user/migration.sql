-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_organizer_id_fkey";

-- AlterTable
ALTER TABLE "activities" ALTER COLUMN "organizer_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
