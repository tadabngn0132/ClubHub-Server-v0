/*
  Warnings:

  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - Added the required column `isEmailVerified` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Provider" AS ENUM ('LOCAL', 'GOOGLE');

-- DropIndex
DROP INDEX "public"."User_username_key";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "username",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "fullname" TEXT,
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "locate" TEXT,
ADD COLUMN     "provider" "public"."Provider" NOT NULL DEFAULT 'LOCAL',
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "googleId" DROP NOT NULL;
