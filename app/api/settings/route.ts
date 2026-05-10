import { NextResponse } from "next/server";
import { getSettings, logAudit, setSettings } from "@/lib/db";
import type { Settings } from "@/lib/types";

export async function GET() {
  return NextResponse.json(await getSettings());
}

export async function PUT(req: Request) {
  const body = (await req.json()) as Settings;
  await setSettings(body);
  await logAudit({ action: "update", entity: "settings", entityId: "global" });
  return NextResponse.json(body);
}
