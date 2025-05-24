interface SessionCardProps {
  title: string;
  duration: string;
  date: string;
  onSeeDetails: () => void;
}

export function SessionCard({ title, duration, date, onSeeDetails }: SessionCardProps) {
  return (
    <div className="flex items-cente justify-between rounded-lg bg-stone-900 p-4 text-white">
      <div className="space-y-1">
        <h3 className="font-medium">{title}</h3>
        <p className="text-xs text-zinc-400">{date}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-zinc-400">{duration}</span>
        <button onClick={onSeeDetails} className="text-sm text-zinc-400 hover:text-white">
          See details →
        </button>
      </div>
    </div>
  );
}
