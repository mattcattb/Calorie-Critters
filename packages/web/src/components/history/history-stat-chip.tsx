import { cn } from "../../lib/cn";

type HistoryStatChipProps = {
  label: string;
  value: string;
  className?: string;
};

export function HistoryStatChip({ label, value, className }: HistoryStatChipProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-indigo-100 bg-[linear-gradient(180deg,#ffffff,#f6f8ff)] px-3 py-2 text-center",
        className,
      )}
    >
      <p className="text-[0.68rem] font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="text-xl font-black leading-none text-slate-800">{value}</p>
    </div>
  );
}
