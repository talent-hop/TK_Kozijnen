import { NextRequest } from "next/server";
import {
  deleteWindowFrame,
  getWindowFrameById,
  updateWindowFrame,
} from "@/server/modules/windowFrames/service";
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
    const windowFrame = await getWindowFrameById(context.params.id);

    if (!windowFrame) {
      return notFoundResponse("Window frame not found");
    }

    return jsonResponse(windowFrame);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const payload = await request.json();
    const windowFrame = await updateWindowFrame(context.params.id, payload);

    return jsonResponse(windowFrame);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await deleteWindowFrame(context.params.id);
    return noContentResponse();
  } catch (error) {
    return errorResponse(error);
  }
}