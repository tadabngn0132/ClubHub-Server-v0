/*
  Warnings:

  - The `status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `activities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `activityParticipations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `departments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `positions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userPositions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_organizer_id_fkey";

-- DropForeignKey
ALTER TABLE "activityParticipations" DROP CONSTRAINT "activityParticipations_activity_id_fkey";

-- DropForeignKey
ALTER TABLE "activityParticipations" DROP CONSTRAINT "activityParticipations_user_id_fkey";

-- DropForeignKey
ALTER TABLE "positions" DROP CONSTRAINT "positions_department_id_fkey";

-- DropForeignKey
ALTER TABLE "userPositions" DROP CONSTRAINT "userPositions_position_id_fkey";

-- DropForeignKey
ALTER TABLE "userPositions" DROP CONSTRAINT "userPositions_user_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'member',
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- DropTable
DROP TABLE "activities";

-- DropTable
DROP TABLE "activityParticipations";

-- DropTable
DROP TABLE "departments";

-- DropTable
DROP TABLE "positions";

-- DropTable
DROP TABLE "userPositions";
