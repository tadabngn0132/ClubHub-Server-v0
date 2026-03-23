/*
  Warnings:

  - You are about to drop the column `images` on the `activities` table. All the data in the column will be lost.
  - You are about to drop the column `videos` on the `activities` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AvatarProvider" AS ENUM ('GOOGLE', 'CLOUDINARY');

-- AlterTable
ALTER TABLE "activities" DROP COLUMN "images",
DROP COLUMN "videos",
ADD COLUMN     "thumbnail_public_id" TEXT;

-- AlterTable
ALTER TABLE "assigneeTasks" ADD COLUMN     "evidence_public_id" TEXT;

-- AlterTable
ALTER TABLE "memberApplications" ADD COLUMN     "avatar_provider" "AvatarProvider" DEFAULT 'CLOUDINARY',
ADD COLUMN     "avatar_public_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar_provider" "AvatarProvider",
ADD COLUMN     "avatar_public_id" TEXT;

-- CreateTable
CREATE TABLE "ActivityImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "public_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activity_id" INTEGER NOT NULL,

    CONSTRAINT "ActivityImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityVideo" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "public_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activity_id" INTEGER NOT NULL,

    CONSTRAINT "ActivityVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityImage_activity_id_idx" ON "ActivityImage"("activity_id");

-- CreateIndex
CREATE INDEX "ActivityVideo_activity_id_idx" ON "ActivityVideo"("activity_id");

-- AddForeignKey
ALTER TABLE "ActivityImage" ADD CONSTRAINT "ActivityImage_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityVideo" ADD CONSTRAINT "ActivityVideo_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
