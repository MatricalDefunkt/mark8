import { NextRequest, NextResponse } from "next/server";
import { roleKeySchema } from "@vada/contracts";
import { getDashboardSnapshot } from "../../../../server/dashboard-metrics";

const parseRole = (
  input: string | null,
): "admin" | "billing" | "sales" | "client" => {
  const parsed = roleKeySchema.safeParse(input ?? "client");
  return parsed.success ? parsed.data : "client";
};

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const role = parseRole(request.nextUrl.searchParams.get("role"));
  const snapshot = await getDashboardSnapshot(role);

  return NextResponse.json(snapshot, {
    headers: {
      "cache-control": "no-store",
    },
  });
};
