-- prisma/migrations/0003_layout_cutting/migration.sql
-- Adds wall/window instance modelling and cut planning tables.

CREATE TYPE "CutPlanStrategy" AS ENUM ('GREEDY', 'ILP');
CREATE TYPE "CutPlanStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

CREATE TABLE "Wall" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "projectId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "widthMm" INTEGER NOT NULL,
  "heightMm" INTEGER,
  "elevation" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Wall_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Wall_projectId_idx" ON "Wall"("projectId");

CREATE TABLE "WindowInstance" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "wallId" UUID NOT NULL,
  "windowFrameId" UUID,
  "label" TEXT NOT NULL,
  "positionXMm" INTEGER NOT NULL DEFAULT 0,
  "positionYMm" INTEGER NOT NULL DEFAULT 0,
  "sillHeightMm" INTEGER NOT NULL DEFAULT 0,
  "widthMm" INTEGER NOT NULL,
  "heightMm" INTEGER NOT NULL,
  "rotationDeg" INTEGER NOT NULL DEFAULT 0,
  "config" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WindowInstance_wallId_fkey" FOREIGN KEY ("wallId") REFERENCES "Wall"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "WindowInstance_windowFrameId_fkey" FOREIGN KEY ("windowFrameId") REFERENCES "WindowFrame"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "WindowInstance_wallId_idx" ON "WindowInstance"("wallId");
CREATE INDEX "WindowInstance_windowFrameId_idx" ON "WindowInstance"("windowFrameId");

CREATE TABLE "InventoryProfile" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sku" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "profileType" TEXT,
  "lengthMm" INTEGER NOT NULL,
  "stockQuantity" INTEGER NOT NULL DEFAULT 0,
  "scrapAllowanceMm" INTEGER NOT NULL DEFAULT 0,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "InventoryProfile_sku_key" ON "InventoryProfile"("sku");

CREATE TABLE "CutPlan" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "projectId" UUID NOT NULL,
  "wallId" UUID,
  "strategy" "CutPlanStrategy" NOT NULL DEFAULT 'GREEDY',
  "status" "CutPlanStatus" NOT NULL DEFAULT 'PENDING',
  "summary" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CutPlan_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CutPlan_wallId_fkey" FOREIGN KEY ("wallId") REFERENCES "Wall"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "CutPlan_projectId_idx" ON "CutPlan"("projectId");
CREATE INDEX "CutPlan_wallId_idx" ON "CutPlan"("wallId");
CREATE INDEX "CutPlan_status_idx" ON "CutPlan"("status");

CREATE TABLE "CutPlanItem" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "cutPlanId" UUID NOT NULL,
  "inventoryProfileId" UUID NOT NULL,
  "sourceLengthMm" INTEGER NOT NULL,
  "usedLengthMm" INTEGER NOT NULL,
  "wasteLengthMm" INTEGER NOT NULL,
  "segments" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CutPlanItem_cutPlanId_fkey" FOREIGN KEY ("cutPlanId") REFERENCES "CutPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CutPlanItem_inventoryProfileId_fkey" FOREIGN KEY ("inventoryProfileId") REFERENCES "InventoryProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "CutPlanItem_cutPlanId_idx" ON "CutPlanItem"("cutPlanId");
CREATE INDEX "CutPlanItem_inventoryProfileId_idx" ON "CutPlanItem"("inventoryProfileId");