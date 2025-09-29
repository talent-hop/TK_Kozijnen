import { NextRequest } from "next/server";
import {
  createdResponse,
  errorResponse,
  jsonResponse,
} from "@/server/http/response";
import {
  createInventoryItem,
  listInventoryItems,
} from "@/server/modules/inventory/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await listInventoryItems();
    return jsonResponse(items);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const item = await createInventoryItem(payload);
    return createdResponse(item);
  } catch (error) {
    return errorResponse(error);
  }
}
