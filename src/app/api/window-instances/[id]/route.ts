import { NextRequest } from "next/server";
import { errorResponse, jsonResponse, noContentResponse } from "@/server/http/response";
import {
  deleteWindowInstance,
  getWindowInstanceById,
  updateWindowInstance,
} from "@/server/modules/windowInstances/service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const instance = await getWindowInstanceById(params.id);
    return jsonResponse(instance);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const payload = await request.json();
    const instance = await updateWindowInstance(params.id, payload);
    return jsonResponse(instance);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    await deleteWindowInstance(params.id);
    return noContentResponse();
  } catch (error) {
    return errorResponse(error);
  }
}