/*
  Warnings:

  - The primary key for the `userPositions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `positionId` on the `userPositions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `userPositions` table. All the data in the column will be lost.
  - You are about to drop the column `createAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `locate` on the `users` table. All the data in the column will be lost.
  - You are about to alter the column `phone_number` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(15)`.
  - The `date_of_birth` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[user_id,position_id]` on the table `userPositions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `departments` table without a default value. This is not possible if the table is not empty.
  - Made the column `user_id` on table `refreshTokens` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `resetPasswordTokens` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `position_id` to the `userPositions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `userPositions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('MEETING', 'WORKSHOP', 'TRAINING', 'PERFORMANCE', 'COMPETITION', 'SOCIAL', 'VOLUNTEER');

-- CreateEnum
CREATE TYPE "public"."ActivityStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- CreateEnum
CREATE TYPE "public"."ParticipationStatus" AS ENUM ('REGISTERED', 'CONFIRMED', 'ATTENDED', 'ABSENT', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "public"."userPositions" DROP CONSTRAINT "userPositions_positionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."userPositions" DROP CONSTRAINT "userPositions_userId_fkey";

-- AlterTable
ALTER TABLE "public"."departments" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."refreshTokens" ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."resetPasswordTokens" ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."userPositions" DROP CONSTRAINT "userPositions_pkey",
DROP COLUMN "positionId",
DROP COLUMN "userId",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "position_id" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL,
ADD CONSTRAINT "userPositions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "createAt",
DROP COLUMN "locate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "locale" TEXT,
ALTER COLUMN "phone_number" DROP NOT NULL,
ALTER COLUMN "phone_number" SET DATA TYPE VARCHAR(15),
DROP COLUMN "date_of_birth",
ADD COLUMN     "date_of_birth" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."activities" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "short_description" TEXT,
    "slug" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_online" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "meet_link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "public"."ActivityType" NOT NULL,
    "status" "public"."ActivityStatus" NOT NULL DEFAULT 'DRAFT',
    "thumbnail_url" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "videos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "max_participants" INTEGER,
    "registration_deadline" TIMESTAMP(3),
    "require_registration" BOOLEAN NOT NULL DEFAULT false,
    "organizer_id" INTEGER NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "priority" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."activityParticipations" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "activity_id" INTEGER NOT NULL,
    "status" "public"."ParticipationStatus" NOT NULL DEFAULT 'REGISTERED',
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activityParticipations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "activities_slug_key" ON "public"."activities"("slug");

-- CreateIndex
CREATE INDEX "activities_organizer_id_idx" ON "public"."activities"("organizer_id");

-- CreateIndex
CREATE INDEX "activities_status_idx" ON "public"."activities"("status");

-- CreateIndex
CREATE INDEX "activities_start_date_idx" ON "public"."activities"("start_date");

-- CreateIndex
CREATE INDEX "activities_slug_idx" ON "public"."activities"("slug");

-- CreateIndex
CREATE INDEX "activityParticipations_user_id_idx" ON "public"."activityParticipations"("user_id");

-- CreateIndex
CREATE INDEX "activityParticipations_activity_id_idx" ON "public"."activityParticipations"("activity_id");

-- CreateIndex
CREATE INDEX "activityParticipations_status_idx" ON "public"."activityParticipations"("status");

-- CreateIndex
CREATE INDEX "activityParticipations_activity_id_status_idx" ON "public"."activityParticipations"("activity_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "activityParticipations_user_id_activity_id_key" ON "public"."activityParticipations"("user_id", "activity_id");

-- CreateIndex
CREATE INDEX "refreshTokens_user_id_idx" ON "public"."refreshTokens"("user_id");

-- CreateIndex
CREATE INDEX "userPositions_user_id_idx" ON "public"."userPositions"("user_id");

-- CreateIndex
CREATE INDEX "userPositions_position_id_idx" ON "public"."userPositions"("position_id");

-- CreateIndex
CREATE UNIQUE INDEX "userPositions_user_id_position_id_key" ON "public"."userPositions"("user_id", "position_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_googleId_idx" ON "public"."users"("googleId");

-- AddForeignKey
ALTER TABLE "public"."userPositions" ADD CONSTRAINT "userPositions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."userPositions" ADD CONSTRAINT "userPositions_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activityParticipations" ADD CONSTRAINT "activityParticipations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activityParticipations" ADD CONSTRAINT "activityParticipations_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
