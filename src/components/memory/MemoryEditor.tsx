import { useState, useEffect } from "react";
import { ChevronLeft, Loader2, Plus, X, Save } from "lucide-react";
import { fetchMemoryFile, saveMemoryFile, getDisplayName } from "@/lib/memory-api";
import type { MemoryFile } from "@/lib/memory-api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MemoryEditorProps {
  slug: string;
  onBack: () => void;
}

interface RecentUsage {
  message_topic: string;
  created_at: string;
}

export function MemoryEditor({ slug, onBack }: MemoryEditorProps) {
  const [file, setFile] = useState<MemoryFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recentUsage, setRecentUsage] = useState<RecentUsage[]>([]);

  useEffect(() => {
    loadFile();
    loadRecentUsage();
  }, [slug]);

  async function loadFile() {
    setLoading(true);
    try {
      const data = await fetchMemoryFile(slug);
      setFile({
        project: data.project || slug,
        current_status: data.current_status || "",
        key_context: data.key_context || "",
        recent_decisions: data.recent_decisions || [],
        next_actions: data.next_actions || [],
        wins: data.wins || [],
        notes: data.notes || "",
      });
    } catch {
      toast.error("Failed to load memory file");
    } finally {
      setLoading(false);
    }
  }

  async function loadRecentUsage() {
    const { data } = await supabase
      .from("memory_corrections")
      .select("message_topic, created_at")
      .eq("corrected_tag", slug)
      .order("created_at", { ascending: false })
      .limit(5);
    if (data) setRecentUsage(data);
  }

  async function handleSave() {
    if (!file) return;
    setSaving(true);
    try {
      await saveMemoryFile(slug, file);
      toast.success("Memory saved");
    } catch {
      toast.error("Failed to save — try again");
    } finally {
      setSaving(false);
    }
  }

  function updateField<K extends keyof MemoryFile>(key: K, value: MemoryFile[K]) {
    if (!file) return;
    setFile({ ...file, [key]: value });
  }

  function updateListItem(key: "recent_decisions" | "next_actions" | "wins", idx: number, value: string) {
    if (!file) return;
    const list = [...file[key]];
    list[idx] = value;
    setFile({ ...file, [key]: list });
  }

  function addListItem(key: "recent_decisions" | "next_actions" | "wins") {
    if (!file) return;
    setFile({ ...file, [key]: [...file[key], ""] });
  }

  function removeListItem(key: "recent_decisions" | "next_actions" | "wins", idx: number) {
    if (!file) return;
    setFile({ ...file, [key]: file[key].filter((_, i) => i !== idx) });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!file) return null;

  return (
    <div className="space-y-5">
      {/* Mobile back */}
      <button
        onClick={onBack}
        className="md:hidden flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2"
      >
        <ChevronLeft className="w-4 h-4" /> Back to files
      </button>

      <h3 className="font-heading font-semibold text-foreground">{getDisplayName(slug)}</h3>

      {/* Current Status */}
      <FieldBlock label="Current status">
        <input
          type="text"
          value={file.current_status}
          onChange={(e) => updateField("current_status", e.target.value)}
          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/40"
        />
      </FieldBlock>

      {/* Key Context */}
      <FieldBlock label="Key context">
        <textarea
          value={file.key_context}
          onChange={(e) => updateField("key_context", e.target.value)}
          rows={3}
          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none resize-none focus:border-primary/40"
        />
      </FieldBlock>

      {/* Dynamic Lists */}
      <DynamicList
        label="Recent decisions"
        items={file.recent_decisions}
        onChange={(idx, val) => updateListItem("recent_decisions", idx, val)}
        onAdd={() => addListItem("recent_decisions")}
        onRemove={(idx) => removeListItem("recent_decisions", idx)}
      />
      <DynamicList
        label="Next actions"
        items={file.next_actions}
        onChange={(idx, val) => updateListItem("next_actions", idx, val)}
        onAdd={() => addListItem("next_actions")}
        onRemove={(idx) => removeListItem("next_actions", idx)}
      />
      <DynamicList
        label="Wins"
        items={file.wins}
        onChange={(idx, val) => updateListItem("wins", idx, val)}
        onAdd={() => addListItem("wins")}
        onRemove={(idx) => removeListItem("wins", idx)}
      />

      {/* Notes */}
      <FieldBlock label="Notes">
        <textarea
          value={file.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          rows={4}
          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none resize-none focus:border-primary/40"
        />
      </FieldBlock>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Saving..." : "Save changes"}
      </button>

      {/* Recently used in */}
      {recentUsage.length > 0 && (
        <div className="pt-4 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">Recently used in</p>
          <div className="space-y-1">
            {recentUsage.map((u, i) => (
              <p key={i} className="text-xs text-muted-foreground truncate">
                {u.message_topic.length > 60 ? u.message_topic.slice(0, 60) + "…" : u.message_topic}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FieldBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function DynamicList({
  label,
  items,
  onChange,
  onAdd,
  onRemove,
}: {
  label: string;
  items: string[];
  onChange: (idx: number, val: string) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => onChange(i, e.target.value)}
              className="flex-1 bg-muted border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary/40"
            />
            <button
              onClick={() => onRemove(i)}
              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
      >
        <Plus className="w-3 h-3" /> Add
      </button>
    </div>
  );
}
