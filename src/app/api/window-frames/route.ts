import { NextRequest } from "next/server";
import {
  createdResponse,
  errorResponse,
  jsonResponse,
} from "@/server/http/response";
import {
  createWindowFrame,
  listWindowFrames,
} from "@/server/modules/windowFrames/service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get("projectId") ?? undefined;
    const windowFrames = await listWindowFrames(projectId ?? undefined);

    return jsonResponse(windowFrames);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const windowFrame = await createWindowFrame(payload);

    return createdResponse(windowFrame);
  } catch (error) {
    return errorResponse(error);
  }
}
