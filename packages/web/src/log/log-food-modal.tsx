import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type CreateFoodItemInput,
  type CreateEntryInput,
  type EntryWithFood,
  type FoodItem,
  type MealType,
} from "@calorie-critters/shared";
import {
  Button,
  Dialog,
  DialogBackdrop,
  DialogPopup,
  DialogTitle,
  Input,
  useToast,
} from "../components/ui";
import { apiFetch } from "../lib/api";
import { useSession } from "../lib/auth";
import { useLogFoodModal } from "./log-food-modal-context";

type OpenFoodFactsFood = {
  code: string;
  name: string;
  brand: string | null;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type OpenFoodFactsSearchResult = {
  count: number;
  page: number;
  pageSize: number;
  items: OpenFoodFactsFood[];
};

type Recommendation =
  | { source: "library"; food: FoodItem }
  | { source: "open_food_facts"; food: OpenFoodFactsFood };

function isoToday(): string {
  return new Date().toISOString().split("T")[0];
}

function isoYesterday(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0];
}

function defaultMealType(): MealType {
  const hour = new Date().getHours();
  if (hour < 11) return "breakfast";
  if (hour < 15) return "lunch";
  if (hour < 21) return "dinner";
  return "snack";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Something went wrong.";
}

export function LogFoodModal() {
  const { data: session, isPending } = useSession();
  const { notify } = useToast();
  const queryClient = useQueryClient();
  const { isOpen, setOpen, closeLog } = useLogFoodModal();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const canFetch = Boolean(session && !isPending && isOpen);
  const today = isoToday();

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setDebouncedSearch("");
      return;
    }
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [isOpen, search]);

  const foodsQuery = useQuery({
    queryKey: ["foods", debouncedSearch],
    queryFn: () => {
      const searchQuery = debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : "";
      return apiFetch<FoodItem[]>(`/api/foods${searchQuery}`);
    },
    enabled: canFetch,
  });

  const todayEntriesQuery = useQuery({
    queryKey: ["entries", today],
    queryFn: () => apiFetch<EntryWithFood[]>(`/api/entries?date=${today}`),
    enabled: canFetch,
  });

  const yesterdayEntriesQuery = useQuery({
    queryKey: ["entries", isoYesterday()],
    queryFn: () => apiFetch<EntryWithFood[]>(`/api/entries?date=${isoYesterday()}`),
    enabled: canFetch,
  });

  const openFoodFactsQuery = useQuery({
    queryKey: ["log-modal-off-search", debouncedSearch],
    queryFn: () =>
      apiFetch<OpenFoodFactsSearchResult>(
        `/api/foods/open-food-facts/search?query=${encodeURIComponent(debouncedSearch)}&pageSize=6`,
      ),
    enabled: canFetch && debouncedSearch.length >= 2,
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: async (recommendation: Recommendation) => {
      let foodItemId = "";

      if (recommendation.source === "library") {
        foodItemId = recommendation.food.id;
      } else {
        const payload: CreateFoodItemInput = {
          name: recommendation.food.name,
          brand: recommendation.food.brand,
          servingSize: recommendation.food.servingSize,
          servingUnit: recommendation.food.servingUnit,
          calories: recommendation.food.calories,
          protein: recommendation.food.protein,
          carbs: recommendation.food.carbs,
          fat: recommendation.food.fat,
        };
        const createdFood = await apiFetch<FoodItem>("/api/foods", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        foodItemId = createdFood.id;
      }

      const payload: CreateEntryInput = {
        foodItemId,
        servings: 1,
        mealType: defaultMealType(),
        loggedAt: today,
        notes: null,
      };

      return apiFetch<EntryWithFood["entry"]>("/api/entries", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      notify({ type: "success", title: "Logged", description: "Food added." });
    },
    onError: (error) => {
      notify({ type: "error", title: "Log failed", description: getErrorMessage(error) });
    },
  });

  const foods = foodsQuery.data ?? [];
  const openFoodFactsFoods = openFoodFactsQuery.data?.items ?? [];
  const recentEntries = [...(todayEntriesQuery.data ?? []), ...(yesterdayEntriesQuery.data ?? [])];
  const usage = new Map<string, number>();

  for (const item of recentEntries) {
    usage.set(item.food.id, (usage.get(item.food.id) ?? 0) + 1);
  }

  const localRecommendations = [...foods]
    .sort((a, b) => {
      const countDiff = (usage.get(b.id) ?? 0) - (usage.get(a.id) ?? 0);
      if (countDiff !== 0) return countDiff;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 10);

  const localRecommendationKeys = new Set(
    localRecommendations.map((food) => `${food.name.toLowerCase()}::${(food.brand ?? "").toLowerCase()}`),
  );

  const openFoodFactsRecommendations = openFoodFactsFoods.filter(
    (food) => !localRecommendationKeys.has(`${food.name.toLowerCase()}::${(food.brand ?? "").toLowerCase()}`),
  );

  const showExpandedRecommendations = debouncedSearch.length > 0;
  const showOpenFoodFactsRecommendations = debouncedSearch.length >= 2;
  const areRecentEntriesLoading =
    canFetch &&
    ((todayEntriesQuery.isLoading && !todayEntriesQuery.data) ||
      (yesterdayEntriesQuery.isLoading && !yesterdayEntriesQuery.data));
  const hasOpenFoodFactsRecommendations = openFoodFactsRecommendations.length > 0;
  const showNoResults =
    localRecommendations.length === 0 &&
    (!showOpenFoodFactsRecommendations ||
      (!openFoodFactsQuery.isLoading && !hasOpenFoodFactsRecommendations));

  if (!session) return null;

  const handleQuickAdd = (recommendation: Recommendation) => {
    createMutation.mutate(recommendation);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      <Dialog.Portal>
        <DialogBackdrop className="bg-foreground/35 backdrop-blur-sm" />
        <DialogPopup className="w-[min(680px,calc(100%-1.25rem))] border-border/65 bg-white p-0">
          <div className="border-b border-border/40 px-5 py-4 sm:px-7 sm:py-5">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-[2rem] font-semibold leading-none">Log Food</DialogTitle>
              <button
                type="button"
                aria-label="Close"
                onClick={closeLog}
                className="text-4xl leading-none text-foreground/80"
              >
                ×
              </button>
            </div>
          </div>

          <div className="space-y-4 px-5 py-4 sm:px-7 sm:py-6">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search for a food..."
              className="h-14 rounded-2xl border-border/50 bg-surface-2 text-lg"
            />

            <p className="micro-text font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {showExpandedRecommendations ? "Recommended" : "Frequent"}
            </p>
            {areRecentEntriesLoading ? (
              <p className="px-0.5 text-xs text-muted-foreground animate-pulse">Loading recent entries...</p>
            ) : null}

            <div className="max-h-[48vh] space-y-1 overflow-auto pr-1">
              {foodsQuery.isLoading && !showOpenFoodFactsRecommendations ? (
                <p className="py-2 text-sm text-muted-foreground">Loading foods...</p>
              ) : showNoResults ? (
                <p className="py-2 text-sm text-muted-foreground">
                  {showExpandedRecommendations ? "No foods found." : "No frequent foods yet."}
                </p>
              ) : (
                <>
                  {showExpandedRecommendations ? (
                    <p className="px-2 pb-1 pt-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      Your foods
                    </p>
                  ) : null}

                  {foodsQuery.isLoading ? (
                    <p className="px-2 py-2 text-sm text-muted-foreground">Searching your foods...</p>
                  ) : (
                    localRecommendations.map((food) => (
                      <div key={food.id} className="flex items-center justify-between gap-3 rounded-2xl px-2 py-2">
                        <div>
                          <p className="text-xl font-semibold leading-tight text-foreground">{food.name}</p>
                          <p className="text-base leading-tight text-muted-foreground">
                            {Math.round(food.calories)} kcal • P: {Math.round(food.protein)}g
                          </p>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-10 w-10 rounded-full border border-border/35 text-3xl text-muted-foreground hover:bg-surface-2"
                          disabled={createMutation.isPending}
                          onClick={() => handleQuickAdd({ source: "library", food })}
                        >
                          +
                        </Button>
                      </div>
                    ))
                  )}

                  {showOpenFoodFactsRecommendations ? (
                    <>
                      <p className="px-2 pb-1 pt-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        Open Food Facts
                      </p>

                      {openFoodFactsQuery.isLoading ? (
                        <p className="px-2 py-2 text-sm text-muted-foreground">Searching Open Food Facts...</p>
                      ) : openFoodFactsRecommendations.length === 0 ? (
                        <p className="px-2 py-2 text-sm text-muted-foreground">No additional matches found.</p>
                      ) : (
                        openFoodFactsRecommendations.map((food) => (
                          <div
                            key={food.code}
                            className="flex items-center justify-between gap-3 rounded-2xl px-2 py-2"
                          >
                            <div>
                              <p className="text-xl font-semibold leading-tight text-foreground">{food.name}</p>
                              <p className="text-base leading-tight text-muted-foreground">
                                {Math.round(food.calories)} kcal • P: {Math.round(food.protein)}g
                              </p>
                            </div>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-10 rounded-full border border-border/35 px-3 text-sm text-muted-foreground hover:bg-surface-2"
                              disabled={createMutation.isPending}
                              onClick={() => handleQuickAdd({ source: "open_food_facts", food })}
                            >
                              Add
                            </Button>
                          </div>
                        ))
                      )}
                    </>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </DialogPopup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
