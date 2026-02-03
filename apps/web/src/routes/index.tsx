import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { useSession } from "../lib/auth";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  buttonStyles,
} from "../components/ui";
import type { NicotineEntry, NicotineType } from "@nicflow/shared";
import {
  DeviceSelector,
  DEFAULT_DEVICES,
  type DeviceConfig,
  type DeviceType,
} from "../components/features/DeviceSelector";
import { NicotineGraph } from "../components/features/NicotineGraph";
import type { GraphEntry, SimulatedEntry } from "../components/features/nicotine-model";
import androidBadge from "../assets/store-android.svg";
import macBadge from "../assets/store-mac.svg";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const mapEntryTypeToDeviceType = (type: NicotineType): DeviceType => {
  switch (type) {
    case "vape":
      return "vape";
    case "zyn":
    case "pouch":
      return "zyn";
    case "cigarette":
      return "cigarette";
    case "gum":
    case "patch":
    case "other":
      return "iqos";
    default:
      return "iqos";
  }
};

function HomePage() {
  const { data: session, isPending } = useSession();
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

  useEffect(() => {
    if (!session) return;
    if (!selectedDevice) {
      setSelectedDevice(DEFAULT_DEVICES[0].id);
    }
  }, [selectedDevice, session]);

  const graphEntries = useMemo<GraphEntry[]>(
    () =>
      (entries ?? []).map((entry) => ({
        time: new Date(entry.timestamp),
        amount: entry.nicotineMg,
        type: mapEntryTypeToDeviceType(entry.type),
      })),
    [entries]
  );

  const selectedDeviceConfig = useMemo<DeviceConfig | null>(
    () => DEFAULT_DEVICES.find((device) => device.id === selectedDevice) ?? null,
    [selectedDevice]
  );

  const simulatedEntry = useMemo<SimulatedEntry | null>(() => {
    if (!selectedDeviceConfig) return null;
    return {
      type: selectedDeviceConfig.id,
      time: new Date(),
      amount: selectedDeviceConfig.nicotineMg,
    };
  }, [selectedDeviceConfig]);

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
    },
  });

  const handleLog = (deviceType: DeviceType) => {
    const device = DEFAULT_DEVICES.find((item) => item.id === deviceType);
    if (!device || quickLog.isPending) return;
    quickLog.mutate(device);
  };

  const recentBreakdown = useMemo(() => {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);
    const counts = DEFAULT_DEVICES.reduce<Record<DeviceType, number>>(
      (acc, device) => {
        acc[device.id] = 0;
        return acc;
      },
      {} as Record<DeviceType, number>
    );

    (entries ?? []).forEach((entry) => {
      if (new Date(entry.timestamp) < cutoff) return;
      const type = mapEntryTypeToDeviceType(entry.type);
      counts[type] += entry.amount ?? 1;
    });

    return DEFAULT_DEVICES.map((device) => ({
      ...device,
      count: counts[device.id],
    }));
  }, [entries]);

  if (isPending) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading...</div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl flex-col gap-16 px-6 py-16">
        <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <Badge variant="primary">Quit toolkit • early access</Badge>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Track nicotine, rebuild routines, and stay in control.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Log cigarettes, vapes, zyns, and more. See how nicotine levels
              evolve in your body, spot cravings, and celebrate cleaner streaks.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/signup"
                className={buttonStyles({ size: "lg", effect: "sheen" })}
              >
                Start tracking
              </Link>
              <Link
                to="/login"
                className={buttonStyles({ size: "lg", variant: "outline" })}
              >
                Sign in
              </Link>
            </div>
            <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-surface/60 p-3">
                <span className="text-foreground">Streak focus:</span> measure
                the time since your last hit.
              </div>
              <div className="rounded-lg border border-border bg-surface/60 p-3">
                <span className="text-foreground">Gentle nudges:</span> spot
                patterns and adjust routines.
              </div>
            </div>
          </div>
          <Card className="relative overflow-hidden">
            <CardHeader>
              <CardTitle>Tonight's snapshot</CardTitle>
              <p className="text-sm text-muted-foreground">
                A calm, purple-first view of your intake rhythm.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border bg-background/50 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Current level
                </div>
                <div className="mt-2 text-3xl font-semibold text-primary">
                  1.8 mg
                </div>
                <div className="text-xs text-muted-foreground">
                  trending down over 2h
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-surface/60 p-3">
                  <div className="text-xs text-muted-foreground">Streak</div>
                  <div className="text-lg font-semibold">14h 22m</div>
                </div>
                <div className="rounded-lg border border-border bg-surface/60 p-3">
                  <div className="text-xs text-muted-foreground">Last 24h</div>
                  <div className="text-lg font-semibold">3 entries</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        <section className="grid gap-6 rounded-3xl border border-border bg-surface/70 p-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <Badge variant="neutral">Coming soon</Badge>
            <h2 className="text-2xl font-semibold">Native apps are on the way.</h2>
            <p className="text-muted-foreground">
              We're building Android and Mac experiences that stay lightweight and
              keep your quit data synced. Use the web app for now and be first to
              know when the downloads are live.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#"
              className="transition hover:opacity-90"
              aria-label="Android app (coming soon)"
            >
              <img src={androidBadge} alt="Android app store placeholder" />
            </a>
            <a
              href="#"
              className="transition hover:opacity-90"
              aria-label="Mac app (coming soon)"
            >
              <img src={macBadge} alt="Mac app store placeholder" />
            </a>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl flex-col gap-6 px-4 py-10">
      <DeviceSelector
        selectedDevice={selectedDevice}
        onSelect={setSelectedDevice}
      />

      <Button
        size="lg"
        effect="glow"
        className="h-16 text-lg"
        onClick={() => selectedDevice && handleLog(selectedDevice)}
        disabled={!selectedDevice || quickLog.isPending}
      >
        {quickLog.isPending
          ? "Logging..."
          : selectedDeviceConfig
          ? `Log ${selectedDeviceConfig.name}`
          : "Select a device"}
      </Button>

      <NicotineGraph
        entries={graphEntries}
        simulatedEntry={simulatedEntry}
        hoursPast={12}
        hoursFuture={12}
      />

      <Card className="border-border bg-surface/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent hits</CardTitle>
          <p className="text-xs text-muted-foreground">Last 24 hours</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {recentBreakdown.map((device) => (
              <div
                key={device.id}
                className="rounded-xl border border-border bg-background/50 p-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 items-center justify-center"
                    style={{ color: device.color }}
                  >
                    {device.icon}
                  </span>
                  <span className="text-sm font-medium">{device.name}</span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {device.count}
                </p>
                <p className="text-xs text-muted-foreground">
                  hits logged
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
