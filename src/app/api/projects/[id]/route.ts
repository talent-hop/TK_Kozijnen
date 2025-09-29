import { NextRequest } from "next/server";
import {
  deleteProject,
  getProjectById,
  updateProject,
} from "@/server/modules/projects/service";
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
    const project = await getProjectById(context.params.id);

    if (!project) {
      return notFoundResponse("Project not found");
    }

    return jsonResponse(project);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const payload = await request.json();
    const project = await updateProject(context.params.id, payload);

    return jsonResponse(project);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await deleteProject(context.params.id);
    return noContentResponse();
  } catch (error) {
    return errorResponse(error);
  }
}