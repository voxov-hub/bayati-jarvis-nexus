import { useState, useRef, useCallback } from "react";
import {
  ImageIcon,
  FileText,
  Globe,
  Video,
  Sparkles,
  Download,
  RefreshCw,
  Copy,
  Check,
  ArrowLeft,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreBadge } from "@/components/image-studio/ScoreBadge";
import { GeneratingAnimation } from "@/components/content-studio/GeneratingAnimation";
import { toast } from "sonner";

const PIPELINE_URL = "https://pipeline.voxovdesign.com";

type ContentTab = "image" | "social" | "web" | "video";
type ImageType = "hero" | "social" | "lifestyle" | "detail";

const TABS: { id: ContentTab; label: string; icon: typeof ImageIcon }[] = [
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "social", label: "Social copy", icon: FileText },
  { id: "web", label: "Web copy", icon: Globe },
  { id: "video", label: "Video", icon: Video },
];

const IMAGE_TYPES: { id: ImageType; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "social", label: "Social" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "detail", label: "Detail" },
];

// ── SSE reader helper ──────────────────────────────────────────
async function readSSE(
  url: string,
  body: Record<string, unknown>,
  onEvent: (event: Record<string, unknown>) => void,
  signal: AbortSignal,
) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
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
      if (!line.startsWith("data: ")) continue;
      try {
        const event = JSON.parse(line.slice(6)) as Record<string, unknown>;
        onEvent(event);
      } catch {
        continue;
      }
    }
  }
}

// ── Image tab state ────────────────────────────────────────────
interface ImageResult {
  imageUrl: string;
  filename?: string;
  brandScore?: number;
  purposeScore?: number;
  feelScore?: number;
  approved?: boolean;
  iterations?: number;
  promptText?: string;
}

// ── Copy variant ───────────────────────────────────────────────
interface CopyVariant {
  content: string;
  headline?: string;
  subheading?: string;
  body?: string;
}

// ── CopyCard ───────────────────────────────────────────────────
function CopyCard({ variant, isWeb }: { variant: CopyVariant; isWeb?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const text = isWeb
      ? [variant.headline, variant.subheading, variant.body].filter(Boolean).join("\n\n")
      : variant.content;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [variant, isWeb]);

  return (
    <Card className="border-border">
      <CardContent className="p-4 space-y-3">
        {isWeb ? (
          <>
            {variant.headline && (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Headline
                </span>
                <p className="font-heading font-semibold text-foreground mt-0.5">{variant.headline}</p>
              </div>
            )}
            {variant.subheading && (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Subheading
                </span>
                <p className="text-sm text-foreground/80 mt-0.5">{variant.subheading}</p>
              </div>
            )}
            {variant.body && (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Body
                </span>
                <p className="text-sm text-foreground/70 mt-0.5 whitespace-pre-wrap">{variant.body}</p>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-foreground whitespace-pre-wrap">{variant.content}</p>
        )}
        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied ✓" : "Copy"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Main Component ─────────────────────────────────────────────
export function ContentStudio() {
  const [activeTab, setActiveTab] = useState<ContentTab>("image");

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="px-4 md:px-8 py-4 border-b border-border">
        <h1 className="font-heading text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Content Studio
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Voxov Design content pipeline</p>
      </header>

      {/* Tab bar */}
      <div className="px-4 md:px-8 border-b border-border overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        {activeTab === "image" && <ImagePanel />}
        {activeTab === "social" && <CopyPanel copyType="social" />}
        {activeTab === "web" && <CopyPanel copyType="web" />}
        {activeTab === "video" && <VideoPanel />}
      </div>
    </div>
  );
}

// ── IMAGE PANEL ────────────────────────────────────────────────
const PRODUCT_TRIGGERS: Record<string, string> = {
  "Altus Lamp": "VOXOV_ALTUS",
  "Elysian Lamp": "VOXOV_ELYSIAN",
  "Altus Shade": "VOXOV_ALTUS_SHADE",
  "Elysian Shade": "VOXOV_ELYSIAN_SHADE",
};

function ImagePanel() {
  const [brief, setBrief] = useState("");
  const [imageType, setImageType] = useState<ImageType>("hero");
  const [selectedProduct, setSelectedProduct] = useState("Altus Lamp");
  const [isGenerating, setIsGenerating] = useState(false);
  const [animStep, setAnimStep] = useState<0 | 1 | 2 | 3>(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [result, setResult] = useState<ImageResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = async () => {
    if (!brief.trim() || isGenerating) return;
    setIsGenerating(true);
    setResult(null);
    setAnimStep(0);
    setStatusMsg("Starting pipeline...");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await readSSE(
        `${PIPELINE_URL}/generate`,
        { brief: brief.trim(), image_type: imageType, trigger: PRODUCT_TRIGGERS[selectedProduct] },
        (event) => {
          const step = event.step as string | undefined;
          const status = event.status as string | undefined;

          if (step === "prompt" && status === "thinking") {
            setAnimStep(1);
            setStatusMsg("Crafting prompt...");
          }
          if (step === "prompt" && status === "done") {
            setStatusMsg(typeof event.message === "string" ? event.message : "Prompt ready");
            setResult((prev) => ({ ...prev, imageUrl: "", promptText: event.message as string }));
          }
          if (step === "generate" && status === "thinking") {
            setAnimStep(2);
            const iter = event.iteration as number | undefined;
            setStatusMsg(iter ? `Generating image (attempt ${iter})...` : "Generating image...");
          }
          if (step === "generate" && status === "done" && typeof event.image_url === "string") {
            setResult((prev) => ({ ...(prev ?? { imageUrl: "" }), imageUrl: event.image_url as string }));
          }
          if (step === "review" && status === "thinking") {
            setAnimStep(3);
            setStatusMsg("Reviewing against brand guidelines...");
          }
          if (step === "review" && status === "done" && event.review) {
            const r = event.review as Record<string, unknown>;
            setResult((prev) => {
              const base = prev ?? { imageUrl: "" };
              return {
                ...base,
                brandScore: r.brand_score as number | undefined,
                purposeScore: r.purpose_score as number | undefined,
                feelScore: r.feel_score as number | undefined,
                approved: r.approved as boolean | undefined,
              };
            });
          }
          if (step === "complete") {
            const finalUrl = (event.image_url as string | undefined) || "";
            setResult((prev) => {
              const base = prev ?? { imageUrl: "" };
              return {
                ...base,
                imageUrl: finalUrl || base.imageUrl || "",
                filename: event.filename as string | undefined,
                iterations: event.iterations as number | undefined,
                approved: status === "approved",
              };
            });
            setIsGenerating(false);
            setStatusMsg("");
          }
        },
        controller.signal,
      );
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      if (error.name !== "AbortError") {
        toast.error(error.message);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!result?.imageUrl) return;
    const a = document.createElement("a");
    a.href = result.imageUrl;
    a.download = result.filename ?? "voxov-image.png";
    a.click();
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Input */}
      <div className="space-y-3">
        <Textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Describe the image..."
          className="resize-none min-h-[80px]"
        />
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">
            Product
          </span>
          <div className="flex flex-wrap gap-2">
            {Object.keys(PRODUCT_TRIGGERS).map((name) => (
              <button
                key={name}
                onClick={() => setSelectedProduct(name)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedProduct === name
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {IMAGE_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setImageType(t.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                imageType === t.id
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-foreground hover:bg-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Button
          onClick={generate}
          disabled={!brief.trim() || isGenerating}
          className="w-full md:w-auto gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Generate
        </Button>
      </div>

      {/* Generating animation */}
      {isGenerating && <GeneratingAnimation currentStep={animStep} statusMessage={statusMsg} />}

      {/* Result */}
      {!isGenerating && result?.imageUrl && (
        <div className="space-y-4">
          {result.promptText && (
            <p className="text-xs text-muted-foreground italic">{result.promptText}</p>
          )}
          <img
            src={result.imageUrl}
            alt="Generated image"
            className="w-full rounded-lg border border-border"
          />
          <div className="flex flex-wrap gap-2">
            <ScoreBadge label="Brand" score={result.brandScore} />
            <ScoreBadge label="Purpose" score={result.purposeScore} />
            <ScoreBadge label="Feel" score={result.feelScore} />
          </div>
          <p className="text-sm font-medium text-foreground">
            {result.approved
              ? "Approved ✓"
              : `Best result after ${result.iterations ?? 1} iteration${(result.iterations ?? 1) > 1 ? "s" : ""}`}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={generate} className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              Generate again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── COPY PANEL ─────────────────────────────────────────────────
function CopyPanel({ copyType }: { copyType: "social" | "web" }) {
  const [brief, setBrief] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState<CopyVariant[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const isWeb = copyType === "web";

  const generate = async () => {
    if (!brief.trim() || isGenerating) return;
    setIsGenerating(true);
    setVariants([]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await readSSE(
        `${PIPELINE_URL}/generate/copy`,
        { brief: brief.trim(), copy_type: copyType },
        (event) => {
          if (event.step === "writing" && event.status === "progress" && event.content) {
            const content = event.content as string;
            if (isWeb) {
              // Try to parse structured web copy
              const lines = content.split("\n").filter(Boolean);
              const variant: CopyVariant = {
                content,
                headline: lines[0] ?? "",
                subheading: lines[1] ?? "",
                body: lines.slice(2).join("\n"),
              };
              setVariants((prev) => [...prev, variant]);
            } else {
              setVariants((prev) => [...prev, { content }]);
            }
          }
          if (event.step === "complete") {
            setIsGenerating(false);
          }
        },
        controller.signal,
      );
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      if (error.name !== "AbortError") {
        toast.error(error.message);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-3">
        <Textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="What's this post about?"
          className="resize-none min-h-[80px]"
        />
        <Button
          onClick={generate}
          disabled={!brief.trim() || isGenerating}
          className="w-full md:w-auto gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Generate
        </Button>
      </div>

      {isGenerating && variants.length === 0 && (
        <p className="text-sm text-muted-foreground animate-pulse">Writing...</p>
      )}

      {variants.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {variants.length} variant{variants.length !== 1 ? "s" : ""}
          </h3>
          {variants.map((v, i) => (
            <CopyCard key={i} variant={v} isWeb={isWeb} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── VIDEO PANEL (coming soon) ──────────────────────────────────
function VideoPanel() {
  return (
    <Card className="max-w-lg mx-auto border-border">
      <CardContent className="flex flex-col items-center text-center p-8 space-y-6">
        <GeneratingAnimation currentStep={0} statusMessage="" />
        <div className="space-y-2">
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Video generation is coming soon
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            This feature will be powered by your Voxov product LoRA — trained on your photoshoot
            imagery for consistent brand visuals.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
