import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { NicotineType } from "@nicflow/shared";
import { listEntries, insertEntry } from "./entries.repo";
import { syncUnsyncedEntries } from "../sync/entries";

export const useEntries = () =>
  useQuery({
    queryKey: ["entries"],
    queryFn: listEntries,
  });

export const useCreateEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insertEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      syncUnsyncedEntries().catch((error) => {
        console.warn("Sync failed (will retry later)", error);
      });
    },
  });
};

export const useQuickLog = (type: NicotineType, nicotineMg: number) => {
  const mutation = useCreateEntry();
  return () => mutation.mutate({ type, nicotineMg, amount: 1 });
};
