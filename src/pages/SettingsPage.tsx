import { useState } from "react";
import { Settings, User, Bell, Database, Palette, Hammer } from "lucide-react";
import LovableProjectsSettings from "@/components/LovableProjectsSettings";

const sections = [
  { id: "profile", icon: User, label: "Profile", desc: "Name, email, avatar" },
  { id: "notifications", icon: Bell, label: "Notifications", desc: "Alerts and reminders" },
  { id: "data", icon: Database, label: "Data & Storage", desc: "Backend connection, backups" },
  { id: "appearance", icon: Palette, label: "Appearance", desc: "Theme and display preferences" },
  { id: "lovable", icon: Hammer, label: "Lovable Projects", desc: "Registered build projects" },
];

export default function SettingsPage() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <header className="px-4 md:px-8 py-4 md:py-6 border-b border-border">
        <h1 className="font-heading text-xl font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Settings
        </h1>
      </header>
      <div className="flex-1 px-4 md:px-8 py-6">
        <div className="grid gap-3 max-w-lg">
          {sections.map((s) => (
            <div key={s.id}>
              <div
                onClick={() => setActive(active === s.id ? null : s.id)}
                className={`bg-card border rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-colors cursor-pointer ${
                  active === s.id ? "border-primary/30" : "border-border"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <s.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-sm text-foreground">{s.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              </div>
              {active === s.id && s.id === "lovable" && (
                <div className="mt-3 ml-2">
                  <LovableProjectsSettings />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
