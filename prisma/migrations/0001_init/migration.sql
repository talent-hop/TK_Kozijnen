-- prisma/migrations/0001_init/migration.sql
-- Creates core tables and enums for the kozijnen-fabriek platform.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'IN_PRODUCTION', 'COMPLETED', 'ON_HOLD');
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'CANCELLED');
CREATE TYPE "InvoiceType" AS ENUM ('QUOTE', 'INVOICE');

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
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WindowFrame_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "WindowFrame_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "WindowFrame_projectId_idx" ON "WindowFrame"("projectId");

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