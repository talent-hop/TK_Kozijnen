export const projectStatusValues = [
  "PLANNING",
  "IN_PRODUCTION",
  "COMPLETED",
  "ON_HOLD",
] as const;

export const invoiceStatusValues = [
  "OFFERTE",
  "FACTUUR",
  "BETAALD",
  "OVER_DATUM",
] as const;

export const invoiceTypeValues = ["QUOTE", "INVOICE"] as const;

export const currencyValues = ["EUR", "USD", "GBP"] as const;
export const invoiceDocumentStatusValues = ["PENDING", "PROCESSING", "GENERATED", "FAILED"] as const;
