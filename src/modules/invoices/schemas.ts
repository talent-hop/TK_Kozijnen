import { z } from "zod";
import {
  currencyValues,
  invoiceDocumentStatusValues,
  invoiceTypeValues,
} from "@/modules/shared/constants";

/**
 * Nederlandse statuswaarden conform gewenste workflow.
 * - "offerte": concept/offertefase
 * - "gefactureerd": verzonden/uitstaande factuur
 * - "betaald": voldaan
 * - "over datum": vervallen (dueDate in verleden en niet betaald)
 *
 * Let op: "over datum" wordt in de flow/logic automatisch afgeleid
 * o.b.v. dueDate en huidige datum, behalve wanneer status "betaald" is.
 */
export const invoiceStatusValues = [
  "offerte",
  "gefactureerd",
  "betaald",
  "over datum",
] as const;

const jsonRecordSchema = z.record(z.string(), z.any());

export const invoiceLineItemSchema = z.object({
  label: z.string().min(1),
  description: z.string().optional(),
  quantity: z.coerce.number().int().positive(),
  unitPrice: z.coerce.number().nonnegative(),
  total: z.coerce.number().nonnegative().optional(),
});

export const paymentLogSchema = z.object({
  id: z.string().uuid(),
  invoiceId: z.string().uuid(),
  provider: z.string().min(1),
  status: z.string().min(1),
  amount: z.coerce.number().nonnegative(),
  currency: z.enum(currencyValues),
  reference: z.string().optional(),
  metadata: jsonRecordSchema.optional(),
  processedAt: z.coerce.date().nullable().optional(),
  createdAt: z.date(),
});

export const invoiceSchema = z.object({
  id: z.string().uuid(),
  number: z.string().min(1),
  customerId: z.string().uuid(),
  /**
   * Facturen worden op basis van projecten gemaakt => verplicht.
   */
  projectId: z.string().uuid(),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date().nullable().optional(),
  status: z.enum(invoiceStatusValues),
  type: z.enum(invoiceTypeValues),
  currency: z.enum(currencyValues),
  totalAmount: z.coerce.number().nonnegative(),
  notes: z.string().optional(),
  lineItems: z.array(invoiceLineItemSchema).default([]),
  documentStatus: z.enum(invoiceDocumentStatusValues),
  documentVersion: z.coerce.number().int().positive(),
  documentUrl: z.string().min(1).optional(),
  documentGeneratedAt: z.coerce.date().nullable().optional(),
  documentMeta: jsonRecordSchema.optional(),
  integrationState: jsonRecordSchema.optional(),
  externalReference: z.string().optional(),
  paymentLogs: z.array(paymentLogSchema).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createInvoiceSchema = invoiceSchema
  .omit({
    id: true,
    paymentLogs: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    issueDate: z.coerce.date().default(() => new Date()),
    status: z.enum(invoiceStatusValues).default("offerte"),
    type: z.enum(invoiceTypeValues).default("QUOTE"),
    currency: z.enum(currencyValues).default("EUR"),
    totalAmount: z.coerce.number().nonnegative().optional(),
    documentStatus: z.enum(invoiceDocumentStatusValues).default("PENDING"),
    documentVersion: z.coerce.number().int().positive().default(1),
    documentGeneratedAt: z.coerce.date().nullable().optional(),
    documentUrl: z.string().min(1).optional(),
    documentMeta: jsonRecordSchema.optional(),
    integrationState: jsonRecordSchema.optional(),
    externalReference: z.string().optional(),
  });

export const updateInvoiceSchema = createInvoiceSchema.partial();

/**
 * Types
 */
export type Invoice = z.infer<typeof invoiceSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type InvoiceLineItem = z.infer<typeof invoiceLineItemSchema>;
export type PaymentLog = z.infer<typeof paymentLogSchema>;
export type CreatePaymentLogInput = z.infer<typeof createPaymentLogSchema>;
export type InvoiceStatus = (typeof invoiceStatusValues)[number];
