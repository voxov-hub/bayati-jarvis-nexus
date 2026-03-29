export function ScoreBadge({ label, score }: { label: string; score?: number }) {
  if (score === undefined) return null;
  const color =
    score >= 8
      ? "bg-emerald-500/10 text-emerald-600"
      : score >= 5
      ? "bg-amber-500/10 text-amber-600"
      : "bg-red-500/10 text-red-600";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label} {score}/10
    </span>
  );
}
