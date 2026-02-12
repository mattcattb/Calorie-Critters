import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateFoodItemInput, FoodItem, UpdateFoodItemInput } from "@calorie-critters/shared";
import { Badge, Button, Card, CardContent, Input, Label, useToast } from "../components/ui";
import { useSession } from "../lib/auth";
import { apiFetch } from "../lib/api";

export const Route = createFileRoute("/foods")({
  component: FoodsPage,
});

type FoodFormState = {
  name: string;
  brand: string;
  servingSize: string;
  servingUnit: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
};

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

const DEFAULT_FOOD_FORM: FoodFormState = {
  name: "",
  brand: "",
  servingSize: "",
  servingUnit: "g",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
};

function parseNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return null;
  return parsed;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Something went wrong.";
}

function mapFoodToForm(food: FoodItem): FoodFormState {
  return {
    name: food.name,
    brand: food.brand ?? "",
    servingSize: String(food.servingSize),
    servingUnit: food.servingUnit,
    calories: String(food.calories),
    protein: String(food.protein),
    carbs: String(food.carbs),
    fat: String(food.fat),
  };
}

function FoodsPage() {
  const { data: session, isPending } = useSession();
  const { notify } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [form, setForm] = useState<FoodFormState>(DEFAULT_FOOD_FORM);

  const [offSearchInput, setOffSearchInput] = useState("");
  const [offDebouncedQuery, setOffDebouncedQuery] = useState("");

  const foodsQuery = useQuery({
    queryKey: ["foods", search],
    queryFn: () => {
      const searchQuery = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
      return apiFetch<FoodItem[]>(`/api/foods${searchQuery}`);
    },
    enabled: Boolean(session && !isPending),
  });

  const invalidateFoodRelatedQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["foods"] });
    queryClient.invalidateQueries({ queryKey: ["entries"] });
    queryClient.invalidateQueries({ queryKey: ["summary"] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateFoodItemInput) =>
      apiFetch<FoodItem>("/api/foods", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      invalidateFoodRelatedQueries();
      setForm(DEFAULT_FOOD_FORM);
      setShowEditor(false);
      notify({ type: "success", title: "Saved", description: "Food added to library." });
    },
    onError: (error) => {
      notify({ type: "error", title: "Create failed", description: getErrorMessage(error) });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFoodItemInput }) =>
      apiFetch<FoodItem>(`/api/foods/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      invalidateFoodRelatedQueries();
      setEditingFoodId(null);
      setForm(DEFAULT_FOOD_FORM);
      setShowEditor(false);
      notify({ type: "success", title: "Updated", description: "Food updated." });
    },
    onError: (error) => {
      notify({ type: "error", title: "Update failed", description: getErrorMessage(error) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/foods/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      invalidateFoodRelatedQueries();
      notify({ type: "success", title: "Deleted", description: "Food removed." });
    },
    onError: (error) => {
      notify({ type: "error", title: "Delete failed", description: getErrorMessage(error) });
    },
  });

  const importMutation = useMutation({
    mutationFn: (payload: CreateFoodItemInput) =>
      apiFetch<FoodItem>("/api/foods", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      invalidateFoodRelatedQueries();
      notify({ type: "success", title: "Imported", description: "Added from Open Food Facts." });
    },
    onError: (error) => {
      notify({ type: "error", title: "Import failed", description: getErrorMessage(error) });
    },
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setOffDebouncedQuery(offSearchInput.trim());
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [offSearchInput]);

  const offQuery = useQuery({
    queryKey: ["off-search", offDebouncedQuery],
    queryFn: () =>
      apiFetch<OpenFoodFactsSearchResult>(
        `/api/foods/open-food-facts/search?query=${encodeURIComponent(offDebouncedQuery)}&pageSize=6`,
      ),
    enabled: Boolean(
      session && !isPending && offDebouncedQuery.length >= 2 && offDebouncedQuery === offSearchInput.trim(),
    ),
    staleTime: 60_000,
  });

  if (!isPending && !session) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const servingSize = parseNumber(form.servingSize);
    const calories = parseNumber(form.calories);
    const protein = parseNumber(form.protein);
    const carbs = parseNumber(form.carbs);
    const fat = parseNumber(form.fat);

    if (!form.name.trim() || !form.servingUnit.trim()) {
      notify({ type: "error", title: "Missing fields", description: "Name and serving unit are required." });
      return;
    }

    if (
      servingSize === null ||
      servingSize <= 0 ||
      calories === null ||
      calories < 0 ||
      protein === null ||
      protein < 0 ||
      carbs === null ||
      carbs < 0 ||
      fat === null ||
      fat < 0
    ) {
      notify({ type: "error", title: "Invalid values", description: "Check serving size and macro numbers." });
      return;
    }

    const payload: CreateFoodItemInput = {
      name: form.name.trim(),
      brand: form.brand.trim() ? form.brand.trim() : null,
      servingSize,
      servingUnit: form.servingUnit.trim(),
      calories,
      protein,
      carbs,
      fat,
    };

    if (editingFoodId) {
      updateMutation.mutate({ id: editingFoodId, payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const foods = foodsQuery.data ?? [];
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <section className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="page-title">Food Library</h2>
          <p className="text-sm text-muted-foreground">Search, add, and reuse foods fast.</p>
        </div>
        <Button
          onClick={() => {
            setEditingFoodId(null);
            setForm(DEFAULT_FOOD_FORM);
            setShowEditor(true);
          }}
        >
          Add Food
        </Button>
      </section>

      <Card>
        <CardContent className="space-y-3 p-2">
          <div className="field-grid">
            <Label htmlFor="searchFoods">Search</Label>
            <Input id="searchFoods" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>

          {foodsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading foods...</p>
          ) : foods.length === 0 ? (
            <p className="text-sm text-muted-foreground">No foods yet. Tap Add Food to start.</p>
          ) : (
            <div className="space-y-2">
              {foods.map((food) => (
                <div key={food.id} className="rounded-[var(--radius-sm)] border-2 border-border/75 bg-surface-2 px-3 py-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{food.name}</p>
                      <p className="micro-text text-muted-foreground">
                        {Math.round(food.calories)} kcal · P {Math.round(food.protein)} · C {Math.round(food.carbs)} · F {Math.round(food.fat)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingFoodId(food.id);
                          setForm(mapFoodToForm(food));
                          setShowEditor(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => deleteMutation.mutate(food.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <details className="rounded-[var(--radius-sm)] border-2 border-border/70 bg-surface px-3 py-2">
        <summary className="cursor-pointer text-sm font-semibold text-foreground">Import from Open Food Facts</summary>
        <div className="mt-3 space-y-3">
          <div className="field-grid">
            <Label htmlFor="offSearch">Search Query</Label>
            <Input id="offSearch" value={offSearchInput} onChange={(event) => setOffSearchInput(event.target.value)} />
          </div>

          {offDebouncedQuery.length < 2 ? (
            <p className="text-sm text-muted-foreground">Type at least 2 characters.</p>
          ) : offQuery.isFetching ? (
            <p className="text-sm text-muted-foreground">Searching...</p>
          ) : (
            <div className="space-y-2">
              {(offQuery.data?.items ?? []).map((item) => (
                <div key={item.code} className="rounded-[var(--radius-sm)] border-2 border-border/70 bg-surface-2 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.name}</p>
                      <p className="micro-text text-muted-foreground">
                        {Math.round(item.calories)} kcal · P {Math.round(item.protein)} · C {Math.round(item.carbs)} · F {Math.round(item.fat)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        importMutation.mutate({
                          name: item.name,
                          brand: item.brand,
                          servingSize: item.servingSize,
                          servingUnit: item.servingUnit,
                          calories: item.calories,
                          protein: item.protein,
                          carbs: item.carbs,
                          fat: item.fat,
                        })
                      }
                    >
                      Import
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </details>

      {showEditor ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/60 p-2 sm:items-center sm:p-4">
          <Card className="w-full max-w-lg border-primary/25">
            <CardContent className="space-y-4 p-2">
              <div className="flex items-center justify-between">
                <h3 className="section-title">{editingFoodId ? "Edit Food" : "Add Food"}</h3>
                <Badge variant={editingFoodId ? "warning" : "primary"}>{editingFoodId ? "Editing" : "New"}</Badge>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="field-grid sm:col-span-2">
                    <Label htmlFor="foodName">Name</Label>
                    <Input id="foodName" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div className="field-grid sm:col-span-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input id="brand" value={form.brand} onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))} />
                  </div>
                  <div className="field-grid">
                    <Label htmlFor="servingSize">Serving Size</Label>
                    <Input id="servingSize" type="number" step="0.1" min="0" value={form.servingSize} onChange={(e) => setForm((p) => ({ ...p, servingSize: e.target.value }))} required />
                  </div>
                  <div className="field-grid">
                    <Label htmlFor="servingUnit">Unit</Label>
                    <Input id="servingUnit" value={form.servingUnit} onChange={(e) => setForm((p) => ({ ...p, servingUnit: e.target.value }))} required />
                  </div>
                  <div className="field-grid">
                    <Label htmlFor="calories">Calories</Label>
                    <Input id="calories" type="number" step="0.1" min="0" value={form.calories} onChange={(e) => setForm((p) => ({ ...p, calories: e.target.value }))} required />
                  </div>
                  <div className="field-grid">
                    <Label htmlFor="protein">Protein</Label>
                    <Input id="protein" type="number" step="0.1" min="0" value={form.protein} onChange={(e) => setForm((p) => ({ ...p, protein: e.target.value }))} required />
                  </div>
                  <div className="field-grid">
                    <Label htmlFor="carbs">Carbs</Label>
                    <Input id="carbs" type="number" step="0.1" min="0" value={form.carbs} onChange={(e) => setForm((p) => ({ ...p, carbs: e.target.value }))} required />
                  </div>
                  <div className="field-grid">
                    <Label htmlFor="fat">Fat</Label>
                    <Input id="fat" type="number" step="0.1" min="0" value={form.fat} onChange={(e) => setForm((p) => ({ ...p, fat: e.target.value }))} required />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="submit" effect="glow" disabled={isSaving}>{isSaving ? "Saving..." : "Save Food"}</Button>
                  <Button type="button" variant="outline" onClick={() => setShowEditor(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
