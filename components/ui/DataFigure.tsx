export function DataFigure({
  value,
  label,
  positive = false,
}: {
  value: string;
  label: string;
  positive?: boolean;
}) {
  return (
    <div>
      <div className={`font-mono text-lg ${positive ? "text-accent" : "text-ink"}`}>{value}</div>
      <div className="mt-1 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
        {label}
      </div>
    </div>
  );
}
