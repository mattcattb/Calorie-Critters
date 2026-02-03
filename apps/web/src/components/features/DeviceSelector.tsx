import type { ReactNode } from "react";
import type { NicotineType } from "@nicflow/shared";
import { Card, CardContent } from "../ui/card";
import { cn } from "../../lib/cn";
import {
  CigaretteIcon,
  IqosIcon,
  VapeIcon,
  ZynIcon,
} from "../dashboard/quick-log-buttons";

export type DeviceType = "vape" | "zyn" | "cigarette" | "iqos";

export interface DeviceConfig {
  id: DeviceType;
  name: string;
  icon: ReactNode;
  nicotineMg: number;
  color: string;
  description: string;
  apiType: NicotineType;
}

export const DEFAULT_DEVICES: DeviceConfig[] = [
  {
    id: "vape",
    name: "Vape",
    icon: <VapeIcon className="h-6 w-6" />,
    nicotineMg: 1.5,
    color: "oklch(0.7 0.18 180)",
    description: "~1.5mg per hit",
    apiType: "vape",
  },
  {
    id: "zyn",
    name: "Zyn",
    icon: <ZynIcon className="h-6 w-6" />,
    nicotineMg: 4,
    color: "oklch(0.75 0.15 60)",
    description: "~4mg per pouch",
    apiType: "zyn",
  },
  {
    id: "cigarette",
    name: "Cigarette",
    icon: <CigaretteIcon className="h-6 w-6" />,
    nicotineMg: 1.2,
    color: "oklch(0.65 0.2 340)",
    description: "~1.2mg absorbed",
    apiType: "cigarette",
  },
  {
    id: "iqos",
    name: "IQOS",
    icon: <IqosIcon className="h-6 w-6" />,
    nicotineMg: 1.0,
    color: "oklch(0.6 0.15 280)",
    description: "~1mg per stick",
    apiType: "other",
  },
];

interface DeviceSelectorProps {
  selectedDevice: DeviceType | null;
  onSelect: (device: DeviceType) => void;
}

export function DeviceSelector({
  selectedDevice,
  onSelect,
}: DeviceSelectorProps) {
  return (
    <Card className="border-border bg-surface/60">
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <span>Device</span>
          {selectedDevice ? (
            <span className="text-xs font-normal normal-case tracking-normal">
              {
                DEFAULT_DEVICES.find((device) => device.id === selectedDevice)
                  ?.description
              }
            </span>
          ) : null}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {DEFAULT_DEVICES.map((device) => {
            const isSelected = device.id === selectedDevice;
            return (
              <button
                type="button"
                key={device.id}
                onClick={() => onSelect(device.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs transition",
                  isSelected
                    ? "border-primary/70 bg-primary/10 text-foreground"
                    : "border-border/70 text-muted-foreground hover:border-primary/40"
                )}
              >
                <span
                  className="flex h-5 w-5 items-center justify-center"
                  style={{ color: device.color }}
                >
                  {device.icon}
                </span>
                {device.name}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
