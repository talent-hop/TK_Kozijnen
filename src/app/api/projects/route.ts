import { NextRequest } from "next/server";
import {
  createdResponse,
  errorResponse,
  jsonResponse,
} from "@/server/http/response";
import {
  createProject,
  listProjects,
} from "@/server/modules/projects/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await listProjects();
    return jsonResponse(projects);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const project = await createProject(payload);

    return createdResponse(project);
  } catch (error) {
    return errorResponse(error);
  }
}
