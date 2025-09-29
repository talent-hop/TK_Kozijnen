import { NextRequest } from "next/server";
import { errorResponse, jsonResponse, noContentResponse } from "@/server/http/response";
import { deleteCutPlan, getCutPlanById } from "@/server/modules/cutPlans/service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const plan = await getCutPlanById(params.id);
    return jsonResponse(plan);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    await deleteCutPlan(params.id);
    return noContentResponse();
  } catch (error) {
    return errorResponse(error);
  }
}