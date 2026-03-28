/*
  Warnings:

  - You are about to drop the column `googleId` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_googleId_idx";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "googleId";

-- CreateTable
CREATE TABLE "userGoogleCredentials" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "google_id" TEXT NOT NULL,
    "encrypted_refresh_token" TEXT,
    "encrypted_access_token" TEXT,
    "token_type" TEXT,
    "scope" TEXT,
    "expiry_date" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userGoogleCredentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "userGoogleCredentials_user_id_idx" ON "userGoogleCredentials"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "userGoogleCredentials_google_id_key" ON "userGoogleCredentials"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "userGoogleCredentials_user_id_key" ON "userGoogleCredentials"("user_id");

-- AddForeignKey
ALTER TABLE "userGoogleCredentials" ADD CONSTRAINT "userGoogleCredentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
