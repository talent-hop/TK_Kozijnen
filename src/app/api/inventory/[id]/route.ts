import { NextRequest } from "next/server";
import {
  deleteInventoryItem,
  getInventoryItemById,
  updateInventoryItem,
} from "@/server/modules/inventory/service";
import {
  errorResponse,
  jsonResponse,
  noContentResponse,
  notFoundResponse,
} from "@/server/http/response";

type RouteContext = {
  params: {
    id: string;
  };
};

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const item = await getInventoryItemById(context.params.id);
    if (!item) {
      return notFoundResponse("Inventory item not found");
    }
    return jsonResponse(item);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const payload = await request.json();
    const item = await updateInventoryItem(context.params.id, payload);
    return jsonResponse(item);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await deleteInventoryItem(context.params.id);
    return noContentResponse();
  } catch (error) {
    return errorResponse(error);
  }
}
