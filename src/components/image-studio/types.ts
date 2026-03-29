export type PipelineStep = "idle" | "prompt" | "generate" | "review" | "complete" | "error";

export interface BrandReview {
  brand_score?: number;
  purpose_score?: number;
  feel_score?: number;
  notes?: string;
  approved?: boolean;
}

export interface PipelineState {
  step: PipelineStep;
  craftedPrompt?: string;
  imageUrl?: string;
  filename?: string;
  review?: BrandReview;
  error?: string;
}

export interface GalleryImage {
  filename: string;
  url: string;
  date: Date;
}
