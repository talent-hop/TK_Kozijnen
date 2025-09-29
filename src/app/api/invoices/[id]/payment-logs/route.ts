import { NextRequest } from "next/server";
import { createdResponse, errorResponse } from "@/server/http/response";
import { appendPaymentLog } from "@/server/modules/invoices/service";

type RouteContext = {
  params: {
    id: string;
  };
};

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const payload = await request.json();
    const paymentLog = await appendPaymentLog(params.id, payload);
    return createdResponse(paymentLog);
  } catch (error) {
    return errorResponse(error);
  }
}