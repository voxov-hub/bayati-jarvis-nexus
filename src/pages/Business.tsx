import { Briefcase, Plus, ArrowRight } from "lucide-react";

const brands = [
  {
    name: "Voxov Design",
    desc: "Premium Scandinavian lighting",
    status: "Active",
    color: "bg-primary/15 text-primary",
  },
];

const futureBrands = ["Posters", "Stickers", "3D Printed Products"];

export default function Business() {
  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <header className="px-4 md:px-8 py-4 md:py-6 border-b border-border">
        <h1 className="font-heading text-xl font-semibold flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          Business
        </h1>
        <p className="text-sm text-muted-foreground mt-1">BayatiCo AB — Your brands and projects</p>
      </header>

      <div className="flex-1 px-4 md:px-8 py-6 space-y-6">
        {/* Active brands */}
        <div>
          <h2 className="font-heading text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Active Brands</h2>
          <div className="grid gap-3">
            {brands.map((b) => (
              <div
                key={b.name}
                className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors cursor-pointer"
              >
                <div>
                  <h3 className="font-heading font-semibold text-foreground">{b.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{b.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${b.color}`}>{b.status}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming */}
        <div>
          <h2 className="font-heading text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Planned Brands</h2>
          <div className="grid gap-2">
            {futureBrands.map((name) => (
              <div key={name} className="bg-muted/30 border border-border/50 rounded-xl p-4 flex items-center justify-between opacity-60">
                <span className="text-sm text-muted-foreground">{name}</span>
                <span className="text-xs text-muted-foreground">Upcoming</span>
              </div>
            ))}
          </div>
        </div>

        <button className="flex items-center gap-2 text-sm text-primary font-medium hover:underline">
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>
    </div>
  );
}
