import { NextRequest } from "next/server";
import {
  deleteCustomer,
  getCustomerById,
  updateCustomer,
} from "@/server/modules/customers/service";
import {
  errorResponse,
  jsonResponse,
  noContentResponse,
  notFoundResponse,
} from "@/server/http/response";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const customer = await getCustomerById(context.params.id);

    if (!customer) {
      return notFoundResponse("Customer not found");
    }

    return jsonResponse(customer);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const payload = await request.json();
    const customer = await updateCustomer(context.params.id, payload);

    return jsonResponse(customer);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await deleteCustomer(context.params.id);
    return noContentResponse();
  } catch (error) {
    return errorResponse(error);
  }
}