import { useState } from "react";
import { Copy, ExternalLink, X, Check } from "lucide-react";
import { getProjects, LovableProject } from "@/lib/lovable-projects";
import { toast } from "sonner";

interface LovableBriefCardProps {
  prompt: string;
  suggestedProject?: string;
  onDismiss: () => void;
}

export default function LovableBriefCard({ prompt, suggestedProject, onDismiss }: LovableBriefCardProps) {
  const projects = getProjects();
  const initial = suggestedProject
    ? projects.find((p) => p.id === suggestedProject || p.name.toLowerCase().includes(suggestedProject.toLowerCase()))
    : projects[0];
  const [selectedProject, setSelectedProject] = useState<LovableProject | undefined>(initial || projects[0]);
  const [editedPrompt, setEditedPrompt] = useState(prompt);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(editedPrompt);
    setCopied(true);
    toast.success("Prompt copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAndOpen = async () => {
    await navigator.clipboard.writeText(editedPrompt);
    toast.success("Prompt copied — opening Lovable");
    if (selectedProject?.url) {
      window.open(selectedProject.url, "_blank");
    }
  };

  return (
    <div className="bg-card border border-primary/30 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-primary/10 border-b border-primary/20">
        <span className="text-xs font-heading font-semibold text-primary tracking-wide uppercase">
          Lovable Brief
        </span>
        <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editable prompt */}
      <div className="p-4">
        <textarea
          value={editedPrompt}
          onChange={(e) => setEditedPrompt(e.target.value)}
          className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground resize-none outline-none focus:border-primary/50 transition-colors"
          rows={6}
        />

        {/* Project selector */}
        <div className="mt-3">
          <label className="text-xs text-muted-foreground mb-1.5 block">Target project</label>
          <select
            value={selectedProject?.id || ""}
            onChange={(e) => setSelectedProject(projects.find((p) => p.id === e.target.value))}
            className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={copyAndOpen}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Copy & Open Lovable
          </button>
          <button
            onClick={copyToClipboard}
            className="flex items-center justify-center gap-1.5 border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={onDismiss}
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
