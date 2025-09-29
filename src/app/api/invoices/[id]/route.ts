import { NextRequest } from "next/server";
import {
  errorResponse,
  jsonResponse,
  noContentResponse,
  notFoundResponse,
} from "@/server/http/response";
import {
  deleteInvoice,
  getInvoiceById,
  updateInvoice,
} from "@/server/modules/invoices/service";

type RouteContext = {
  params: {
    id: string;
  };
};

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const invoice = await getInvoiceById(params.id);
    if (!invoice) {
      return notFoundResponse("Invoice not found");
    }

    return jsonResponse(invoice);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const payload = await request.json();
    const invoice = await updateInvoice(params.id, payload);
    return jsonResponse(invoice);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    await deleteInvoice(params.id);
    return noContentResponse();
  } catch (error) {
    return errorResponse(error);
  }
}