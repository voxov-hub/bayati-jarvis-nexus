import { Check, Loader2, Sparkles, Image, Shield, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { PipelineState, PipelineStep } from "./types";
import { ScoreBadge } from "./ScoreBadge";

const PIPELINE_URL = "https://pipeline.voxovdesign.com";

const STEPS: { key: PipelineStep; label: string; icon: React.ElementType; thinking: string }[] = [
  { key: "prompt", label: "Crafting prompt", icon: Sparkles, thinking: "Claude is crafting your prompt…" },
  { key: "generate", label: "Generating image", icon: Image, thinking: "Generating image…" },
  { key: "review", label: "Brand review", icon: Shield, thinking: "Reviewing against Voxov criteria…" },
  { key: "complete", label: "Complete", icon: CheckCircle2, thinking: "" },
];

function stepIndex(step: PipelineStep): number {
  return STEPS.findIndex((s) => s.key === step);
}

function StepNode({
  step,
  currentStep,
  state,
  isLast,
}: {
  step: (typeof STEPS)[number];
  currentStep: PipelineStep;
  state: PipelineState;
  isLast: boolean;
}) {
  const ci = stepIndex(currentStep);
  const si = stepIndex(step.key);
  const isActive = step.key === currentStep;
  const isDone = ci > si;
  const isPending = ci < si;

  const Icon = step.icon;

  return (
    <div className="flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
            isDone
              ? "bg-primary text-primary-foreground"
              : isActive
              ? "bg-primary/15 text-primary ring-2 ring-primary/30"
              : "bg-muted text-muted-foreground/40"
          }`}
        >
          {isDone ? (
            <Check className="w-4 h-4" />
          ) : isActive ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Icon className="w-4 h-4" />
          )}
        </motion.div>
        {!isLast && (
          <div
            className={`w-px flex-1 min-h-[24px] transition-colors duration-500 ${
              isDone ? "bg-primary/40" : "bg-border"
            }`}
          />
        )}
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: si * 0.05 }}
        className={`pb-6 flex-1 min-w-0 ${isPending ? "opacity-40" : ""}`}
      >
        <p
          className={`text-sm font-heading font-medium mb-1 ${
            isActive ? "text-foreground" : isDone ? "text-foreground/80" : "text-muted-foreground"
          }`}
        >
          {step.label}
        </p>

        <AnimatePresence mode="wait">
          {isActive && step.key !== "complete" && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              {step.key === "generate" ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">{step.thinking}</p>
                  <div className="h-1.5 w-full max-w-xs rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full bg-primary/60 rounded-full"
                      initial={{ width: "5%" }}
                      animate={{ width: "85%" }}
                      transition={{ duration: 12, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-primary/50"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{step.thinking}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Done content for prompt step */}
          {isDone && step.key === "prompt" && state.craftedPrompt && (
            <motion.div
              key="prompt-done"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="overflow-hidden"
            >
              <div className="bg-muted/50 rounded-lg px-3 py-2 mt-1 border border-border/50">
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {state.craftedPrompt}
                </p>
              </div>
            </motion.div>
          )}

          {/* Done content for generate step */}
          {isDone && step.key === "generate" && state.imageUrl && (
            <motion.div
              key="gen-done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1"
            >
              <img
                src={
                  state.imageUrl.startsWith("http")
                    ? state.imageUrl
                    : `${PIPELINE_URL}/images/${state.imageUrl}`
                }
                alt="Generated"
                className="w-16 h-16 rounded-lg object-cover border border-border"
              />
            </motion.div>
          )}

          {/* Done content for review step */}
          {isDone && step.key === "review" && state.review && (
            <motion.div
              key="review-done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1 space-y-2"
            >
              <div className="flex flex-wrap gap-1.5">
                <ScoreBadge label="Brand" score={state.review.brand_score} />
                <ScoreBadge label="Purpose" score={state.review.purpose_score} />
                <ScoreBadge label="Feel" score={state.review.feel_score} />
              </div>
              {state.review.notes && (
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  {state.review.notes}
                </p>
              )}
              {state.review.approved !== undefined && (
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                    state.review.approved
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-amber-500/10 text-amber-600"
                  }`}
                >
                  {state.review.approved ? "✓ Approved" : "⚠ Needs revision"}
                </div>
              )}
            </motion.div>
          )}

          {/* Active review with partial data */}
          {isActive && step.key === "review" && state.review && (
            <motion.div
              key="review-active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1 space-y-2"
            >
              <div className="flex flex-wrap gap-1.5">
                <ScoreBadge label="Brand" score={state.review.brand_score} />
                <ScoreBadge label="Purpose" score={state.review.purpose_score} />
                <ScoreBadge label="Feel" score={state.review.feel_score} />
              </div>
              {state.review.notes && (
                <p className="text-xs text-muted-foreground italic">{state.review.notes}</p>
              )}
            </motion.div>
          )}

          {/* Complete step */}
          {isActive && step.key === "complete" && state.imageUrl && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mt-2 space-y-3"
            >
              <div className="rounded-xl overflow-hidden border border-border shadow-sm max-w-md">
                <img
                  src={
                    state.imageUrl.startsWith("http")
                      ? state.imageUrl
                      : `${PIPELINE_URL}/images/${state.imageUrl}`
                  }
                  alt="Final product"
                  className="w-full"
                />
              </div>
              {state.filename && (
                <p className="text-xs text-muted-foreground">{state.filename}</p>
              )}
              {state.review?.approved && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium font-heading">
                  <Check className="w-3.5 h-3.5" />
                  Approved
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export function PipelineTimeline({ state }: { state: PipelineState }) {
  if (state.step === "idle") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-xl"
    >
      {state.step === "error" ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{state.error || "Pipeline error"}</p>
        </div>
      ) : (
        STEPS.map((step, i) => (
          <StepNode
            key={step.key}
            step={step}
            currentStep={state.step}
            state={state}
            isLast={i === STEPS.length - 1}
          />
        ))
      )}
    </motion.div>
  );
}
