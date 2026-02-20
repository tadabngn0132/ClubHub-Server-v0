/*
  Warnings:

  - You are about to drop the column `is_online` on the `activities` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `activities` table. All the data in the column will be lost.
  - You are about to drop the column `meet_link` on the `activities` table. All the data in the column will be lost.
  - Added the required column `location_type` to the `activities` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "activities" DROP COLUMN "is_online",
DROP COLUMN "location",
DROP COLUMN "meet_link",
ADD COLUMN     "location_type" TEXT NOT NULL,
ADD COLUMN     "meeting_id" TEXT,
ADD COLUMN     "meeting_link" TEXT,
ADD COLUMN     "meeting_password" TEXT,
ADD COLUMN     "meeting_platform" TEXT,
ADD COLUMN     "room_number" TEXT,
ADD COLUMN     "venue_address" TEXT,
ADD COLUMN     "venue_name" TEXT;
