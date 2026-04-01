import { useState } from "react";
import { Plus, Trash2, Loader2, Brain } from "lucide-react";
import { getDisplayName, deleteMemoryFile, saveMemoryFile, createEmptyMemoryFile } from "@/lib/memory-api";
import type { MemoryIndex } from "@/lib/memory-api";
import { toast } from "sonner";

interface MemoryFileListProps {
  index: MemoryIndex | null;
  loading: boolean;
  selectedSlug: string | null;
  tagCounts: Record<string, number>;
  onSelect: (slug: string) => void;
  onRefresh: () => void;
}

export function MemoryFileList({ index, loading, selectedSlug, tagCounts, onSelect, onRefresh }: MemoryFileListProps) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleCreate = async () => {
    const slug = newName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (!slug) return;
    setCreating(true);
    try {
      await saveMemoryFile(slug, createEmptyMemoryFile(slug));
      toast.success("Memory file created");
      setNewName("");
      setShowNewForm(false);
      onRefresh();
    } catch {
      toast.error("Failed to create memory file");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (slug: string) => {
    setDeletingSlug(slug);
    try {
      await deleteMemoryFile(slug);
      toast.success("Memory file deleted");
      setConfirmDelete(null);
      onRefresh();
    } catch {
      toast.error("Failed to delete memory file");
    } finally {
      setDeletingSlug(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!index || index.projects.length === 0) {
    return (
      <div className="text-center py-12">
        <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground mb-4">No memory files yet</p>
        <button
          onClick={() => setShowNewForm(true)}
          className="text-sm text-primary font-medium hover:underline"
        >
          Create your first memory file
        </button>
        {showNewForm && (
          <NewFileForm
            newName={newName}
            setNewName={setNewName}
            creating={creating}
            onCreate={handleCreate}
            onCancel={() => { setShowNewForm(false); setNewName(""); }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {index.projects.map((p) => (
        <div key={p.project} className="group relative">
          {confirmDelete === p.project ? (
            <div className="bg-card border border-destructive/30 rounded-lg p-3 flex items-center justify-between gap-2">
              <span className="text-xs text-foreground">Delete this file?</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(p.project)}
                  disabled={deletingSlug === p.project}
                  className="text-xs text-destructive font-medium hover:underline disabled:opacity-50"
                >
                  {deletingSlug === p.project ? "Deleting..." : "Yes, delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onSelect(p.project)}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors ${
                selectedSlug === p.project
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-muted border border-transparent"
              }`}
            >
              <div>
                <p className="text-sm font-medium text-foreground">{getDisplayName(p.project)}</p>
                {(tagCounts[p.project] ?? 0) > 0 && (
                  <span className="text-[10px] text-primary font-medium mt-0.5 inline-block">
                    {tagCounts[p.project]} corrections
                  </span>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(p.project); }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </button>
          )}
        </div>
      ))}

      {showNewForm ? (
        <NewFileForm
          newName={newName}
          setNewName={setNewName}
          creating={creating}
          onCreate={handleCreate}
          onCancel={() => { setShowNewForm(false); setNewName(""); }}
        />
      ) : (
        <button
          onClick={() => setShowNewForm(true)}
          className="w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2 text-sm text-primary font-medium hover:bg-muted transition-colors"
        >
          <Plus className="w-4 h-4" /> New memory file
        </button>
      )}
    </div>
  );
}

function NewFileForm({
  newName,
  setNewName,
  creating,
  onCreate,
  onCancel,
}: {
  newName: string;
  setNewName: (v: string) => void;
  creating: boolean;
  onCreate: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-2 px-3 py-3 bg-card border border-border rounded-lg space-y-2">
      <input
        type="text"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        placeholder="project-name"
        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/40"
        onKeyDown={(e) => e.key === "Enter" && onCreate()}
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={onCreate}
          disabled={!newName.trim() || creating}
          className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create"}
        </button>
        <button onClick={onCancel} className="text-xs text-muted-foreground hover:underline">
          Cancel
        </button>
      </div>
    </div>
  );
}
