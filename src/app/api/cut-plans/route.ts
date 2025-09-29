import { NextRequest } from "next/server";
import { createdResponse, errorResponse, jsonResponse } from "@/server/http/response";
import { generateCutPlanRecord, listCutPlans } from "@/server/modules/cutPlans/service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get("projectId") ?? undefined;
    const wallId = request.nextUrl.searchParams.get("wallId") ?? undefined;
    const plans = await listCutPlans({ projectId, wallId });
    return jsonResponse(plans);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const plan = await generateCutPlanRecord(payload);
    return createdResponse(plan);
  } catch (error) {
    return errorResponse(error);
  }
}