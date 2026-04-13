-- AlterTable
ALTER TABLE "activityParticipations" ADD COLUMN     "guest_email" TEXT,
ADD COLUMN     "guest_name" TEXT,
ADD COLUMN     "guest_phone_number" VARCHAR(15);
