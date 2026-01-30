import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { initDb } from "../src/db/client";

export default function RootLayout() {
  const queryClient = useMemo(() => new QueryClient(), []);

  useEffect(() => {
    initDb().catch((error) => {
      console.error("Failed to init local db", error);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
