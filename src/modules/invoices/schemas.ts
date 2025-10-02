import { z } from "zod";

/**
 * Line item schema and inferred type
 * - total is optional; if omitted, your service computes it as quantity * unitPrice
 */
export const invoiceLineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().finite().nonnegative(),
  unitPrice: z.number().finite().nonnegative(),
  total: z.number().finite().nonnegative().optional(),
});

export type InvoiceLineItem = z.infer<typeof invoiceLineItemSchema>;

/**
 * Create Invoice schema
 * - Marked .passthrough() so additional fields (e.g., customerId, projectId, status)
 *   flow through to Prisma without being stripped.
 */
export const createInvoiceSchema = z
  .object({
    number: z.string().min(1),
    currency: z.string().min(1),
    // Often present, but optional here to stay flexible with your DB layer:
    customerId: z.string().min(1).optional(),
    projectId: z.string().min(1).nullable().optional(),
    issueDate: z.coerce.date().optional(),
    dueDate: z.coerce.date().nullable().optional(),

    totalAmount: z.number().finite().nonnegative().optional(),
    lineItems: z.array(invoiceLineItemSchema).optional(),
  })
  .passthrough();

/**
 * Update Invoice schema
 * - Keep flexible with .passthrough() to allow other updatable fields.
 * - documentStatus kept as string to avoid coupling to Prisma enums here.
 */
export const updateInvoiceSchema = z
  .object({
    lineItems: z.array(invoiceLineItemSchema).optional(),
    totalAmount: z.number().finite().nonnegative().optional(),
    documentStatus: z.string().optional(),
    documentGeneratedAt: z.coerce.date().optional(),
  })
  .passthrough();

/**
 * Create Payment Log schema
 * - Matches fields used in appendPaymentLog() in service.ts
 */
export const createPaymentLogSchema = z.object({
  provider: z.string().min(1),
  status: z.string().min(1),
  amount: z.number().finite().nonnegative(),
  currency: z.string().min(1),

  reference: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
  processedAt: z.coerce.date().optional(),
});

export default {};
