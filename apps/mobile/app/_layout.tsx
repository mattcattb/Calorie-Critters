import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { initDb } from "../src/db/client";
import { useSyncQueue } from "../src/sync/useSyncQueue";

export default function RootLayout() {
  const queryClient = useMemo(() => new QueryClient(), []);

  useEffect(() => {
    initDb().catch((error) => {
      console.error("Failed to init local db", error);
    });
  }, []);

  useSyncQueue();

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
