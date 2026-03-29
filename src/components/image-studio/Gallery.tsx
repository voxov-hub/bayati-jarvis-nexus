import { useState, useEffect } from "react";
import { Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { GalleryImage } from "./types";

const PIPELINE_URL = "https://pipeline.voxovdesign.com";

function parseFilenameDate(filename: string): Date | null {
  // Format: YYYYMMDD_HHMMSS_rest.png
  const match = filename.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/);
  if (!match) return null;
  const [, y, m, d, h, min, s] = match;
  return new Date(`${y}-${m}-${d}T${h}:${min}:${s}`);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${PIPELINE_URL}/images`);
        if (!res.ok) throw new Error("Failed to load gallery");
        const data = await res.json();
        const filenames: string[] = Array.isArray(data) ? data : data.images ?? [];
        const parsed: GalleryImage[] = filenames
          .map((f: string) => ({
            filename: f,
            url: `${PIPELINE_URL}/images/${f}`,
            date: parseFilenameDate(f) ?? new Date(0),
          }))
          .sort((a: GalleryImage, b: GalleryImage) => b.date.getTime() - a.date.getTime());
        setImages(parsed);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">No images generated yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {images.map((img, i) => (
        <motion.div
          key={img.filename}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
          className="group relative rounded-xl overflow-hidden border border-border bg-card"
        >
          <img
            src={img.url}
            alt={img.filename}
            className="w-full aspect-square object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="absolute bottom-0 left-0 right-0 p-2 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-[10px] text-white/80 font-medium">
              {img.date.getTime() > 0 ? formatDate(img.date) : "—"}
            </span>
            <a
              href={img.url}
              download={img.filename}
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-white" />
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function useGenerationCount(): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${PIPELINE_URL}/images`);
        if (!res.ok) return;
        const data = await res.json();
        const filenames: string[] = Array.isArray(data) ? data : data.images ?? [];
        const now = new Date();
        const thisMonth = filenames.filter((f: string) => {
          const d = parseFilenameDate(f);
          return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        setCount(thisMonth.length);
      } catch {
        // silent
      }
    };
    load();
  }, []);

  return count;
}
