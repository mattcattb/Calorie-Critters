import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  PetInteractionType,
  UpdateUserPetInput,
  RecordPetEventInput,
  UserPetBundle,
} from "@calorie-critters/shared";
import { apiFetch } from "../lib/api";
import { useSession } from "../lib/auth";

type PetContextValue = {
  petBundle: UserPetBundle | null;
  isLoading: boolean;
  isUpdating: boolean;
  isInteracting: boolean;
  interact: (
    type: PetInteractionType,
    route?: string,
    payload?: Record<string, unknown>,
  ) => Promise<void>;
  updatePet: (input: UpdateUserPetInput) => Promise<void>;
  refresh: () => Promise<void>;
};

const PetContext = createContext<PetContextValue | null>(null);

export function PetProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const queryClient = useQueryClient();
  const enabled = Boolean(session && !isPending);

  const petQuery = useQuery({
    queryKey: ["pet", "me"],
    queryFn: () => apiFetch<UserPetBundle>("/api/pets/me"),
    enabled,
    staleTime: 30_000,
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateUserPetInput) =>
      apiFetch<UserPetBundle>("/api/pets/me", {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: (bundle) => {
      queryClient.setQueryData(["pet", "me"], bundle);
    },
  });

  const eventMutation = useMutation({
    mutationFn: (input: RecordPetEventInput) =>
      apiFetch<UserPetBundle>("/api/pets/me/events", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: (bundle) => {
      queryClient.setQueryData(["pet", "me"], bundle);
    },
  });

  const interact = useCallback(
    async (
      type: PetInteractionType,
      route?: string,
      payload?: Record<string, unknown>,
    ) => {
      if (!enabled) return;
      await eventMutation.mutateAsync({ type, route, payload });
    },
    [enabled, eventMutation],
  );

  const updatePet = useCallback(
    async (input: UpdateUserPetInput) => {
      if (!enabled) return;
      await updateMutation.mutateAsync(input);
    },
    [enabled, updateMutation],
  );

  const refresh = useCallback(async () => {
    if (!enabled) return;
    await queryClient.invalidateQueries({ queryKey: ["pet", "me"] });
  }, [enabled, queryClient]);

  return (
    <PetContext.Provider
      value={{
        petBundle: petQuery.data ?? null,
        isLoading: petQuery.isLoading || petQuery.isFetching,
        isUpdating: updateMutation.isPending,
        isInteracting: eventMutation.isPending,
        interact,
        updatePet,
        refresh,
      }}
    >
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error("usePet must be used within PetProvider");
  }
  return context;
}
