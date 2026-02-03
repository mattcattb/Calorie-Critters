import type { ReactNode } from "react";
import { Button } from "../ui/button";
import { cn } from "../../lib/cn";

export interface Device {
  id: string;
  name: string;
  icon: ReactNode;
  nicotineAmount: number;
  costPerUse: number;
  color: string;
}

interface QuickLogButtonsProps {
  devices: Device[];
  onLog: (device: Device) => void;
  recentlyLogged?: string | null;
}

export function VapeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="8" y="2" width="8" height="20" rx="2" />
      <line x1="12" y1="6" x2="12" y2="8" />
      <circle cx="12" cy="12" r="2" />
      <line x1="8" y1="18" x2="16" y2="18" />
    </svg>
  );
}

export function ZynIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="12" rx="9" ry="4" />
      <path d="M3 12v2c0 2.2 4 4 9 4s9-1.8 9-4v-2" />
      <path d="M3 14v2c0 2.2 4 4 9 4s9-1.8 9-4v-2" />
    </svg>
  );
}

export function CigaretteIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="10" width="20" height="4" rx="1" />
      <line x1="18" y1="10" x2="18" y2="14" />
      <path d="M18 6c0-1.5 1-2 2-2s2 .5 2 2-1 2-2 2" />
      <path d="M14 6c0-1.5 1-2 2-2s2 .5 2 2-1 2-2 2" />
    </svg>
  );
}

export function IqosIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="2" width="6" height="16" rx="1" />
      <path d="M9 14h6" />
      <rect x="10" y="18" width="4" height="4" rx="0.5" />
      <circle cx="12" cy="6" r="1" />
    </svg>
  );
}

export const defaultDevices: Device[] = [
  {
    id: "vape",
    name: "Vape",
    icon: <VapeIcon className="h-6 w-6" />,
    nicotineAmount: 0.3,
    costPerUse: 5,
    color: "#22c997",
  },
  {
    id: "zyn",
    name: "Zyn",
    icon: <ZynIcon className="h-6 w-6" />,
    nicotineAmount: 6,
    costPerUse: 75,
    color: "#e5833a",
  },
  {
    id: "cigarette",
    name: "Cigarette",
    icon: <CigaretteIcon className="h-6 w-6" />,
    nicotineAmount: 1,
    costPerUse: 60,
    color: "#a78bfa",
  },
  {
    id: "iqos",
    name: "IQOS",
    icon: <IqosIcon className="h-6 w-6" />,
    nicotineAmount: 0.5,
    costPerUse: 40,
    color: "#fbbf24",
  },
];

export function QuickLogButtons({
  devices,
  onLog,
  recentlyLogged,
}: QuickLogButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {devices.map((device) => (
        <Button
          key={device.id}
          variant="outline"
          className={cn(
            "flex h-20 flex-col items-center justify-center gap-2 border-2 transition-all hover:scale-[1.02] active:scale-[0.98]",
            recentlyLogged === device.id &&
              "ring-2 ring-offset-2 ring-offset-background"
          )}
          style={{
            borderColor: recentlyLogged === device.id ? device.color : undefined,
            color: device.color,
          }}
          onClick={() => onLog(device)}
        >
          {device.icon}
          <span className="text-xs font-medium text-foreground">
            {device.name}
          </span>
        </Button>
      ))}
    </div>
  );
}
