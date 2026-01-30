import { useEffect } from "react";
import { AppState } from "react-native";
import { syncUnsyncedEntries } from "./entries";

export const useSyncQueue = (intervalMs = 30000) => {
  useEffect(() => {
    let isMounted = true;

    const runSync = async () => {
      if (!isMounted) return;
      await syncUnsyncedEntries();
    };

    runSync().catch(() => undefined);

    const intervalId = setInterval(() => {
      runSync().catch(() => undefined);
    }, intervalMs);

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        runSync().catch(() => undefined);
      }
    });

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      subscription.remove();
    };
  }, [intervalMs]);
};
