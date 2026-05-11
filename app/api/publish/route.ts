import { NextResponse } from "next/server";
import { triggerStorefrontRebuildAndReport } from "@/lib/deploy-hook";
import { logAudit } from "@/lib/db";

/**
 * Manual "Publish to storefront" trigger. Hits the Render Deploy Hook and
 * reports what happened so the admin sees clear feedback.
 *
 * Auth: protected by middleware (requires session) — only admins can call.
 */
export async function POST() {
  const result = await triggerStorefrontRebuildAndReport();
  if (result.ok) {
    await logAudit({ action: "publish", entity: "storefront", entityId: "manual" });
  }
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
