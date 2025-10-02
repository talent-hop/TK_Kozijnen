import { v4 as uuid } from "uuid";
import {
  CreateInvoiceInput,
  Invoice,
  InvoiceLineItem,
  InvoiceStatus,
} from "./schemas";
import {
  prepareCreateInvoice,
  prepareUpdateInvoice,
  refreshOverdueStatus,
  withNetDays,
} from "./logic";

/**
 * Minimale project shape: pas aan naar jouw projectschema.
 */
export type ProjectRef = {
  id: string; // projectId
  customerId: string;
  defaultCurrency?: "EUR" | "USD" | "GBP";
};

/**
 * 1) Maak een OFFERTE (status: "offerte") op basis van project + regels.
 */
export function createQuoteFromProject(
  project: ProjectRef,
  lineItems: InvoiceLineItem[],
  opts?: {
    number?: string; // eigen nummering of laat backend genereren
    notes?: string;
    currency?: "EUR" | "USD" | "GBP";
    issueDate?: Date;
  },
): CreateInvoiceInput {
  const totalAmount = lineItems.reduce((sum, li) => {
    const total = li.total ?? li.quantity * li.unitPrice;
    return sum + total;
  }, 0);

  const draft: CreateInvoiceInput = {
    number: opts?.number ?? `Q-${new Date().getFullYear()}-${uuid().slice(0, 6)}`,
    customerId: project.customerId,
    projectId: project.id,
    issueDate: opts?.issueDate ?? new Date(),
    dueDate: null, // offerte heeft doorgaans geen dueDate
    status: "offerte",
    type: "QUOTE",
    currency: opts?.currency ?? project.defaultCurrency ?? "EUR",
    totalAmount,
    notes: opts?.notes,
    lineItems,
    documentStatus: "PENDING",
    documentVersion: 1,
  };

  // Afleiden (heeft geen effect op offertes, maar houdt gedrag consistent)
  return prepareCreateInvoice(draft);
}

/**
 * 2) Offerte -> GEFACTUREERD: zet type op INVOICE, vul dueDate (netto X dagen),
 *    en status naar "gefactureerd".
 */
export function issueInvoiceFromQuote(
  existing: Invoice,
  opts?: { netDays?: number; dueDate?: Date },
): Partial<Invoice> {
  if (existing.status === "betaald") return existing; // al betaald, niks doen
  const netDays = opts?.netDays ?? 30;

  const patch = {
    type: "INVOICE" as const,
    status: "gefactureerd" as InvoiceStatus,
    dueDate: opts?.dueDate ?? withNetDays(existing.issueDate, netDays),
  };

  return {
    ...existing,
    ...prepareUpdateInvoice(existing, patch),
  };
}

/**
 * 3) Betaling registreren: zodra volledig voldaan, zet status "betaald".
 *    (De logica om 'volledig' te bepalen kan uitgebreider op basis van paymentLogs.)
 */
export function markAsPaid(existing: Invoice): Invoice {
  if (existing.status === "betaald") return existing;
  const patch = { status: "betaald" as InvoiceStatus };
  return { ...existing, ...prepareUpdateInvoice(existing, patch) };
}

/**
 * 4) Refresh op ophalen of via cron: zet "over datum" automatisch indien nodig.
 */
export function refreshOnRead(existing: Invoice, now: Date = new Date()): Invoice {
  return refreshOverdueStatus(existing, now);
}