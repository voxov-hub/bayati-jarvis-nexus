import { useState } from "react";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { getProjects, saveProjects, LovableProject } from "@/lib/lovable-projects";
import { toast } from "sonner";

export default function LovableProjectsSettings() {
  const [projects, setProjects] = useState<LovableProject[]>(getProjects);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", description: "" });

  const handleAdd = () => {
    if (!form.name || !form.url) {
      toast.error("Name and URL are required");
      return;
    }
    const newProject: LovableProject = {
      id: form.name.toLowerCase().replace(/\s+/g, "-"),
      ...form,
    };
    const updated = [...projects, newProject];
    saveProjects(updated);
    setProjects(updated);
    setForm({ name: "", url: "", description: "" });
    setAdding(false);
    toast.success(`Added ${form.name}`);
  };

  const handleRemove = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    saveProjects(updated);
    setProjects(updated);
    toast.success("Project removed");
  };

  const handleUpdate = (id: string, field: keyof Omit<LovableProject, "id">, value: string) => {
    const updated = projects.map((p) =>
      p.id === id ? { ...p, [field]: value } : p
    );
    saveProjects(updated);
    setProjects(updated);
  };

  return (
    <div className="space-y-3">
      {projects.map((p) => (
        <div key={p.id} className="bg-card border border-border rounded-xl p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <input
              value={p.name}
              onChange={(e) => handleUpdate(p.id, "name", e.target.value)}
              className="font-heading font-semibold text-sm text-foreground bg-transparent outline-none w-full"
            />
            <div className="flex items-center gap-1 shrink-0">
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button onClick={() => handleRemove(p.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <input
            value={p.url}
            onChange={(e) => handleUpdate(p.id, "url", e.target.value)}
            placeholder="https://lovable.dev/projects/..."
            className="text-xs text-muted-foreground bg-transparent outline-none w-full"
          />
          <input
            value={p.description}
            onChange={(e) => handleUpdate(p.id, "description", e.target.value)}
            placeholder="Short description..."
            className="text-xs text-muted-foreground bg-transparent outline-none w-full"
          />
        </div>
      ))}

      {adding ? (
        <div className="bg-card border border-primary/30 rounded-xl p-4 space-y-2">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Project name"
            className="font-heading font-semibold text-sm text-foreground bg-transparent outline-none w-full"
          />
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://lovable.dev/projects/..."
            className="text-xs text-muted-foreground bg-transparent outline-none w-full"
          />
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Short description..."
            className="text-xs text-muted-foreground bg-transparent outline-none w-full"
          />
          <div className="flex gap-2 pt-1">
            <button onClick={handleAdd} className="text-xs bg-primary text-primary-foreground rounded-lg px-3 py-1.5 font-medium">Add</button>
            <button onClick={() => setAdding(false)} className="text-xs text-muted-foreground">Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center justify-center gap-2 border border-dashed border-border rounded-xl p-3 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      )}
    </div>
  );
}
