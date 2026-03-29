import { useState, useEffect, useCallback } from "react";
import { UtensilsCrossed, ShoppingCart, ChevronDown, Loader2, RefreshCw, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = "https://pipeline.voxovdesign.com/jarvis/meal-plan";

interface MealDay {
  day: string;
  meal: string;
  description: string;
  ica_offer?: string | null;
}

interface ShoppingItem {
  name: string;
  quantity: string;
}

interface ShoppingCategory {
  category: string;
  items: ShoppingItem[];
}

interface MealPlanData {
  week_number: number;
  generated_at: string;
  people: number;
  estimated_cost: string;
  meals: MealDay[];
  shopping_list: ShoppingCategory[];
}

const CATEGORY_ORDER = [
  "Frukt & Grönt",
  "Kött & Chark",
  "Mejeri & Ägg",
  "Torrvaror & Konserver",
  "Bröd & Bageri",
  "Övrigt",
];

function sortCategories(list: ShoppingCategory[]): ShoppingCategory[] {
  return [...list].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.category);
    const bi = CATEGORY_ORDER.indexOf(b.category);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" });
}

export function MealPlan() {
  const [plan, setPlan] = useState<MealPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (res.status === 404) {
        setPlan(null);
        return;
      }
      if (!res.ok) throw new Error("Kunde inte hämta matsedeln");
      const data = await res.json();
      setPlan(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Okänt fel";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const generatePlan = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ people: 4 }),
      });
      if (!res.ok) throw new Error("Kunde inte generera matsedeln");
      await fetchPlan();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Okänt fel";
      setError(msg);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Laddar matsedel...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-destructive mb-4">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchPlan}>
          Försök igen
        </Button>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <UtensilsCrossed className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-heading font-semibold text-foreground mb-1">Ingen matsedel ännu</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Generera en veckomatsedel baserad på aktuella ICA-erbjudanden
        </p>
        <Button onClick={generatePlan} disabled={generating} className="gap-2">
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Genererar...
            </>
          ) : (
            "Generera matsedel"
          )}
        </Button>
      </div>
    );
  }

  const sortedCategories = sortCategories(plan.shopping_list);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-primary" />
            Vecka {plan.week_number}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Genererad {formatDate(plan.generated_at)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={generatePlan}
          disabled={generating}
          className="gap-1.5 text-xs"
        >
          {generating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          Generera ny matsedel
        </Button>
      </div>

      {/* Meal cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence>
          {plan.meals.map((meal, i) => (
            <motion.div
              key={meal.day}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
            >
              <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1.5">
                {meal.day}
              </p>
              <h3 className="font-heading font-semibold text-sm text-foreground leading-snug">
                {meal.meal}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {meal.description}
              </p>
              {meal.ica_offer && (
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                  <Tag className="w-2.5 h-2.5" />
                  {meal.ica_offer}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Shopping list */}
      <div>
        <h3 className="font-heading font-semibold text-sm text-foreground flex items-center gap-2 mb-3">
          <ShoppingCart className="w-4 h-4 text-primary" />
          Inköpslista
        </h3>
        <div className="space-y-1">
          {sortedCategories.map((cat) => (
            <ShoppingCategorySection key={cat.category} category={cat} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
        <span>{plan.people} personer</span>
        <span>Uppskattad kostnad: {plan.estimated_cost}</span>
      </div>
    </div>
  );
}

function ShoppingCategorySection({ category }: { category: ShoppingCategory }) {
  return (
    <Collapsible>
      <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group text-left">
        <span className="text-sm font-medium text-foreground">{category.category}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{category.items.length} varor</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-3 pb-2 grid gap-0.5">
          {category.items.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between py-1.5 px-2 text-sm rounded hover:bg-muted/30 transition-colors"
            >
              <span className="text-foreground">{item.name}</span>
              <span className="text-xs text-muted-foreground">{item.quantity}</span>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
