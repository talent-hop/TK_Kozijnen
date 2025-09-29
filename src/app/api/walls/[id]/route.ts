import { NextRequest } from "next/server";
import { errorResponse, jsonResponse, noContentResponse } from "@/server/http/response";
import { deleteWall, getWallById, updateWall } from "@/server/modules/walls/service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const wall = await getWallById(params.id);
    return jsonResponse(wall);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const payload = await request.json();
    const wall = await updateWall(params.id, payload);
    return jsonResponse(wall);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    await deleteWall(params.id);
    return noContentResponse();
  } catch (error) {
    return errorResponse(error);
  }
}