import type { EntryWithFood } from "@calorie-critters/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useToast } from "../ui";
import { honoClient } from "../../lib/hono.client";

type MealEntryCardProps = {
  item: EntryWithFood;
};

export function MealEntryCard({ item }: MealEntryCardProps) {
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const calories = Math.round(item.food.calories * item.entry.servings);
  const deleteMutation = useMutation({
    mutationFn: () => honoClient.entries.remove<{ success: boolean }>(item.entry.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      notify({
        type: "success",
        title: "Entry removed",
        description: `${item.food.name} was removed from this day.`,
      });
    },
    onError: (error) => {
      notify({
        type: "error",
        title: "Could not remove entry",
        description: error instanceof Error ? error.message : "Try again.",
      });
    },
  });

  return (
    <div className="group flex items-center justify-between gap-3 rounded-[1.4rem] border border-indigo-100 bg-white px-3 py-3 transition-colors hover:border-indigo-200 hover:bg-indigo-50/35 sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8V12L14.8 13.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="min-w-0">
          <p className="truncate text-base font-black leading-tight text-slate-800">{item.food.name}</p>
          <p className="truncate text-xs font-semibold text-slate-400">{item.entry.servings} serving • P {Math.round(item.food.protein * item.entry.servings)}g • C {Math.round(item.food.carbs * item.entry.servings)}g</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="text-right">
          <p className="text-lg font-black leading-none text-slate-800">{calories}</p>
          <p className="text-[0.62rem] font-black uppercase tracking-[0.12em] text-slate-400">kcal</p>
        </div>
        <button
          type="button"
          aria-label={`Remove ${item.food.name}`}
          title={`Remove ${item.food.name}`}
          disabled={deleteMutation.isPending}
          onClick={() => {
            if (window.confirm(`Remove ${item.food.name} from this day?`)) {
              deleteMutation.mutate();
            }
          }}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500 focus-visible:ring-2 focus-visible:ring-rose-400 disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
