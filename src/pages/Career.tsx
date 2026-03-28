import { TrendingUp, Target, FileText, DollarSign } from "lucide-react";

const goals = [
  { icon: Target, label: "Career Goals", desc: "Track and update your professional objectives" },
  { icon: FileText, label: "CV & Applications", desc: "Keep your CV updated and manage job applications" },
  { icon: DollarSign, label: "Salary Strategy", desc: "Market insights and negotiation planning" },
];

export default function Career() {
  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <header className="px-4 md:px-8 py-4 md:py-6 border-b border-border">
        <h1 className="font-heading text-xl font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Career
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Your career development and job market strategy</p>
      </header>
      <div className="flex-1 px-4 md:px-8 py-6">
        <div className="grid gap-3 max-w-lg">
          {goals.map((g) => (
            <div key={g.label} className="bg-card border border-border rounded-xl p-4 flex items-start gap-4 hover:border-primary/30 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <g.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm text-foreground">{g.label}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{g.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
