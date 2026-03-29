import { useState, useRef } from "react";
import { ImageIcon, Sparkles } from "lucide-react";
import { PipelineTimeline } from "@/components/image-studio/PipelineTimeline";
import { Gallery, useGenerationCount } from "@/components/image-studio/Gallery";
import type { PipelineState, PipelineStep } from "@/components/image-studio/types";

const PIPELINE_URL = "https://pipeline.voxovdesign.com";

export default function ImageStudio() {
  const [brief, setBrief] = useState("");
  const [imageType, setImageType] = useState("product");
  const [state, setState] = useState<PipelineState>({ step: "idle" });
  const [isGenerating, setIsGenerating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const generationCount = useGenerationCount();

  const generate = async () => {
    if (!brief.trim() || isGenerating) return;
    setIsGenerating(true);
    setState({ step: "prompt" });

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(`${PIPELINE_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: brief.trim(), image_type: imageType }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) throw new Error("Pipeline request failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event = JSON.parse(line.slice(6));
              handlePipelineEvent(event);
            } catch {
              // skip partial JSON
            }
          }
        }
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      if (error.name !== "AbortError") {
        setState((prev) => ({ ...prev, step: "error", error: error.message }));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePipelineEvent = (event: Record<string, unknown>) => {
    const step = event.step as PipelineStep | undefined;
    if (!step) return;

    setState((prev) => ({
      ...prev,
      step,
      ...(typeof event.prompt === "string" && { craftedPrompt: event.prompt }),
      ...(typeof event.image_url === "string" && { imageUrl: event.image_url }),
      ...(typeof event.filename === "string" && { filename: event.filename }),
      ...(event.review && typeof event.review === "object" && { review: event.review as PipelineState["review"] }),
    }));
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="px-4 md:px-8 py-4 md:py-5 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="font-heading text-lg font-semibold flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Image Studio
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Voxov Design pipeline
          </p>
        </div>
        {generationCount !== null && (
          <span className="text-xs text-muted-foreground font-medium tabular-nums">
            {generationCount} generation{generationCount !== 1 ? "s" : ""} this month
          </span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-10">
        {/* Input */}
        <div className="max-w-xl space-y-3">
          <div className="flex gap-2">
            <input
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generate()}
              placeholder="Describe the product image you want…"
              className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary font-body"
            />
            <button
              onClick={generate}
              disabled={!brief.trim() || isGenerating}
              className="shrink-0 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium font-heading disabled:opacity-40 flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Generate
            </button>
          </div>
          <div className="flex gap-1.5">
            {["product", "lifestyle", "social", "hero"].map((t) => (
              <button
                key={t}
                onClick={() => setImageType(t)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  imageType === t
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Pipeline */}
        <PipelineTimeline state={state} />

        {/* Gallery */}
        <section>
          <h2 className="font-heading text-sm font-semibold text-foreground/70 uppercase tracking-wider mb-4">
            Gallery
          </h2>
          <Gallery />
        </section>
      </div>
    </div>
  );
}
