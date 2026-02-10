/*
  Warnings:

  - Added the required column `gender` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `major` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "generation" INTEGER,
ADD COLUMN     "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "major" TEXT NOT NULL,
ADD COLUMN     "student_id" TEXT NOT NULL;
