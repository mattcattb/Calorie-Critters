import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { useSession } from "../lib/auth";
import { useOnboardingProfile } from "../lib/onboarding";
import type { NicotineEntry, NicotineType } from "@nicflow/shared";
import {
  DEFAULT_DEVICES,
  type DeviceConfig,
  type DeviceType,
} from "../components/features/DeviceSelector";
import { HomeLoggedIn } from "../components/home/HomeLoggedIn";
import { LandingPage } from "../components/landing/LandingPage";

export const Route = createFileRoute("/")({
  component: HomePage,
});

interface LevelSeriesResponse {
  hours: number;
  intervalMinutes: number;
  points: Array<{ timestamp: string; levelMg: number }>;
}

interface UsageByTypeResponse {
  days: number;
  totalEntries: number;
  byType: Record<string, number>;
}

interface CostStatsResponse {
  dailySpending: number;
  weeklySpending: number;
  monthlySpending: number;
}

function HomePage() {
  const { data: session, isPending } = useSession();
  const { data: profile, isPending: profilePending } = useOnboardingProfile(
    Boolean(session)
  );
  const queryClient = useQueryClient();

  const [selectedDevice, setSelectedDevice] = useState<DeviceType | null>(null);

  const { data: entries } = useQuery({
    queryKey: ["entries"],
    queryFn: async () => {
      const res = await api.entries.$get();
      return res.json() as Promise<NicotineEntry[]>;
    },
    enabled: Boolean(session),
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await api.entries.stats.$get();
      return res.json();
    },
    enabled: Boolean(session),
    refetchInterval: 30000,
  });

  const { data: costStats } = useQuery({
    queryKey: ["costStats"],
    queryFn: async () => {
      const res = await api.entries["cost-stats"].$get();
      return res.json() as Promise<CostStatsResponse>;
    },
    enabled: Boolean(session),
  });

  const { data: levelSeries } = useQuery({
    queryKey: ["insights", "level-series", 24, 20],
    queryFn: async () => {
      const res = await api.insights["level-series"].$get({
        query: {
          hours: "24",
          intervalMinutes: "20",
        },
      });
      return res.json() as Promise<LevelSeriesResponse>;
    },
    enabled: Boolean(session),
  });

  const { data: usageByType } = useQuery({
    queryKey: ["insights", "usage-by-type", 14],
    queryFn: async () => {
      const res = await api.insights["usage-by-type"].$get({
        query: {
          days: "14",
        },
      });
      return res.json() as Promise<UsageByTypeResponse>;
    },
    enabled: Boolean(session),
  });

  useEffect(() => {
    if (!session) return;
    if (!selectedDevice) {
      setSelectedDevice(DEFAULT_DEVICES[0].id);
    }
  }, [selectedDevice, session]);

  const selectedDeviceConfig = useMemo<DeviceConfig | null>(
    () => DEFAULT_DEVICES.find((device) => device.id === selectedDevice) ?? null,
    [selectedDevice]
  );

  const quickLog = useMutation({
    mutationFn: async (device: DeviceConfig) => {
      const res = await api.entries.$post({
        json: {
          type: device.apiType,
          amount: 1,
          nicotineMg: device.nicotineMg,
          notes: device.id === "iqos" ? "IQOS" : undefined,
        },
      });
      if (!res.ok) {
        const errorBody = (await res.json()) as { error?: { message?: string } };
        throw new Error(errorBody.error?.message ?? "Unable to log device");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["costStats"] });
      queryClient.invalidateQueries({ queryKey: ["insights"] });
    },
  });

  const handleLog = (deviceType: DeviceType) => {
    const device = DEFAULT_DEVICES.find((item) => item.id === deviceType);
    if (!device || quickLog.isPending) return;
    quickLog.mutate(device);
  };

  const recentEntries = useMemo(() => (entries ?? []).slice(0, 8), [entries]);

  const usageByTypeItems = useMemo(
    () =>
      Object.entries(usageByType?.byType ?? {})
        .map(([type, count]) => ({
          type: type as NicotineType,
          count,
        }))
        .sort((a, b) => b.count - a.count),
    [usageByType]
  );

  if (isPending || (session && profilePending)) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading...</div>
    );
  }

  if (session && profile && !profile.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!session) {
    return <LandingPage />;
  }

  return (
    <HomeLoggedIn
      selectedDevice={selectedDevice}
      selectedDeviceConfig={selectedDeviceConfig}
      onSelectDevice={setSelectedDevice}
      onLog={() => selectedDevice && handleLog(selectedDevice)}
      isLogging={quickLog.isPending}
      recentEntries={recentEntries}
      levelSeriesPoints={levelSeries?.points ?? []}
      usageByType={usageByTypeItems}
      stats={{
        currentLevel: stats?.currentLevelMg ?? 0,
        entriesLast24h: stats?.entriesLast24h ?? 0,
        totalNicotineLast24h: stats?.totalNicotineMg ?? 0,
        todayUsage: stats?.todayUsage ?? 0,
        timeToBaseline: stats?.timeToBaselineHours ?? 0,
        peakLevel: stats?.peakLevelTodayMg ?? 0,
        adjustmentApplied: Boolean(stats?.adjustmentApplied),
        adjustmentFactor: stats?.adjustmentFactor ?? 1,
      }}
      costs={{
        daily: costStats?.dailySpending ?? 0,
        weekly: costStats?.weeklySpending ?? 0,
        monthly: costStats?.monthlySpending ?? 0,
      }}
    />
  );
}
