import type { EntryWithFood } from "@calorie-critters/shared";

type MealEntryCardProps = {
  item: EntryWithFood;
};

export function MealEntryCard({ item }: MealEntryCardProps) {
  const calories = Math.round(item.food.calories * item.entry.servings);

  return (
    <div className="group flex items-center justify-between rounded-[1.4rem] border border-indigo-100 bg-white px-4 py-3 transition-colors hover:border-indigo-200 hover:bg-indigo-50/35">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8V12L14.8 13.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div>
          <p className="text-base font-black leading-tight text-slate-800">{item.food.name}</p>
          <p className="text-xs font-semibold text-slate-400">{item.entry.servings} serving • P {Math.round(item.food.protein * item.entry.servings)}g • C {Math.round(item.food.carbs * item.entry.servings)}g</p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-lg font-black leading-none text-slate-800">{calories}</p>
        <p className="text-[0.62rem] font-black uppercase tracking-[0.12em] text-slate-400">kcal</p>
      </div>
    </div>
  );
}
