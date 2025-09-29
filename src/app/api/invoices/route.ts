import { NextRequest } from "next/server";
import {
  createdResponse,
  errorResponse,
  jsonResponse,
} from "@/server/http/response";
import {
  createInvoice,
  listInvoices,
} from "@/server/modules/invoices/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const invoices = await listInvoices();
    return jsonResponse(invoices);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const invoice = await createInvoice(payload);

    return createdResponse(invoice);
  } catch (error) {
    return errorResponse(error);
  }
}
