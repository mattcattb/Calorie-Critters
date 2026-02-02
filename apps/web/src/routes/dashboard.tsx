import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../lib/api";
import { useSession } from "../lib/auth";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  useToast,
} from "../components/ui";
import {
  DEFAULT_NICOTINE_MG,
  NICOTINE_TYPES,
  type NicotineType,
  type Product,
} from "@nicflow/shared";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: session, isPending } = useSession();
  const { notify } = useToast();
  const queryClient = useQueryClient();
  const [type, setType] = useState<NicotineType>("cigarette");
  const [nicotineMg, setNicotineMg] = useState(DEFAULT_NICOTINE_MG.cigarette);
  const [notes, setNotes] = useState("");

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await api.entries.stats.$get();
      return res.json();
    },
    refetchInterval: 30000,
  });

  const { data: entries } = useQuery({
    queryKey: ["entries"],
    queryFn: async () => {
      const res = await api.entries.$get();
      return res.json();
    },
  });

  const { data: devices } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.products.$get();
      return res.json() as Promise<Product[]>;
    },
  });

  const { data: lastUsedDevice } = useQuery({
    queryKey: ["products", "lastUsed"],
    queryFn: async () => {
      const res = await api.products["last-used"].$get();
      return res.json();
    },
  });

  const addEntry = useMutation({
    mutationFn: async () => {
      const res = await api.entries.$post({
        json: { type, nicotineMg, notes: notes || undefined },
      });
      if (!res.ok) {
        const errorBody = (await res.json()) as { error?: { message?: string } };
        throw new Error(errorBody.error?.message ?? "Unable to add entry");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["costStats"] });
      setNotes("");
      notify({
        title: "Entry added",
        description: "Logged your nicotine entry.",
        type: "success",
      });
    },
    onError: (error) => {
      notify({
        title: "Entry failed",
        description: error instanceof Error ? error.message : "Please try again.",
        type: "error",
      });
    },
  });

  const quickLog = useMutation({
    mutationFn: async (device: Product) => {
      const res = await api.entries.$post({
        json: {
          type: device.type,
          amount: 1,
          nicotineMg: device.nicotineMg,
          productId: device.id,
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
      notify({
        title: "Logged",
        description: "Device entry added.",
        type: "success",
      });
    },
    onError: (error) => {
      notify({
        title: "Log failed",
        description: error instanceof Error ? error.message : "Please try again.",
        type: "error",
      });
    },
  });

  const handleTypeChange = (newType: NicotineType) => {
    setType(newType);
    setNicotineMg(DEFAULT_NICOTINE_MG[newType]);
  };

  if (isPending) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading...</div>
    );
  }

  if (!session) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">
          Please sign in to access the dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
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
            <Badge variant="primary" className="mt-3">
              In bloodstream now
            </Badge>
          </CardContent>
        </Card>
        <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Entries (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {stats?.entriesLast24h ?? 0}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Entries logged today
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
              <div className="text-2xl font-semibold">
                {stats?.totalNicotineMg ?? 0} mg
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Total intake in the last day
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick log</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tap once to log your usual devices.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {(devices ?? []).slice(0, 6).map((device) => (
              <button
                key={device.id}
                type="button"
                onClick={() => quickLog.mutate(device)}
                disabled={quickLog.isPending}
                className="rounded-xl border border-border bg-background/60 p-4 text-left transition hover:border-primary/60 hover:bg-primary/10"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{device.name}</span>
                  {device.isDefault ? (
                    <Badge variant="primary">Default</Badge>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {device.type} • {device.nicotineMg} mg
                </p>
              </button>
            ))}
            {(devices ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Add devices in Settings to enable quick log.
              </p>
            ) : null}
          </div>
          {lastUsedDevice?.product ? (
            <div className="mt-4 rounded-lg border border-border bg-surface/60 px-4 py-3 text-sm">
              <span className="text-muted-foreground">Last used:</span>{" "}
              <span className="font-medium">{lastUsedDevice.product.name}</span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Log nicotine</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add quick entries to keep your timeline accurate.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="field-grid">
              <Label htmlFor="nic-type">Type</Label>
              <Select
                id="nic-type"
                value={type}
                onChange={(e) =>
                  handleTypeChange(e.target.value as NicotineType)
                }
              >
                {NICOTINE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="field-grid">
              <Label htmlFor="nic-amount">Nicotine (mg)</Label>
              <Input
                id="nic-amount"
                type="number"
                value={nicotineMg}
                onChange={(e) => setNicotineMg(parseFloat(e.target.value))}
                step="0.1"
                min="0"
              />
            </div>
            <div className="field-grid">
              <Label htmlFor="nic-notes">Notes</Label>
              <Input
                id="nic-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => addEntry.mutate()}
                disabled={addEntry.isPending}
                className="w-full"
                effect="glow"
              >
                {addEntry.isPending ? "Adding..." : "Add Entry"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent entries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {entries?.slice(0, 10).map((entry) => (
            <div
              key={entry.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background/60 px-3 py-2"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="neutral" className="capitalize">
                  {entry.type}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {entry.nicotineMg} mg
                </span>
                {entry.notes && (
                  <span className="text-sm text-muted-foreground">
                    • {entry.notes}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(entry.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
          {(!entries || entries.length === 0) && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No entries yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
