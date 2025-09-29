import { NextRequest } from "next/server";
import { errorResponse, jsonResponse } from "@/server/http/response";
import { generateInvoiceDocument } from "@/server/modules/invoices/service";

type RouteContext = {
  params: {
    id: string;
  };
};

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest, { params }: RouteContext) {
  try {
    const result = await generateInvoiceDocument(params.id);
    return jsonResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}