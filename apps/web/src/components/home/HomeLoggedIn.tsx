import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { NicotineEntry, NicotineType } from "@nicflow/shared";
import { Button, Card, CardContent, CardHeader, CardTitle } from "../ui";
import {
  DEFAULT_DEVICES,
  DeviceSelector,
  type DeviceConfig,
  type DeviceType,
} from "../features/DeviceSelector";

interface HomeLoggedInProps {
  selectedDevice: DeviceType | null;
  selectedDeviceConfig: DeviceConfig | null;
  onSelectDevice: (device: DeviceType) => void;
  onLog: () => void;
  isLogging: boolean;
  recentEntries: NicotineEntry[];
  levelSeriesPoints: Array<{ timestamp: string; levelMg: number }>;
  usageByType: Array<{ type: NicotineType; count: number }>;
  stats: {
    currentLevel: number;
    entriesLast24h: number;
    totalNicotineLast24h: number;
    todayUsage: number;
    timeToBaseline: number;
    peakLevel: number;
    adjustmentApplied: boolean;
    adjustmentFactor: number;
  };
  costs: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

const typeLabels: Record<NicotineType, string> = {
  cigarette: "Cigarettes",
  vape: "Vapes",
  zyn: "Zyn",
  pouch: "Pouches",
  gum: "Gum",
  patch: "Patch",
  other: "Other",
};

const toDeviceType = (type: NicotineType): DeviceType => {
  switch (type) {
    case "vape":
      return "vape";
    case "zyn":
    case "pouch":
      return "zyn";
    case "cigarette":
      return "cigarette";
    default:
      return "iqos";
  }
};

const formatHours = (value: number) => {
  if (value <= 0) return "At baseline";
  if (value < 1) return `${Math.max(1, Math.round(value * 60))}m`;
  const hours = Math.floor(value);
  const mins = Math.round((value - hours) * 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const formatRelativeTime = (timestamp: string) => {
  const time = new Date(timestamp).getTime();
  const now = Date.now();
  const diffMinutes = Math.max(0, Math.round((now - time) / (1000 * 60)));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(timestamp).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
};

export function HomeLoggedIn({
  selectedDevice,
  selectedDeviceConfig,
  onSelectDevice,
  onLog,
  isLogging,
  recentEntries,
  levelSeriesPoints,
  usageByType,
  stats,
  costs,
}: HomeLoggedInProps) {
  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(new Date()),
    []
  );

  const chartData = useMemo(
    () =>
      levelSeriesPoints.map((point) => ({
        time: new Date(point.timestamp).getTime(),
        levelMg: point.levelMg,
      })),
    [levelSeriesPoints]
  );

  const usageTotal = useMemo(
    () => usageByType.reduce((sum, item) => sum + item.count, 0),
    [usageByType]
  );

  const metricTiles = [
    {
      label: "Entries (24h)",
      value: stats.entriesLast24h.toString(),
      tone: "text-primary",
    },
    {
      label: "Nicotine (24h)",
      value: `${stats.totalNicotineLast24h.toFixed(1)} mg`,
      tone: "text-foreground",
    },
    {
      label: "Spend today",
      value: `$${costs.daily.toFixed(2)}`,
      tone: "text-foreground",
    },
    {
      label: "This month",
      value: `$${costs.monthly.toFixed(2)}`,
      tone: "text-foreground",
    },
  ];

  const baselineProgress =
    stats.peakLevel > 0
      ? Math.max(
          0,
          Math.min(
            100,
            ((stats.peakLevel - stats.currentLevel) / stats.peakLevel) * 100
          )
        )
      : 0;

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-14 pt-6 sm:px-6">
      <section className="enter-rise mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {todayLabel}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Nicotine Tracker
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Simple mobile-style logging with live scoring from your API.
        </p>
      </section>

      <Card className="enter-rise enter-delay-1 overflow-hidden">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Estimated blood nicotine
              </p>
              <p className="mt-2 text-4xl font-semibold text-foreground">
                {stats.currentLevel.toFixed(2)}
                <span className="ml-1 text-base font-medium text-muted-foreground">
                  mg
                </span>
              </p>
            </div>
            <div className="rounded-2xl bg-primary/10 px-3 py-2 text-right">
              <p className="text-xs text-muted-foreground">Today</p>
              <p className="text-lg font-semibold text-primary">
                {stats.todayUsage}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Recovery since today&apos;s peak</span>
              <span>{Math.round(baselineProgress)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${baselineProgress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-border/70 bg-background/60 px-3 py-2">
              <p className="text-xs text-muted-foreground">To baseline</p>
              <p className="text-sm font-semibold text-foreground">
                {formatHours(stats.timeToBaseline)}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/60 px-3 py-2">
              <p className="text-xs text-muted-foreground">Today peak</p>
              <p className="text-sm font-semibold text-foreground">
                {stats.peakLevel.toFixed(2)} mg
              </p>
            </div>
          </div>

          {stats.adjustmentApplied ? (
            <p className="text-xs text-muted-foreground">
              Personalized estimate active (factor: {stats.adjustmentFactor.toFixed(2)}).
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Using default model parameters (2-hour nicotine half-life).
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="enter-rise enter-delay-2 mt-4">
        <CardHeader className="space-y-2">
          <CardTitle className="text-base">Quick log</CardTitle>
          <p className="text-sm text-muted-foreground">
            Pick your product, then log in one tap.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <DeviceSelector
            selectedDevice={selectedDevice}
            onSelect={onSelectDevice}
          />
          <Button
            size="lg"
            effect="glow"
            className="h-14 w-full rounded-2xl text-base"
            onClick={onLog}
            disabled={!selectedDeviceConfig || isLogging}
          >
            {isLogging
              ? "Logging..."
              : selectedDeviceConfig
              ? `Log ${selectedDeviceConfig.name}`
              : "Select a device"}
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">24h trend</CardTitle>
          <p className="text-sm text-muted-foreground">
            Data from `GET /api/insights/level-series`.
          </p>
        </CardHeader>
        <CardContent className="h-56 p-0 pr-1">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 12, right: 8, left: -24, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="levelAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 6" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="time"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleTimeString([], {
                      hour: "numeric",
                    })
                  }
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  width={34}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--surface-elevated))",
                    fontSize: "12px",
                  }}
                  labelFormatter={(value) =>
                    new Date(Number(value)).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }
                  formatter={(value) => [`${Number(value).toFixed(2)} mg`, "Estimated level"]}
                />
                <Area
                  dataKey="levelMg"
                  type="monotone"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#levelAreaFill)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Log entries to unlock your trend.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {metricTiles.map((metric) => (
          <Card key={metric.label} className="p-0">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <p className={`mt-2 text-xl font-semibold ${metric.tone}`}>
                {metric.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Usage mix</CardTitle>
          <p className="text-sm text-muted-foreground">
            Last 14 days from `GET /api/insights/usage-by-type`.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {usageByType.length > 0 ? (
            usageByType.map((item) => {
              const pct = usageTotal > 0 ? Math.round((item.count / usageTotal) * 100) : 0;
              const device = DEFAULT_DEVICES.find(
                (candidate) => candidate.id === toDeviceType(item.type)
              );

              return (
                <div key={item.type} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-background/80"
                        style={{ color: device?.color }}
                      >
                        {device?.icon}
                      </span>
                      <span className="text-foreground">{typeLabels[item.type]}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">
              No usage data yet.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentEntries.length > 0 ? (
            recentEntries.map((entry) => {
              const device = DEFAULT_DEVICES.find(
                (candidate) => candidate.id === toDeviceType(entry.type)
              );
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/60 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted"
                      style={{ color: device?.color }}
                    >
                      {device?.icon}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {typeLabels[entry.type]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.nicotineMg.toFixed(1)} mg
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(entry.timestamp)}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">No logs yet.</p>
          )}
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Weekly spend: ${costs.weekly.toFixed(2)}
      </p>
    </div>
  );
}
