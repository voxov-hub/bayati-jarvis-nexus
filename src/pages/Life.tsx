import { Heart, Flag, Bell, Users } from "lucide-react";
import { MealPlan } from "@/components/MealPlan";

const areas = [
  { icon: Flag, label: "Personal Goals", desc: "Financial independence, health, growth" },
  { icon: Bell, label: "Reminders", desc: "Important dates and recurring tasks" },
  { icon: Users, label: "Family", desc: "Family priorities and planning" },
];

export default function Life() {
  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <header className="px-4 md:px-8 py-4 md:py-6 border-b border-border">
        <h1 className="font-heading text-xl font-semibold flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          Life
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Personal goals, family, and priorities</p>
      </header>
      <div className="flex-1 px-4 md:px-8 py-6 space-y-8">
        <div className="grid gap-3 max-w-lg">
          {areas.map((a) => (
            <div key={a.label} className="bg-card border border-border rounded-xl p-4 flex items-start gap-4 hover:border-primary/30 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <a.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm text-foreground">{a.label}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Veckans Matsedel */}
        <section>
          <MealPlan />
        </section>
      </div>
    </div>
  );
}
