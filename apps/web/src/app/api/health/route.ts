import { NextResponse } from "next/server";

export const GET = (): NextResponse => {
  return NextResponse.json({ ok: true, service: "web" });
};
