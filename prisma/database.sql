-- database.sql
-- Consolidated schema and seed data for the kozijnen_fabriek Postgres database.
-- Generated to mirror prisma/migrations/0001_init and prisma/seed.ts.

BEGIN;

-- Ensure cryptographic UUID generation is available.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing objects to allow clean re-creation.
DROP TABLE IF EXISTS "CutPlanItem" CASCADE;
DROP TABLE IF EXISTS "CutPlan" CASCADE;
DROP TABLE IF EXISTS "WindowInstance" CASCADE;
DROP TABLE IF EXISTS "Wall" CASCADE;
DROP TABLE IF EXISTS "InventoryProfile" CASCADE;
DROP TABLE IF EXISTS "PaymentLog" CASCADE;
DROP TABLE IF EXISTS "Invoice" CASCADE;
DROP TABLE IF EXISTS "WindowFrame" CASCADE;
DROP TABLE IF EXISTS "Project" CASCADE;
DROP TABLE IF EXISTS "InventoryItem" CASCADE;
DROP TABLE IF EXISTS "Customer" CASCADE;
DROP TYPE IF EXISTS "CutPlanStatus" CASCADE;
DROP TYPE IF EXISTS "CutPlanStrategy" CASCADE;
DROP TYPE IF EXISTS "InvoiceDocumentStatus" CASCADE;
DROP TYPE IF EXISTS "InvoiceType" CASCADE;
DROP TYPE IF EXISTS "InvoiceStatus" CASCADE;
DROP TYPE IF EXISTS "ProjectStatus" CASCADE;

-- Recreate enumerations.
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'IN_PRODUCTION', 'COMPLETED', 'ON_HOLD');
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'CANCELLED');
CREATE TYPE "InvoiceType" AS ENUM ('QUOTE', 'INVOICE');
CREATE TYPE "InvoiceDocumentStatus" AS ENUM ('PENDING', 'PROCESSING', 'GENERATED', 'FAILED');
CREATE TYPE "CutPlanStrategy" AS ENUM ('GREEDY', 'ILP');
CREATE TYPE "CutPlanStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- Core tables.
CREATE TABLE "Customer" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "contactPerson" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

CREATE TABLE "Project" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "reference" TEXT,
  "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
  "customerId" UUID NOT NULL,
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Project_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Project_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "Project_customerId_idx" ON "Project"("customerId");

CREATE TABLE "WindowFrame" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "projectId" UUID NOT NULL,
  "label" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Awaiting glass',
  "widthMm" INTEGER NOT NULL,
  "heightMm" INTEGER NOT NULL,
  "configuration" JSONB,
  "materials" JSONB,
  "unitPrice" NUMERIC(10, 2),
  "costProfiles" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "costGlazing" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "costHardware" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WindowFrame_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "WindowFrame_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "WindowFrame_projectId_idx" ON "WindowFrame"("projectId");
CREATE TABLE "Wall" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "projectId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "widthMm" INTEGER NOT NULL,
  "heightMm" INTEGER,
  "elevation" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Wall_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Wall_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Wall_projectId_idx" ON "Wall"("projectId");

CREATE TABLE "WindowInstance" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
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
  CONSTRAINT "WindowInstance_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "WindowInstance_wallId_fkey" FOREIGN KEY ("wallId") REFERENCES "Wall"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "WindowInstance_windowFrameId_fkey" FOREIGN KEY ("windowFrameId") REFERENCES "WindowFrame"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "WindowInstance_wallId_idx" ON "WindowInstance"("wallId");
CREATE INDEX "WindowInstance_windowFrameId_idx" ON "WindowInstance"("windowFrameId");

CREATE TABLE "Invoice" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "customerId" UUID NOT NULL,
  "projectId" UUID,
  "number" TEXT NOT NULL,
  "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dueDate" TIMESTAMP(3),
  "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
  "type" "InvoiceType" NOT NULL DEFAULT 'QUOTE',
  "currency" TEXT NOT NULL DEFAULT 'EUR',
  "documentStatus" "InvoiceDocumentStatus" NOT NULL DEFAULT 'PENDING',
  "documentVersion" INTEGER NOT NULL DEFAULT 1,
  "documentUrl" TEXT,
  "documentMeta" JSONB,
  "documentGeneratedAt" TIMESTAMP(3),
  "integrationState" JSONB,
  "externalReference" TEXT,
  "lineItems" JSONB NOT NULL,
  "totalAmount" NUMERIC(12, 2) NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Invoice_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Invoice_number_key" ON "Invoice"("number");
CREATE INDEX "Invoice_customerId_idx" ON "Invoice"("customerId");
CREATE INDEX "Invoice_projectId_idx" ON "Invoice"("projectId");

CREATE TABLE "InventoryItem" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "sku" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 0,
  "unit" TEXT NOT NULL,
  "location" TEXT,
  "minQuantity" INTEGER DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "InventoryItem_sku_key" ON "InventoryItem"("sku");

CREATE TABLE "PaymentLog" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "invoiceId" UUID NOT NULL,
  "provider" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "amount" NUMERIC(12, 2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'EUR',
  "reference" TEXT,
  "metadata" JSONB,
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentLog_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PaymentLog_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "PaymentLog_invoiceId_idx" ON "PaymentLog"("invoiceId");
-- Seed data (mirrors prisma/seed.ts).
INSERT INTO "Customer" ("id", "name", "contactPerson", "email", "phone", "address", "notes") VALUES
  ('00000000-0000-0000-0000-000000000011', 'AluFast BV', 'Iris van Dijk', 'sales@alufast.nl', '+31 20 123 4567', 'Industrieweg 12, Amsterdam', 'Preferred aluminium supplier')
ON CONFLICT ("email") DO UPDATE SET
  "phone" = EXCLUDED."phone",
  "address" = EXCLUDED."address",
  "contactPerson" = EXCLUDED."contactPerson";

INSERT INTO "Customer" ("id", "name", "contactPerson", "email", "phone", "address") VALUES
  ('00000000-0000-0000-0000-000000000012', 'Stadionbouw NV', 'Mark Jansen', 'inkoop@stadionbouw.nl', '+31 10 765 8899', 'Havenspoor 44, Rotterdam')
ON CONFLICT ("email") DO UPDATE SET
  "phone" = EXCLUDED."phone",
  "address" = EXCLUDED."address",
  "contactPerson" = EXCLUDED."contactPerson";

INSERT INTO "Project" ("id", "name", "reference", "status", "customerId", "startDate", "description") VALUES
  ('00000000-0000-0000-0000-000000000001', 'Residence Aurora', 'PRJ-1001', 'PLANNING', '00000000-0000-0000-0000-000000000011', '2025-10-01', '24 premium residential frames')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Project" ("id", "name", "reference", "status", "customerId", "startDate", "endDate", "description") VALUES
  ('00000000-0000-0000-0000-000000000002', 'City Park Offices', 'PRJ-1002', 'IN_PRODUCTION', '00000000-0000-0000-0000-000000000012', '2025-09-15', '2025-12-20', '56 office units with tilt & turn windows')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WindowFrame" ("id", "projectId", "label", "status", "widthMm", "heightMm", "materials", "configuration", "unitPrice", "costProfiles", "costGlazing", "costHardware", "notes") VALUES
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Living room - Hinged', 'Awaiting glass', 1200, 1400, '{"frame":"uPVC Profile A","glazing":"HR++"}'::jsonb, '{"divisions":2}'::jsonb, 785.00, 320.00, 220.00, 150.00, 'Awaiting glass delivery')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WindowFrame" ("id", "projectId", "label", "status", "widthMm", "heightMm", "materials", "configuration", "unitPrice", "costProfiles", "costGlazing", "costHardware", "notes") VALUES
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000002', 'Kitchen - Tilt & Turn', 'Ready for assembly', 900, 1100, '{"frame":"uPVC Profile B","glazing":"Triple"}'::jsonb, '{"divisions":3}'::jsonb, 645.00, 280.00, 190.00, 120.00, 'Ready for assembly')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Invoice" ("id", "customerId", "projectId", "number", "status", "type", "currency", "totalAmount", "lineItems", "notes", "documentStatus") VALUES
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'INV-2025-001', 'DRAFT', 'QUOTE', 'EUR', 12540, '[{"label":"Window package","quantity":24,"unitPrice":522.5,"total":12540}]'::jsonb, 'Pending approval', 'PROCESSING')
ON CONFLICT ("number") DO UPDATE SET
  "status" = EXCLUDED."status",
  "totalAmount" = EXCLUDED."totalAmount",
  "lineItems" = EXCLUDED."lineItems",
  "notes" = EXCLUDED."notes",
  "documentStatus" = EXCLUDED."documentStatus";

INSERT INTO "Invoice" ("id", "customerId", "projectId", "number", "status", "type", "currency", "totalAmount", "lineItems", "documentStatus", "documentUrl", "documentGeneratedAt", "documentMeta", "integrationState", "externalReference") VALUES
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000002', 'INV-2025-002', 'SENT', 'INVOICE', 'EUR', 24180, '[{"label":"Installation batch","quantity":56,"unitPrice":432.5,"total":24180}]'::jsonb, 'GENERATED', 's3://kozijnen/invoices/INV-2025-002.pdf', TIMESTAMP '2025-09-18 10:15:00', '{"template":"standard","renderedBy":"system","version":1}'::jsonb, '{"system":"ExactOnline","state":"SYNCED","syncedAt":"2025-09-19T08:12:00Z"}'::jsonb, 'ERP-INV-2025-002')
ON CONFLICT ("number") DO UPDATE SET
  "status" = EXCLUDED."status",
  "totalAmount" = EXCLUDED."totalAmount",
  "documentStatus" = EXCLUDED."documentStatus",
  "documentUrl" = EXCLUDED."documentUrl",
  "documentGeneratedAt" = EXCLUDED."documentGeneratedAt",
  "documentMeta" = EXCLUDED."documentMeta",
  "integrationState" = EXCLUDED."integrationState",
  "externalReference" = EXCLUDED."externalReference";

INSERT INTO "InventoryItem" ("id", "sku", "name", "category", "quantity", "unit", "location", "minQuantity") VALUES
  ('00000000-0000-0000-0000-000000000301', 'MAT-001', 'uPVC Profile A', 'Frame', 120, 'lengths', 'Warehouse 1', 50)
ON CONFLICT ("sku") DO UPDATE SET
  "quantity" = EXCLUDED."quantity",
  "location" = EXCLUDED."location";

INSERT INTO "InventoryItem" ("id", "sku", "name", "category", "quantity", "unit", "location", "minQuantity") VALUES
  ('00000000-0000-0000-0000-000000000302', 'MAT-002', 'Multi-point Lock', 'Hardware', 85, 'sets', 'Assembly', 40)
ON CONFLICT ("sku") DO UPDATE SET
  "quantity" = EXCLUDED."quantity",
  "location" = EXCLUDED."location";

INSERT INTO "InventoryItem" ("id", "sku", "name", "category", "quantity", "unit", "location", "minQuantity") VALUES
  ('00000000-0000-0000-0000-000000000303', 'MAT-003', 'HR++ Glass Panel', 'Glazing', 48, 'panels', 'Glass Storage', 30)
ON CONFLICT ("sku") DO UPDATE SET
  "quantity" = EXCLUDED."quantity",
  "location" = EXCLUDED."location";

INSERT INTO "PaymentLog" ("id", "invoiceId", "provider", "status", "amount", "currency", "reference", "metadata", "processedAt") VALUES
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000201', 'Mollie', 'PENDING', 5000, 'EUR', 'PAY-2025-001-DEP', '{"method":"BankTransfer"}'::jsonb, NULL),
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000202', 'Adyen', 'SETTLED', 24180, 'EUR', 'PAY-2025-002-01', '{"method":"iDEAL","fee":180.4}'::jsonb, TIMESTAMP '2025-09-20 12:00:00');
COMMIT;
