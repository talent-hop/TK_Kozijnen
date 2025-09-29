import { NextRequest } from "next/server";
import {
  createdResponse,
  errorResponse,
  jsonResponse,
} from "@/server/http/response";
import {
  createCustomer,
  listCustomers,
} from "@/server/modules/customers/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customers = await listCustomers();
    return jsonResponse(customers);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const customer = await createCustomer(payload);

    return createdResponse(customer);
  } catch (error) {
    return errorResponse(error);
  }
}
