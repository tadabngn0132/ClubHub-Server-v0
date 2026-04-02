/*
  Warnings:

  - You are about to drop the column `account_recovery_token` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `account_recovery_token_expiry` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('MEMBER', 'EVENT', 'FINANCIAL', 'ACTIVITY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ReportFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "InsightCategory" AS ENUM ('GROWTH', 'RETENTION', 'ENGAGEMENT', 'ATTENDANCE', 'FEEDBACK', 'ROI', 'PARTICIPATION', 'PERFORMANCE', 'RECOMMENDATION');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "account_recovery_token",
DROP COLUMN "account_recovery_token_expiry";

-- CreateTable
CREATE TABLE "reportTemplates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "report_type" "ReportType" NOT NULL,
    "metrics" TEXT[],
    "dimensions" TEXT[],
    "filters" TEXT,
    "config" TEXT,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "reportTemplates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduledReports" (
    "id" SERIAL NOT NULL,
    "template_id" INTEGER NOT NULL,
    "frequency" "ReportFrequency" NOT NULL,
    "recipient_emails" TEXT[],
    "last_sent_at" TIMESTAMP(3),
    "next_send_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "scheduledReports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generatedReports" (
    "id" SERIAL NOT NULL,
    "template_id" INTEGER,
    "report_type" "ReportType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "generated_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "exported_at" TIMESTAMP(3),

    CONSTRAINT "generatedReports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reportInsights" (
    "id" SERIAL NOT NULL,
    "report_id" INTEGER NOT NULL,
    "category" "InsightCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metric" TEXT,
    "value" TEXT,
    "trend" TEXT,
    "recommendation" TEXT,
    "severity" TEXT,
    "confidence" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "reportInsights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predictiveModels" (
    "id" SERIAL NOT NULL,
    "model_type" TEXT NOT NULL,
    "trained_on" TIMESTAMP(3) NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "parameters" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "predictiveModels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reportTemplates_report_type_idx" ON "reportTemplates"("report_type");

-- CreateIndex
CREATE INDEX "reportTemplates_created_by_idx" ON "reportTemplates"("created_by");

-- CreateIndex
CREATE INDEX "scheduledReports_template_id_idx" ON "scheduledReports"("template_id");

-- CreateIndex
CREATE INDEX "scheduledReports_frequency_idx" ON "scheduledReports"("frequency");

-- CreateIndex
CREATE INDEX "scheduledReports_next_send_at_idx" ON "scheduledReports"("next_send_at");

-- CreateIndex
CREATE INDEX "generatedReports_report_type_idx" ON "generatedReports"("report_type");

-- CreateIndex
CREATE INDEX "generatedReports_generated_by_idx" ON "generatedReports"("generated_by");

-- CreateIndex
CREATE INDEX "generatedReports_created_at_idx" ON "generatedReports"("created_at");

-- CreateIndex
CREATE INDEX "generatedReports_template_id_idx" ON "generatedReports"("template_id");

-- CreateIndex
CREATE INDEX "reportInsights_report_id_idx" ON "reportInsights"("report_id");

-- CreateIndex
CREATE INDEX "reportInsights_category_idx" ON "reportInsights"("category");

-- CreateIndex
CREATE INDEX "predictiveModels_model_type_idx" ON "predictiveModels"("model_type");

-- CreateIndex
CREATE INDEX "predictiveModels_is_active_idx" ON "predictiveModels"("is_active");

-- AddForeignKey
ALTER TABLE "reportTemplates" ADD CONSTRAINT "reportTemplates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduledReports" ADD CONSTRAINT "scheduledReports_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "reportTemplates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduledReports" ADD CONSTRAINT "scheduledReports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generatedReports" ADD CONSTRAINT "generatedReports_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "reportTemplates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generatedReports" ADD CONSTRAINT "generatedReports_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportInsights" ADD CONSTRAINT "reportInsights_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "generatedReports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
