/*
  Warnings:

  - Added the required column `hashed_token` to the `ResetPasswordToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ResetPasswordToken" ADD COLUMN     "hashed_token" TEXT NOT NULL;
