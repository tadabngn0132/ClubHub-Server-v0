/*
  Warnings:

  - You are about to drop the column `avatarUrl` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `googleId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `locale` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_googleId_idx";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatarUrl",
DROP COLUMN "firstName",
DROP COLUMN "googleId",
DROP COLUMN "isEmailVerified",
DROP COLUMN "lastName",
DROP COLUMN "locale",
DROP COLUMN "provider",
ADD COLUMN     "department" TEXT,
ADD COLUMN     "position" TEXT;

-- DropEnum
DROP TYPE "ActivityStatus";

-- DropEnum
DROP TYPE "ActivityType";

-- DropEnum
DROP TYPE "ParticipationStatus";

-- DropEnum
DROP TYPE "Provider";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "Status";
