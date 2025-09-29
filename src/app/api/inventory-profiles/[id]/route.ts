import { NextRequest } from "next/server";
import { errorResponse, jsonResponse, noContentResponse } from "@/server/http/response";
import {
  deleteInventoryProfile,
  getInventoryProfileById,
  updateInventoryProfile,
} from "@/server/modules/inventoryProfiles/service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const profile = await getInventoryProfileById(params.id);
    return jsonResponse(profile);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const payload = await request.json();
    const profile = await updateInventoryProfile(params.id, payload);
    return jsonResponse(profile);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    await deleteInventoryProfile(params.id);
    return noContentResponse();
  } catch (error) {
    return errorResponse(error);
  }
}