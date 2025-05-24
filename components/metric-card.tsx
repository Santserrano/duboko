interface MetricCardProps {
  value: string | number;
  label: string;
}

export function MetricCard({ value, label }: MetricCardProps) {
  return (
    <div className="rounded-lg bg-stone-900 p-2 text-white">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-zinc-400">{label}</div>
    </div>
  );
}
