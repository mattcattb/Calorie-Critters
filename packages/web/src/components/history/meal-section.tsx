import type { EntryWithFood, MealType } from "@calorie-critters/shared";
import { MealEntryCard } from "./meal-entry-card";

type MealSectionProps = {
  mealType: MealType;
  items: EntryWithFood[];
};

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function MealSection({ mealType, items }: MealSectionProps) {
  return (
    <div className="space-y-2">
      <div className="inline-flex rounded-full bg-indigo-50 px-3 py-1">
        <p className="text-[0.7rem] font-black uppercase tracking-[0.12em] text-indigo-600">{titleCase(mealType)}</p>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <MealEntryCard key={item.entry.id} item={item} />
        ))}
      </div>
    </div>
  );
}
