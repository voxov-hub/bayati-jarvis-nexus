import { useState, useEffect, useCallback } from "react";
import { Brain } from "lucide-react";
import { fetchMemoryIndex } from "@/lib/memory-api";
import type { MemoryIndex } from "@/lib/memory-api";
import { supabase } from "@/integrations/supabase/client";
import { MemoryFileList } from "./MemoryFileList";
import { MemoryEditor } from "./MemoryEditor";

export function MemoryManager() {
  const [index, setIndex] = useState<MemoryIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});

  const loadIndex = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMemoryIndex();
      setIndex(data);
    } catch {
      setIndex({ projects: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTagCounts = useCallback(async () => {
    const { data } = await supabase
      .from("memory_corrections")
      .select("corrected_tag");
    if (data) {
      const counts: Record<string, number> = {};
      for (const row of data) {
        counts[row.corrected_tag] = (counts[row.corrected_tag] || 0) + 1;
      }
      setTagCounts(counts);
    }
  }, []);

  useEffect(() => {
    loadIndex();
    loadTagCounts();
  }, [loadIndex, loadTagCounts]);

  const handleSelect = (slug: string) => {
    setSelectedSlug(slug);
  };

  const handleBack = () => {
    setSelectedSlug(null);
  };

  const handleRefresh = () => {
    loadIndex();
    setSelectedSlug(null);
  };

  return (
    <div className="mt-8 border-t border-border pt-8">
      <h2 className="font-heading text-lg font-semibold flex items-center gap-2 mb-5">
        <Brain className="w-5 h-5 text-primary" />
        Memory manager
      </h2>

      {/* Mobile: show one panel at a time */}
      <div className="md:hidden">
        {selectedSlug ? (
          <div className="bg-card border border-border rounded-xl p-4">
            <MemoryEditor slug={selectedSlug} onBack={handleBack} />
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-4">
            <MemoryFileList
              index={index}
              loading={loading}
              selectedSlug={selectedSlug}
              tagCounts={tagCounts}
              onSelect={handleSelect}
              onRefresh={handleRefresh}
            />
          </div>
        )}
      </div>

      {/* Desktop: side-by-side */}
      <div className="hidden md:grid md:grid-cols-[280px_1fr] gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <MemoryFileList
            index={index}
            loading={loading}
            selectedSlug={selectedSlug}
            tagCounts={tagCounts}
            onSelect={handleSelect}
            onRefresh={handleRefresh}
          />
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          {selectedSlug ? (
            <MemoryEditor slug={selectedSlug} onBack={handleBack} />
          ) : (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              Select a memory file to edit
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
