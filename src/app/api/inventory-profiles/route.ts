import { NextRequest } from "next/server";
import { createdResponse, errorResponse, jsonResponse } from "@/server/http/response";
import {
  createInventoryProfile,
  listInventoryProfiles,
} from "@/server/modules/inventoryProfiles/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profiles = await listInventoryProfiles();
    return jsonResponse(profiles);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const profile = await createInventoryProfile(payload);
    return createdResponse(profile);
  } catch (error) {
    return errorResponse(error);
  }
}