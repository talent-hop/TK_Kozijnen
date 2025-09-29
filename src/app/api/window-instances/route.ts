import { NextRequest } from "next/server";
import { createdResponse, errorResponse, jsonResponse } from "@/server/http/response";
import { createWindowInstance, listWindowInstances } from "@/server/modules/windowInstances/service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const wallId = request.nextUrl.searchParams.get("wallId") ?? undefined;
    const projectId = request.nextUrl.searchParams.get("projectId") ?? undefined;
    const instances = await listWindowInstances({ wallId, projectId });
    return jsonResponse(instances);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const instance = await createWindowInstance(payload);
    return createdResponse(instance);
  } catch (error) {
    return errorResponse(error);
  }
}