/*
  Warnings:

  - You are about to drop the `engagementCampaigns` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `engagementResponses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `engagementTemplates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `generatedReports` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `predictiveModels` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reportInsights` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reportTemplates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `scheduledReports` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "engagementCampaigns" DROP CONSTRAINT "engagementCampaigns_created_by_fkey";

-- DropForeignKey
ALTER TABLE "engagementCampaigns" DROP CONSTRAINT "engagementCampaigns_template_source_id_fkey";

-- DropForeignKey
ALTER TABLE "engagementResponses" DROP CONSTRAINT "engagementResponses_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "engagementResponses" DROP CONSTRAINT "engagementResponses_user_id_fkey";

-- DropForeignKey
ALTER TABLE "engagementTemplates" DROP CONSTRAINT "engagementTemplates_created_by_fkey";

-- DropForeignKey
ALTER TABLE "generatedReports" DROP CONSTRAINT "generatedReports_generated_by_fkey";

-- DropForeignKey
ALTER TABLE "generatedReports" DROP CONSTRAINT "generatedReports_template_id_fkey";

-- DropForeignKey
ALTER TABLE "reportInsights" DROP CONSTRAINT "reportInsights_report_id_fkey";

-- DropForeignKey
ALTER TABLE "reportTemplates" DROP CONSTRAINT "reportTemplates_created_by_fkey";

-- DropForeignKey
ALTER TABLE "scheduledReports" DROP CONSTRAINT "scheduledReports_created_by_fkey";

-- DropForeignKey
ALTER TABLE "scheduledReports" DROP CONSTRAINT "scheduledReports_template_id_fkey";

-- DropTable
DROP TABLE "engagementCampaigns";

-- DropTable
DROP TABLE "engagementResponses";

-- DropTable
DROP TABLE "engagementTemplates";

-- DropTable
DROP TABLE "generatedReports";

-- DropTable
DROP TABLE "predictiveModels";

-- DropTable
DROP TABLE "reportInsights";

-- DropTable
DROP TABLE "reportTemplates";

-- DropTable
DROP TABLE "scheduledReports";

-- DropEnum
DROP TYPE "EngagementKind";

-- DropEnum
DROP TYPE "EngagementStatus";

-- DropEnum
DROP TYPE "InsightCategory";

-- DropEnum
DROP TYPE "ReportFrequency";

-- DropEnum
DROP TYPE "ReportType";
