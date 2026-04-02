-- CreateEnum
CREATE TYPE "EngagementKind" AS ENUM ('POLL', 'SURVEY');

-- CreateEnum
CREATE TYPE "EngagementStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED');

-- CreateTable
CREATE TABLE "engagementCampaigns" (
    "id" SERIAL NOT NULL,
    "kind" "EngagementKind" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "question_text" TEXT,
    "image_url" TEXT,
    "deadline_at" TIMESTAMP(3),
    "allow_multiple_select" BOOLEAN NOT NULL DEFAULT false,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "is_weighted_voting" BOOLEAN NOT NULL DEFAULT false,
    "target_audience" TEXT,
    "inline_contexts" JSONB,
    "options" JSONB,
    "questions" JSONB,
    "settings" JSONB,
    "share_token" TEXT NOT NULL,
    "embed_key" TEXT NOT NULL,
    "status" "EngagementStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by" INTEGER NOT NULL,
    "template_source_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "engagementCampaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagementResponses" (
    "id" SERIAL NOT NULL,
    "campaign_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "duplicate_key" TEXT NOT NULL,
    "anonymous_token" TEXT,
    "ip_address" TEXT,
    "answers" JSONB NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "sentiment_score" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "engagementResponses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagementTemplates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "EngagementKind" NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "payload" JSONB NOT NULL,
    "tags" JSONB,
    "created_by" INTEGER,
    "is_system_template" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "engagementTemplates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "engagementCampaigns_share_token_key" ON "engagementCampaigns"("share_token");

-- CreateIndex
CREATE UNIQUE INDEX "engagementCampaigns_embed_key_key" ON "engagementCampaigns"("embed_key");

-- CreateIndex
CREATE INDEX "engagementCampaigns_created_by_idx" ON "engagementCampaigns"("created_by");

-- CreateIndex
CREATE INDEX "engagementCampaigns_kind_idx" ON "engagementCampaigns"("kind");

-- CreateIndex
CREATE INDEX "engagementCampaigns_status_idx" ON "engagementCampaigns"("status");

-- CreateIndex
CREATE INDEX "engagementCampaigns_share_token_idx" ON "engagementCampaigns"("share_token");

-- CreateIndex
CREATE INDEX "engagementResponses_campaign_id_idx" ON "engagementResponses"("campaign_id");

-- CreateIndex
CREATE INDEX "engagementResponses_user_id_idx" ON "engagementResponses"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "engagementResponses_campaign_id_duplicate_key_key" ON "engagementResponses"("campaign_id", "duplicate_key");

-- CreateIndex
CREATE INDEX "engagementTemplates_kind_idx" ON "engagementTemplates"("kind");

-- CreateIndex
CREATE INDEX "engagementTemplates_created_by_idx" ON "engagementTemplates"("created_by");

-- AddForeignKey
ALTER TABLE "engagementCampaigns" ADD CONSTRAINT "engagementCampaigns_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagementCampaigns" ADD CONSTRAINT "engagementCampaigns_template_source_id_fkey" FOREIGN KEY ("template_source_id") REFERENCES "engagementTemplates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagementResponses" ADD CONSTRAINT "engagementResponses_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "engagementCampaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagementResponses" ADD CONSTRAINT "engagementResponses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagementTemplates" ADD CONSTRAINT "engagementTemplates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
