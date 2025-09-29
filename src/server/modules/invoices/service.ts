import { InvoiceDocumentStatus, Prisma } from "@prisma/client";
import {
  InvoiceLineItem,
  createInvoiceSchema,
  createPaymentLogSchema,
  updateInvoiceSchema,
} from "@/modules/invoices/schemas";
import { prisma } from "@/server/db/client";

type InvoiceInclude = Prisma.InvoiceFindManyArgs["include"];

const invoiceInclude: InvoiceInclude = {
  customer: true,
  project: true,
  paymentLogs: {
    orderBy: { createdAt: "desc" },
  },
};

type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
  include: typeof invoiceInclude;
}>;

type UpdateInvoicePayload = Record<string, unknown>;

type DocumentPayload = {
  header: {
    number: string;
    status: string;
    issueDate: string;
    dueDate: string | null;
    customerName: string;
    projectName: string | null;
    currency: string;
  };
  totals: {
    totalAmount: number;
    outstanding: number;
  };
  items: InvoiceLineItem[];
  payments: {
    provider: string;
    status: string;
    amount: number;
    processedAt: string | null;
  }[];
};

const normaliseDecimal = (value: Prisma.Decimal | number | null | undefined) => {
  if (value === null || value === undefined) {
    return 0;
  }

  return typeof value === "number" ? value : Number(value);
};

const computeTotals = (items: InvoiceLineItem[]) => {
  const computed = items.map((item) => {
    const total = item.total ?? item.quantity * item.unitPrice;
    return { ...item, total };
  });
  const totalAmount = computed.reduce((sum, item) => sum + (item.total ?? 0), 0);
  return { items: computed, totalAmount };
};

function buildDocumentPayload(invoice: InvoiceWithRelations): DocumentPayload {
  return {
    header: {
      number: invoice.number,
      status: invoice.status,
      issueDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
      customerName: invoice.customer.name,
      projectName: invoice.project?.name ?? null,
      currency: invoice.currency,
    },
    totals: {
      totalAmount: normaliseDecimal(invoice.totalAmount),
      outstanding: normaliseDecimal(invoice.totalAmount),
    },
    items: (invoice.lineItems as InvoiceLineItem[]) ?? [],
    payments:
      invoice.paymentLogs?.map((log) => ({
        provider: log.provider,
        status: log.status,
        amount: normaliseDecimal(log.amount),
        processedAt: log.processedAt ? log.processedAt.toISOString() : null,
      })) ?? [],
  };
}

export async function listInvoices() {
  return prisma.invoice.findMany({
    include: invoiceInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function createInvoice(input: unknown) {
  const data = createInvoiceSchema.parse(input);
  const { items, totalAmount } = computeTotals(data.lineItems ?? []);
  const totalValue = data.totalAmount ?? totalAmount;

  return prisma.invoice.create({
    data: {
      ...data,
      totalAmount: new Prisma.Decimal(totalValue),
      lineItems: items,
    },
    include: invoiceInclude,
  });
}

export async function updateInvoice(id: string, input: unknown) {
  const data = updateInvoiceSchema.parse(input);
  const updatePayload: UpdateInvoicePayload = { ...data };

  if (data.lineItems) {
    const { items, totalAmount } = computeTotals(data.lineItems);
    updatePayload.lineItems = items;
    updatePayload.totalAmount = new Prisma.Decimal(data.totalAmount ?? totalAmount);
  } else if (typeof data.totalAmount === "number") {
    updatePayload.totalAmount = new Prisma.Decimal(data.totalAmount);
  }

  if (
    data.documentStatus === InvoiceDocumentStatus.GENERATED &&
    updatePayload.documentGeneratedAt === undefined &&
    data.documentGeneratedAt === undefined
  ) {
    updatePayload.documentGeneratedAt = new Date();
  }

  return prisma.invoice.update({
    where: { id },
    data: updatePayload,
    include: invoiceInclude,
  });
}

export async function getInvoiceById(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: invoiceInclude,
  });
}

export async function deleteInvoice(id: string) {
  await prisma.invoice.delete({ where: { id } });
}

export async function generateInvoiceDocument(id: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: invoiceInclude,
  });

  if (!invoice) {
    throw new Error(`Invoice ${id} not found`);
  }

  const payload = buildDocumentPayload(invoice);
  const generatedAt = new Date();

  const updated = await prisma.invoice.update({
    where: { id },
    data: {
      documentStatus: InvoiceDocumentStatus.GENERATED,
      documentVersion: { increment: 1 },
      documentGeneratedAt: generatedAt,
      documentMeta: payload,
    },
    include: invoiceInclude,
  });

  return {
    invoice: updated,
    document: payload,
  };
}

export async function appendPaymentLog(invoiceId: string, input: unknown) {
  const data = createPaymentLogSchema.parse(input);

  const paymentLog = await prisma.paymentLog.create({
    data: {
      invoiceId,
      provider: data.provider,
      status: data.status,
      amount: new Prisma.Decimal(data.amount),
      currency: data.currency,
      reference: data.reference,
      metadata: data.metadata,
      processedAt: data.processedAt ?? null,
    },
  });

  return paymentLog;
}