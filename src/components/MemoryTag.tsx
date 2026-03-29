import { useState, useEffect, useRef } from "react";
import { Pencil, Check, FolderOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const MEMORY_BASE = "https://pipeline.voxovdesign.com/jarvis/memory";

const DISPLAY_NAMES: Record<string, string> = {
  "fredrik-profile": "Fredrik — Profile",
  "voxov-brand": "Voxov — Brand Identity",
  "voxov-design": "Voxov — Storefront",
  "voxov-social": "Voxov — Social",
};

function toDisplayName(slug: string): string {
  if (DISPLAY_NAMES[slug]) return DISPLAY_NAMES[slug];
  // Derive: split on first hyphen as "group - detail", capitalise words
  const parts = slug.split("-");
  const group = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  if (parts.length === 1) return group;
  const detail = parts.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return `${group} — ${detail}`;
}
interface MemoryTagProps {
  tag: string;
  messageTopic: string;
}

export function MemoryTag({ tag, messageTopic }: MemoryTagProps) {
  const [editing, setEditing] = useState(false);
  const [projects, setProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editing) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setEditing(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editing]);

  async function openEditor() {
    if (editing) {
      setEditing(false);
      return;
    }
    setLoading(true);
    setEditing(true);
    try {
      const resp = await fetch(MEMORY_BASE);
      if (resp.ok) {
        const data = await resp.json();
        const slugs = (data.projects || []).map((p: { project: string }) => p.project);
        setProjects(slugs);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function selectProject(correctedTag: string) {
    setEditing(false);
    if (correctedTag === tag) return;

    await supabase.from("memory_corrections").insert({
      message_topic: messageTopic.slice(0, 200),
      predicted_tag: tag,
      corrected_tag: correctedTag,
    });
  }

  return (
    <div className="relative mt-1.5 flex items-center gap-1" ref={dropdownRef}>
      <span className="text-[11px] text-muted-foreground/60 select-none">
        📁 {toDisplayName(tag)}
      </span>
      <button
        onClick={openEditor}
        className="p-0.5 rounded text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        title="Change memory tag"
      >
        <Pencil className="w-3 h-3" />
      </button>

      {editing && (
        <div className="absolute bottom-full left-0 mb-1 w-56 bg-card border border-border rounded-lg shadow-lg z-50 py-1 max-h-48 overflow-y-auto">
          {loading ? (
            <p className="text-xs text-muted-foreground px-3 py-2">Loading…</p>
          ) : projects.length === 0 ? (
            <p className="text-xs text-muted-foreground px-3 py-2">No projects found</p>
          ) : (
            projects.map((p) => (
              <button
                key={p}
                onClick={() => selectProject(p)}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted/50 transition-colors flex items-center gap-2 ${
                  p === tag ? "text-primary font-medium" : "text-foreground"
                }`}
              >
                <FolderOpen className="w-3 h-3 shrink-0" />
                {toDisplayName(p)}
                {p === tag && <Check className="w-3 h-3 ml-auto text-primary" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
