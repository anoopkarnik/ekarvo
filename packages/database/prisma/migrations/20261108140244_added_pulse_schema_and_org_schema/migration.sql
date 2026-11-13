/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,accountId,id]` on the table `PulseProcess` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,accountId,id]` on the table `PulseSite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,accountId,id]` on the table `PulseTeam` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,accountId,id]` on the table `PulseWorkType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,accountId,id]` on the table `PulseWorker` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PulseProcess_organizationId_accountId_id_key" ON "pulse_schema"."PulseProcess"("organizationId", "accountId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "PulseSite_organizationId_accountId_id_key" ON "pulse_schema"."PulseSite"("organizationId", "accountId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "PulseTeam_organizationId_accountId_id_key" ON "pulse_schema"."PulseTeam"("organizationId", "accountId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "PulseWorkType_organizationId_accountId_id_key" ON "pulse_schema"."PulseWorkType"("organizationId", "accountId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "PulseWorker_organizationId_accountId_id_key" ON "pulse_schema"."PulseWorker"("organizationId", "accountId", "id");

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseTeam" ADD CONSTRAINT "PulseTeam_organizationId_accountId_processId_fkey" FOREIGN KEY ("organizationId", "accountId", "processId") REFERENCES "pulse_schema"."PulseProcess"("organizationId", "accountId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseTeam" ADD CONSTRAINT "PulseTeam_organizationId_accountId_siteId_fkey" FOREIGN KEY ("organizationId", "accountId", "siteId") REFERENCES "pulse_schema"."PulseSite"("organizationId", "accountId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseWorker" ADD CONSTRAINT "PulseWorker_organizationId_accountId_teamId_fkey" FOREIGN KEY ("organizationId", "accountId", "teamId") REFERENCES "pulse_schema"."PulseTeam"("organizationId", "accountId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseWorkType" ADD CONSTRAINT "PulseWorkType_organizationId_accountId_processId_fkey" FOREIGN KEY ("organizationId", "accountId", "processId") REFERENCES "pulse_schema"."PulseProcess"("organizationId", "accountId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseRecord" ADD CONSTRAINT "PulseRecord_organizationId_accountId_teamId_fkey" FOREIGN KEY ("organizationId", "accountId", "teamId") REFERENCES "pulse_schema"."PulseTeam"("organizationId", "accountId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_schema"."PulseRecord" ADD CONSTRAINT "PulseRecord_organizationId_accountId_workerId_fkey" FOREIGN KEY ("organizationId", "accountId", "workerId") REFERENCES "pulse_schema"."PulseWorker"("organizationId", "accountId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
