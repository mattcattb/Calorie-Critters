import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import { api } from "../lib/api";
import { useSession } from "../lib/auth";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "../components/ui";
import type { NicotineEntry } from "@nicflow/shared";

export const Route = createFileRoute("/stats")({
  component: StatsPage,
});

function StatsPage() {
  const { data: session, isPending } = useSession();

  const { data: entries } = useQuery({
    queryKey: ["entries"],
    queryFn: async () => {
      const res = await api.entries.$get();
      return res.json() as Promise<NicotineEntry[]>;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await api.entries.stats.$get();
      return res.json();
    },
  });

  const { data: costStats } = useQuery({
    queryKey: ["costStats"],
    queryFn: async () => {
      const res = await api.entries["cost-stats"].$get();
      return res.json();
    },
  });

  if (isPending) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading...</div>
    );
  }

  if (!session) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Please sign in to view stats.
      </div>
    );
  }

  const orderedEntries = [...(entries ?? [])].reverse();
  const chartData = orderedEntries.map((entry) => ({
    time: new Date(entry.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    nicotineMg: entry.nicotineMg,
    type: entry.type,
  }));

  const typeCounts = (entries ?? []).reduce<Record<string, number>>(
    (acc, entry) => {
      acc[entry.type] = (acc[entry.type] ?? 0) + entry.amount;
      return acc;
    },
    {}
  );

  const typeData = Object.entries(typeCounts).map(([type, count]) => ({
    type,
    count,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Insights</p>
          <h1 className="text-2xl font-semibold">Usage Stats</h1>
        </div>
        <Badge variant="neutral">Last 30 days</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Current Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-primary">
              {stats?.currentLevelMg ?? 0} mg
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Active nicotine</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Entries (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {stats?.entriesLast24h ?? 0}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Total Nicotine (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {stats?.totalNicotineMg ?? 0} mg
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Daily total</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Daily</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              ${costStats?.dailySpending?.toFixed?.(2) ?? "0.00"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Weekly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              ${costStats?.weeklySpending?.toFixed?.(2) ?? "0.00"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Monthly
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              ${costStats?.monthlySpending?.toFixed?.(2) ?? "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="min-h-[320px]">
          <CardHeader>
            <CardTitle>Nicotine over time</CardTitle>
            <p className="text-sm text-muted-foreground">
              Each entry shows intake across the day.
            </p>
          </CardHeader>
          <CardContent className="h-64">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <RechartsTooltip
                    contentStyle={{
                      background: "rgba(25, 18, 38, 0.9)",
                      border: "1px solid rgba(123, 86, 168, 0.5)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="nicotineMg"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No entries yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="min-h-[320px]">
          <CardHeader>
            <CardTitle>Usage by type</CardTitle>
            <p className="text-sm text-muted-foreground">
              Count of logged items by product type.
            </p>
          </CardHeader>
          <CardContent className="h-64">
            {typeData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="type" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <RechartsTooltip
                    contentStyle={{
                      background: "rgba(25, 18, 38, 0.9)",
                      border: "1px solid rgba(123, 86, 168, 0.5)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No entries yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
