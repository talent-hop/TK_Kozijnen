import { addDays, isBefore, startOfDay } from "date-fns";
import {
  CreateInvoiceInput,
  Invoice,
  InvoiceStatus,
  UpdateInvoiceInput,
  invoiceStatusValues,
} from "./schemas";

/**
 * Bepaalt de afgeleide status van een factuur:
 * - Als "betaald" => altijd "betaald".
 * - Anders, als dueDate bestaat en in het verleden ligt => "over datum".
 * - Anders behoud de huidige/ingevulde status.
 */
export function deriveInvoiceStatus<T extends Pick<Invoice, "status" | "dueDate">>(
  inv: T,
  now: Date = new Date(),
): InvoiceStatus {
  // Betaald blijft leidend
  if (inv.status === "betaald") return "betaald";

  const today = startOfDay(now);

  if (inv.dueDate) {
    const due = startOfDay(new Date(inv.dueDate));
    if (isBefore(due, today)) {
      return "over datum";
    }
  }
  return inv.status;
}

/**
 * Hulpfunctie om veilig een status literal te forceren.
 */
function asStatus(s: string | undefined): InvoiceStatus {
  const accepted = new Set<InvoiceStatus>(invoiceStatusValues as unknown as InvoiceStatus[]);
  return accepted.has(s as InvoiceStatus) ? (s as InvoiceStatus) : "offerte";
}

/**
 * Voor gebruik bij create: valideer met schema in je service,
 * roep daarna deze functie aan om "over datum" correct af te leiden.
 */
export function prepareCreateInvoice(input: CreateInvoiceInput, now: Date = new Date()): CreateInvoiceInput {
  const next: CreateInvoiceInput = { ...input };
  next.status = deriveInvoiceStatus(
    {
      status: asStatus(next.status),
      dueDate: next.dueDate ?? null,
    } as any,
    now,
  );
  return next;
}

/**
 * Voor gebruik bij update: combineer met bestaande data en leid opnieuw af.
 * - Als betaalstatus al "betaald" was of wordt, blijft die leidend.
 * - Anders wordt "over datum" afgeleid o.b.v. dueDate.
 */
export function prepareUpdateInvoice(
  existing: Invoice,
  patch: UpdateInvoiceInput,
  now: Date = new Date(),
): UpdateInvoiceInput {
  const merged = {
    status: asStatus(patch.status ?? existing.status),
    dueDate: patch.dueDate ?? existing.dueDate ?? null,
  } as Pick<Invoice, "status" | "dueDate">;

  const derived = deriveInvoiceStatus(merged, now);
  return { ...patch, status: derived };
}

/**
 * Hulpfuncties voor vervaltermijnen
 */
export function withNetDays(d: Date | string | undefined | null, netDays: number): Date {
  const base = d ? new Date(d) : new Date();
  return addDays(base, netDays);
}

/**
 * Periodieke helper om bestaande facturen te “refreshen” qua status.
 * Handig om te draaien bij elke fetch of via een cron.
 */
export function refreshOverdueStatus<T extends Invoice>(invoice: T, now: Date = new Date()): T {
  const nextStatus = deriveInvoiceStatus(invoice, now);
  if (nextStatus === invoice.status) return invoice;
  return { ...invoice, status: nextStatus };
}