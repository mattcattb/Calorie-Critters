import {createFileRoute, Navigate} from "@tanstack/react-router";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useState} from "react";
import {api} from "../lib/api";
import {useSession} from "../lib/auth";
import {useOnboardingProfile} from "../lib/onboarding";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Select,
  useToast,
} from "../components/ui";
import {NICOTINE_TYPES, type NicotineType, type Product} from "@nicflow/shared";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const {data: session, isPending} = useSession();
  const {data: profile, isPending: profilePending} = useOnboardingProfile(
    Boolean(session)
  );
  const {notify} = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState<NicotineType>("cigarette");
  const [nicotineMg, setNicotineMg] = useState(1);
  const [costPerUnit, setCostPerUnit] = useState<string>("");
  const [isDefault, setIsDefault] = useState(false);

  const {data: devices} = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.products.$get();
      return res.json() as Promise<Product[]>;
    },
  });

  const createDevice = useMutation({
    mutationFn: async () => {
      const res = await api.products.$post({
        json: {
          name,
          type,
          nicotineMg,
          costPerUnit: costPerUnit ? Number(costPerUnit) : undefined,
          isDefault,
        },
      });
      if (!res.ok) {
        const errorBody = (await res.json()) as { error?: { message?: string } };
        throw new Error(errorBody.error?.message ?? "Unable to save device");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["products"]});
      setName("");
      setCostPerUnit("");
      setIsDefault(false);
      notify({
        title: "Device saved",
        description: "Your device is ready for quick log.",
        type: "success",
      });
    },
    onError: (error) => {
      notify({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Please try again.",
        type: "error",
      });
    },
  });

  const quickLog = useMutation({
    mutationFn: async (product: Product) => {
      const res = await api.entries.$post({
        json: {
          type: product.type,
          amount: 1,
          nicotineMg: product.nicotineMg,
          productId: product.id,
        },
      });
      if (!res.ok) {
        const errorBody = (await res.json()) as { error?: { message?: string } };
        throw new Error(errorBody.error?.message ?? "Unable to log device");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["entries"]});
      queryClient.invalidateQueries({queryKey: ["stats"]});
      queryClient.invalidateQueries({queryKey: ["costStats"]});
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

  if (isPending || (session && profilePending)) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading...</div>
    );
  }

  if (session && profile && !profile.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!session) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Please sign in to access settings.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Account</p>
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <p className="text-sm text-muted-foreground">
              Your current session info.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-4 py-3">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-sm">{session.user.email}</p>
              </div>
              <Badge variant="neutral">Active</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick log</CardTitle>
            <p className="text-sm text-muted-foreground">
              Save your go-to products and log in one tap.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {(devices ?? []).slice(0, 4).map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{device.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {device.type} • {device.nicotineMg} mg
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => quickLog.mutate(device)}
                  disabled={quickLog.isPending}>
                  Log
                </Button>
              </div>
            ))}
            {(devices ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Add a device below to enable quick logging.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Devices</CardTitle>
          <p className="text-sm text-muted-foreground">
            Save product presets for quick logging.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="field-grid md:col-span-2">
              <Label htmlFor="device-name">Name</Label>
              <Input
                id="device-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mint Vape"
              />
            </div>
            <div className="field-grid">
              <Label htmlFor="device-type">Type</Label>
              <Select
                id="device-type"
                value={type}
                onChange={(e) => setType(e.target.value as NicotineType)}>
                {NICOTINE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="field-grid">
              <Label htmlFor="device-mg">Nicotine (mg)</Label>
              <Input
                id="device-mg"
                type="number"
                min="0"
                step="0.1"
                value={nicotineMg}
                onChange={(e) => setNicotineMg(Number(e.target.value))}
              />
            </div>
            <div className="field-grid">
              <Label htmlFor="device-cost">Cost / unit</Label>
              <Input
                id="device-cost"
                type="number"
                min="0"
                step="0.01"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="flex items-end">
              <Button
                className="w-full"
                onClick={() => createDevice.mutate()}
                disabled={!name || createDevice.isPending}>
                {createDevice.isPending ? "Saving..." : "Save device"}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isDefault}
              onCheckedChange={(value) => setIsDefault(Boolean(value))}
              label="Set as default for this type"
            />
          </div>

          <div className="space-y-3">
            {(devices ?? []).map((device) => (
              <div
                key={device.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background/50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{device.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {device.type} • {device.nicotineMg} mg
                    {device.costPerUnit
                      ? ` • $${device.costPerUnit.toFixed(2)}`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {device.isDefault ? (
                    <Badge variant="primary">Default</Badge>
                  ) : null}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => quickLog.mutate(device)}
                    disabled={quickLog.isPending}>
                    Quick log
                  </Button>
                </div>
              </div>
            ))}
            {(devices ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No devices saved yet.
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
