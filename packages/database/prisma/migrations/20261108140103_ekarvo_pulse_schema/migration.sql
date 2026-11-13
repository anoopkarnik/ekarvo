-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "pulse_schema";

-- CreateEnum
CREATE TYPE "pulse_schema"."PulseRole" AS ENUM ('COO_EXECUTIVE', 'OPS_MANAGER', 'TEAM_LEAD');

-- CreateEnum
CREATE TYPE "pulse_schema"."PulseRecordKind" AS ENUM ('SHIFT', 'TIME_ENTRY', 'WORK_ITEM', 'WORK_EVENT', 'QA', 'FINANCE', 'CERTIFICATION', 'ASSIGNMENT', 'CONTRACT', 'HANDOVER', 'COACHING', 'AUTOMATION');

-- AlterTable
ALTER TABLE "user_schema"."OrganizationInvitation" ADD COLUMN     "bpoAdminInvite" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "pulse_schema"."BpoProfile" (
    "organizationId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "seeded" BOOLEAN NOT NULL DEFAULT false,
    "seedAnchor" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BpoProfile_pkey" PRIMARY KEY ("organizationId")
);

-- CreateTable
CREATE TABLE "pulse_schema"."BpoAdminGrant" (
    "memberId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "BpoAdminGrant_pkey" PRIMARY KEY ("memberId")
);

-- CreateTable
CREATE TABLE "pulse_schema"."PulseAccountGrant" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "role" "pulse_schema"."PulseRole" NOT NULL,

    CONSTRAINT "PulseAccountGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulse_schema"."PulseTeamGrant" (
    "grantId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,

    CONSTRAINT "PulseTeamGrant_pkey" PRIMARY KEY ("grantId","teamId")
);

-- CreateTable
CREATE TABLE "pulse_schema"."PulseInvitationGrant" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "role" "pulse_schema"."PulseRole" NOT NULL,
    "teamIds" TEXT[],

    CONSTRAINT "PulseInvitationGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulse_schema"."ClientAccount" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vertical" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "fenced" BOOLEAN NOT NULL DEFAULT false,
    "targetSla" DOUBLE PRECISION NOT NULL DEFAULT 96,
    "targetMargin" DOUBLE PRECISION NOT NULL DEFAULT 28,
    "approvalLimits" JSONB NOT NULL DEFAULT '{"TEAM_LEAD":40,"OPS_MANAGER":140,"COO_EXECUTIVE":220}',
    "revision" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulse_schema"."PulseSite" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PulseSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulse_schema"."PulseProcess" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PulseProcess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulse_schema"."PulseTeam" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "siteId" TEXT,

    CONSTRAINT "PulseTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulse_schema"."PulseWorker" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "fte" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "hourlyRate" DECIMAL(12,4) NOT NULL,
    "overtimeMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PulseWorker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulse_schema"."PulseWorkType" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "standardMinutes" DOUBLE PRECISION NOT NULL,
    "complexity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "slaHours" DOUBLE PRECISION NOT NULL DEFAULT 24,
    "requiredSkill" TEXT,
    "automationEligible" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PulseWorkType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulse_schema"."PulseRecord" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "kind" "pulse_schema"."PulseRecordKind" NOT NULL,
    "source" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "teamId" TEXT,
    "workerId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "payload" JSONB NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "fingerprint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PulseRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulse_schema"."PulseRecordRevision" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "actorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PulseRecordRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulse_schema"."PulseScenario" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "teamIds" TEXT[],
    "name" TEXT NOT NULL,
    "workflow" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "calculatorVersion" TEXT NOT NULL,
    "accountRevision" INTEGER NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "parameters" JSONB NOT NULL,
    "baseline" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PulseScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulse_schema"."PulseIntervention" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROPOSED',
    "version" INTEGER NOT NULL DEFAULT 1,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "observation" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PulseIntervention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulse_schema"."PulseReservation" (
    "id" TEXT NOT NULL,
    "interventionId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "teamId" TEXT,
    "week" TIMESTAMP(3) NOT NULL,
    "overtimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "redeployFte" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "released" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PulseReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulse_schema"."PulseAuditEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "accountId" TEXT,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "detail" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PulseAuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulse_schema"."PulseImportBatch" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'VALIDATED',
    "rowCount" INTEGER NOT NULL,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "committedAt" TIMESTAMP(3),

    CONSTRAINT "PulseImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulse_schema"."PulseImportRow" (
    "batchId" TEXT NOT NULL,
    "row" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "error" TEXT,

    CONSTRAINT "PulseImportRow_pkey" PRIMARY KEY ("batchId","row")
);

-- CreateTable
CREATE TABLE "pulse_schema"."PulseMapping" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "connected" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PulseMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BpoAdminGrant_organizationId_idx" ON "pulse_schema"."BpoAdminGrant"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "PulseAccountGrant_memberId_accountId_key" ON "pulse_schema"."PulseAccountGrant"("memberId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "PulseInvitationGrant_invitationId_accountId_key" ON "pulse_schema"."PulseInvitationGrant"("invitationId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientAccount_organizationId_code_key" ON "pulse_schema"."ClientAccount"("organizationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "ClientAccount_organizationId_id_key" ON "pulse_schema"."ClientAccount"("organizationId", "id");

-- CreateIndex
CREATE INDEX "PulseSite_organizationId_accountId_idx" ON "pulse_schema"."PulseSite"("organizationId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "PulseSite_organizationId_accountId_externalId_key" ON "pulse_schema"."PulseSite"("organizationId", "accountId", "externalId");

-- CreateIndex
CREATE INDEX "PulseProcess_organizationId_accountId_idx" ON "pulse_schema"."PulseProcess"("organizationId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "PulseProcess_organizationId_accountId_externalId_key" ON "pulse_schema"."PulseProcess"("organizationId", "accountId", "externalId");

-- CreateIndex
CREATE INDEX "PulseTeam_organizationId_accountId_idx" ON "pulse_schema"."PulseTeam"("organizationId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "PulseTeam_organizationId_accountId_externalId_key" ON "pulse_schema"."PulseTeam"("organizationId", "accountId", "externalId");

-- CreateIndex
CREATE INDEX "PulseWorker_organizationId_accountId_idx" ON "pulse_schema"."PulseWorker"("organizationId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "PulseWorker_organizationId_accountId_externalId_key" ON "pulse_schema"."PulseWorker"("organizationId", "accountId", "externalId");

-- CreateIndex
CREATE INDEX "PulseWorkType_organizationId_accountId_idx" ON "pulse_schema"."PulseWorkType"("organizationId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "PulseWorkType_organizationId_accountId_externalId_key" ON "pulse_schema"."PulseWorkType"("organizationId", "accountId", "externalId");

-- CreateIndex
CREATE INDEX "PulseRecord_organizationId_accountId_kind_occurredAt_idx" ON "pulse_schema"."PulseRecord"("organizationId", "accountId", "kind", "occurredAt");

-- CreateIndex
CREATE INDEX "PulseRecord_organizationId_accountId_teamId_occurredAt_idx" ON "pulse_schema"."PulseRecord"("organizationId", "accountId", "teamId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "PulseRecord_organizationId_accountId_kind_source_externalId_key" ON "pulse_schema"."PulseRecord"("organizationId", "accountId", "kind", "source", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "PulseRecordRevision_recordId_revision_key" ON "pulse_schema"."PulseRecordRevision"("recordId", "revision");

-- CreateIndex
CREATE INDEX "PulseScenario_organizationId_accountId_idx" ON "pulse_schema"."PulseScenario"("organizationId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "PulseIntervention_scenarioId_key" ON "pulse_schema"."PulseIntervention"("scenarioId");

-- CreateIndex
CREATE INDEX "PulseIntervention_organizationId_accountId_status_idx" ON "pulse_schema"."PulseIntervention"("organizationId", "accountId", "status");

-- CreateIndex
CREATE INDEX "PulseReservation_organizationId_accountId_week_released_idx" ON "pulse_schema"."PulseReservation"("organizationId", "accountId", "week", "released");

-- CreateIndex
CREATE INDEX "PulseAuditEvent_organizationId_accountId_createdAt_idx" ON "pulse_schema"."PulseAuditEvent"("organizationId", "accountId", "createdAt");

-- CreateIndex
CREATE INDEX "PulseImportBatch_organizationId_accountId_createdAt_idx" ON "pulse_schema"."PulseImportBatch"("organizationId", "accountId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PulseMapping_organizationId_accountId_name_key" ON "pulse_schema"."PulseMapping"("organizationId", "accountId", "name");

-- AddForeignKey
ALTER TABLE "pulse_schema"."BpoProfile" ADD CONSTRAINT "BpoProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "user_schema"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."BpoAdminGrant" ADD CONSTRAINT "BpoAdminGrant_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "user_schema"."Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."BpoAdminGrant" ADD CONSTRAINT "BpoAdminGrant_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "pulse_schema"."BpoProfile"("organizationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseAccountGrant" ADD CONSTRAINT "PulseAccountGrant_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "user_schema"."Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseAccountGrant" ADD CONSTRAINT "PulseAccountGrant_organizationId_accountId_fkey" FOREIGN KEY ("organizationId", "accountId") REFERENCES "pulse_schema"."ClientAccount"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseTeamGrant" ADD CONSTRAINT "PulseTeamGrant_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "pulse_schema"."PulseAccountGrant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseTeamGrant" ADD CONSTRAINT "PulseTeamGrant_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "pulse_schema"."PulseTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseInvitationGrant" ADD CONSTRAINT "PulseInvitationGrant_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "user_schema"."OrganizationInvitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseInvitationGrant" ADD CONSTRAINT "PulseInvitationGrant_organizationId_accountId_fkey" FOREIGN KEY ("organizationId", "accountId") REFERENCES "pulse_schema"."ClientAccount"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."ClientAccount" ADD CONSTRAINT "ClientAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "pulse_schema"."BpoProfile"("organizationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseSite" ADD CONSTRAINT "PulseSite_organizationId_accountId_fkey" FOREIGN KEY ("organizationId", "accountId") REFERENCES "pulse_schema"."ClientAccount"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseProcess" ADD CONSTRAINT "PulseProcess_organizationId_accountId_fkey" FOREIGN KEY ("organizationId", "accountId") REFERENCES "pulse_schema"."ClientAccount"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseTeam" ADD CONSTRAINT "PulseTeam_organizationId_accountId_fkey" FOREIGN KEY ("organizationId", "accountId") REFERENCES "pulse_schema"."ClientAccount"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseWorker" ADD CONSTRAINT "PulseWorker_organizationId_accountId_fkey" FOREIGN KEY ("organizationId", "accountId") REFERENCES "pulse_schema"."ClientAccount"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseWorkType" ADD CONSTRAINT "PulseWorkType_organizationId_accountId_fkey" FOREIGN KEY ("organizationId", "accountId") REFERENCES "pulse_schema"."ClientAccount"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseRecord" ADD CONSTRAINT "PulseRecord_organizationId_accountId_fkey" FOREIGN KEY ("organizationId", "accountId") REFERENCES "pulse_schema"."ClientAccount"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseRecordRevision" ADD CONSTRAINT "PulseRecordRevision_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "pulse_schema"."PulseRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseScenario" ADD CONSTRAINT "PulseScenario_organizationId_accountId_fkey" FOREIGN KEY ("organizationId", "accountId") REFERENCES "pulse_schema"."ClientAccount"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseIntervention" ADD CONSTRAINT "PulseIntervention_organizationId_accountId_fkey" FOREIGN KEY ("organizationId", "accountId") REFERENCES "pulse_schema"."ClientAccount"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseIntervention" ADD CONSTRAINT "PulseIntervention_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "pulse_schema"."PulseScenario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseReservation" ADD CONSTRAINT "PulseReservation_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "pulse_schema"."PulseIntervention"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseImportBatch" ADD CONSTRAINT "PulseImportBatch_organizationId_accountId_fkey" FOREIGN KEY ("organizationId", "accountId") REFERENCES "pulse_schema"."ClientAccount"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseImportRow" ADD CONSTRAINT "PulseImportRow_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "pulse_schema"."PulseImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseMapping" ADD CONSTRAINT "PulseMapping_organizationId_accountId_fkey" FOREIGN KEY ("organizationId", "accountId") REFERENCES "pulse_schema"."ClientAccount"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
