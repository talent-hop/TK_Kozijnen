import { NextRequest } from "next/server";
import { createdResponse, errorResponse, jsonResponse } from "@/server/http/response";
import { createWall, listWalls } from "@/server/modules/walls/service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get("projectId") ?? undefined;
    const walls = await listWalls(projectId);
    return jsonResponse(walls);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const wall = await createWall(payload);
    return createdResponse(wall);
  } catch (error) {
    return errorResponse(error);
  }
}