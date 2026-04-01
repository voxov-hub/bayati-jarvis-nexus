const MEMORY_BASE = "https://pipeline.voxovdesign.com/jarvis/memory";

export interface MemoryIndex {
  projects: Array<{ filename: string; project: string }>;
}

export interface MemoryFile {
  project: string;
  current_status: string;
  key_context: string;
  recent_decisions: string[];
  next_actions: string[];
  wins: string[];
  notes: string;
}

const DISPLAY_NAMES: Record<string, string> = {
  "fredrik-profile": "Fredrik — Profile",
  "voxov-brand": "Voxov — Brand Identity",
  "voxov-design": "Voxov — Storefront",
  "voxov-social": "Voxov — Social",
};

export function getDisplayName(slug: string): string {
  if (DISPLAY_NAMES[slug]) return DISPLAY_NAMES[slug];
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function fetchMemoryIndex(): Promise<MemoryIndex> {
  const resp = await fetch(MEMORY_BASE);
  if (!resp.ok) throw new Error("Failed to load memory index");
  return resp.json();
}

export async function fetchMemoryFile(slug: string): Promise<MemoryFile> {
  const resp = await fetch(`${MEMORY_BASE}/${slug}`);
  if (!resp.ok) throw new Error(`Failed to load memory file: ${slug}`);
  return resp.json();
}

export async function saveMemoryFile(slug: string, data: MemoryFile): Promise<void> {
  const resp = await fetch(`${MEMORY_BASE}/${slug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!resp.ok) throw new Error("Failed to save memory file");
}

export async function deleteMemoryFile(slug: string): Promise<void> {
  const resp = await fetch(`${MEMORY_BASE}/${slug}`, { method: "DELETE" });
  if (!resp.ok) throw new Error("Failed to delete memory file");
}

export function createEmptyMemoryFile(slug: string): MemoryFile {
  return {
    project: slug,
    current_status: "",
    key_context: "",
    recent_decisions: [],
    next_actions: [],
    wins: [],
    notes: "",
  };
}
