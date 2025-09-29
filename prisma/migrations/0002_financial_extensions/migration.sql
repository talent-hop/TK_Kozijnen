-- prisma/migrations/0002_financial_extensions/migration.sql
-- Extends window frame costing, invoice document metadata, and payment log tracking.

-- New enum to track invoice document generation lifecycle.
CREATE TYPE "InvoiceDocumentStatus" AS ENUM ('PENDING', 'PROCESSING', 'GENERATED', 'FAILED');

-- Window frame cost breakdown.
ALTER TABLE "WindowFrame"
  ADD COLUMN "costProfiles" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN "costGlazing" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN "costHardware" NUMERIC(10, 2) NOT NULL DEFAULT 0;

-- Invoice document + integration metadata.
ALTER TABLE "Invoice"
  ADD COLUMN "documentStatus" "InvoiceDocumentStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "documentVersion" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "documentUrl" TEXT,
  ADD COLUMN "documentMeta" JSONB,
  ADD COLUMN "documentGeneratedAt" TIMESTAMP(3),
  ADD COLUMN "integrationState" JSONB,
  ADD COLUMN "externalReference" TEXT;

-- Payment log integration for ERP/payment gateways.
CREATE TABLE "PaymentLog" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "invoiceId" UUID NOT NULL,
  "provider" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "amount" NUMERIC(12, 2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'EUR',
  "reference" TEXT,
  "metadata" JSONB,
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentLog_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "PaymentLog_invoiceId_idx" ON "PaymentLog"("invoiceId");