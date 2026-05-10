import { getSettings } from "@/lib/db";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted">Brand-wide configuration that flows through every WhatsApp link.</p>
      </header>
      <SettingsForm initial={settings} />
    </div>
  );
}
