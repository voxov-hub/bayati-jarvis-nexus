import { useState, useRef } from "react";
import { ImageIcon, Loader2, Check, AlertCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PIPELINE_URL = "https://pipeline.voxovdesign.com";

type PipelineStep = "idle" | "crafting" | "generating" | "reviewing" | "complete" | "error";

interface BrandReview {
  brand_score?: number;
  purpose_score?: number;
  feel_score?: number;
  notes?: string;
}

interface GenerationResult {
  step: PipelineStep;
  imageUrl?: string;
  filename?: string;
  review?: BrandReview;
  error?: string;
}

const stepLabels: Record<PipelineStep, string> = {
  idle: "Ready",
  crafting: "Crafting Prompt",
  generating: "Generating Image",
  reviewing: "Brand Review",
  complete: "Complete",
  error: "Error",
};

function StepCard({ step, currentStep, children }: { step: PipelineStep; currentStep: PipelineStep; children: React.ReactNode }) {
  const steps: PipelineStep[] = ["crafting", "generating", "reviewing", "complete"];
  const ci = steps.indexOf(currentStep);
  const si = steps.indexOf(step);
  const isActive = step === currentStep;
  const isDone = ci > si;
  const isPending = ci < si;

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        isActive
          ? "border-primary bg-card shadow-sm"
          : isDone
          ? "border-border bg-card/50"
          : "border-border/50 bg-muted/30 opacity-50"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {isDone ? (
          <Check className="w-4 h-4 text-primary" />
        ) : isActive ? (
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        ) : (
          <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />
        )}
        <span className="text-xs font-medium font-heading text-muted-foreground uppercase tracking-wider">
          {stepLabels[step]}
        </span>
      </div>
      {(isActive || isDone) && children}
    </div>
  );
}

function ScoreBadge({ label, score }: { label: string; score?: number }) {
  if (score === undefined) return null;
  const color = score >= 8 ? "bg-primary/15 text-primary" : score >= 5 ? "bg-secondary text-secondary-foreground" : "bg-destructive/15 text-destructive";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      {label}: {score}/10
    </span>
  );
}

export default function ImageStudio() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<GenerationResult>({ step: "idle" });
  const [isGenerating, setIsGenerating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const generate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setResult({ step: "crafting" });

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(`${PIPELINE_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
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

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);

          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const event = JSON.parse(jsonStr);
            if (event.step) {
              setResult((prev) => ({
                ...prev,
                step: event.step as PipelineStep,
                ...(event.image_url && { imageUrl: event.image_url }),
                ...(event.filename && { filename: event.filename }),
                ...(event.review && { review: event.review }),
              }));
            }
          } catch {
            // skip partial JSON
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setResult({ step: "error", error: err.message || "Unknown error" });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="px-4 md:px-8 py-4 md:py-6 border-b border-border">
        <h1 className="font-heading text-xl font-semibold flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          Image Studio
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate product images via the Voxov Design pipeline
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        {/* Prompt input */}
        <div className="max-w-2xl">
          <div className="flex gap-2">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generate()}
              placeholder="Describe the product image you want to create..."
              className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={generate}
              disabled={!prompt.trim() || isGenerating}
              className="shrink-0 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate
            </button>
          </div>
        </div>

        {/* Pipeline steps */}
        {result.step !== "idle" && (
          <div className="max-w-2xl grid gap-3">
            <StepCard step="crafting" currentStep={result.step}>
              <p className="text-sm text-muted-foreground">Enhancing your prompt with brand context...</p>
            </StepCard>

            <StepCard step="generating" currentStep={result.step}>
              <p className="text-sm text-muted-foreground">Creating image with AI...</p>
            </StepCard>

            <StepCard step="reviewing" currentStep={result.step}>
              {result.review ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <ScoreBadge label="Brand" score={result.review.brand_score} />
                    <ScoreBadge label="Purpose" score={result.review.purpose_score} />
                    <ScoreBadge label="Feel" score={result.review.feel_score} />
                  </div>
                  {result.review.notes && (
                    <p className="text-xs text-muted-foreground">{result.review.notes}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Claude is reviewing brand alignment...</p>
              )}
            </StepCard>

            <StepCard step="complete" currentStep={result.step}>
              {result.imageUrl && (
                <div className="space-y-3">
                  <img
                    src={result.imageUrl.startsWith("http") ? result.imageUrl : `${PIPELINE_URL}/images/${result.imageUrl}`}
                    alt="Generated product"
                    className="rounded-lg w-full max-w-md border border-border"
                  />
                  {result.filename && (
                    <p className="text-xs text-muted-foreground">Saved as: {result.filename}</p>
                  )}
                </div>
              )}
            </StepCard>

            {result.step === "error" && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                <p className="text-sm text-destructive">{result.error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
