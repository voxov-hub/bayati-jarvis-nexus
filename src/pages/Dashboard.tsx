import { LayoutDashboard, TrendingUp, Package, Eye, ShoppingCart } from "lucide-react";

const stats = [
  { label: "Revenue (MTD)", value: "—", icon: TrendingUp, change: "" },
  { label: "Orders", value: "—", icon: ShoppingCart, change: "" },
  { label: "Products", value: "—", icon: Package, change: "" },
  { label: "Page Views", value: "—", icon: Eye, change: "" },
];

export default function Dashboard() {
  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <header className="px-4 md:px-8 py-4 md:py-6 border-b border-border">
        <h1 className="font-heading text-xl font-semibold flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-primary" />
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Business performance overview</p>
      </header>
      <div className="flex-1 px-4 md:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <s.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="font-heading text-2xl font-semibold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 bg-card border border-border rounded-xl p-6 flex items-center justify-center min-h-[200px]">
          <p className="text-sm text-muted-foreground">Connect data sources to see live metrics. Ask Jarvis to help set this up.</p>
        </div>
      </div>
    </div>
  );
}
