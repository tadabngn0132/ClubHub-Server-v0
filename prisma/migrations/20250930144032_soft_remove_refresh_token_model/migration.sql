/*
  Warnings:

  - You are about to drop the `refreshTokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."refreshTokens" DROP CONSTRAINT "refreshTokens_user_id_fkey";

-- DropTable
DROP TABLE "public"."refreshTokens";
