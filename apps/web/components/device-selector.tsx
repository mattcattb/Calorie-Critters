import React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@nicflow/components/ui/card"
import { Button } from "@nicflow/components/ui/button"
import { cn } from "@nicflow/api/lib/utils"
import { Wind, Cigarette, Flame, Package } from "lucide-react"

export type DeviceType = "vape" | "zyn" | "cigarette" | "iqos"

interface Device {
  id: DeviceType
  name: string
  icon: React.ReactNode
  nicotineMg: number
  color: string
  description: string
}

const devices: Device[] = [
  {
    id: "vape",
    name: "Vape",
    icon: <Wind className="w-6 h-6" />,
    nicotineMg: 1.5,
    color: "oklch(0.7 0.18 180)",
    description: "~1.5mg per hit",
  },
  {
    id: "zyn",
    name: "Zyn",
    icon: <Package className="w-6 h-6" />,
    nicotineMg: 4,
    color: "oklch(0.75 0.15 60)",
    description: "~4mg per pouch",
  },
  {
    id: "cigarette",
    name: "Cigarette",
    icon: <Cigarette className="w-6 h-6" />,
    nicotineMg: 1.2,
    color: "oklch(0.65 0.2 340)",
    description: "~1.2mg absorbed",
  },
  {
    id: "iqos",
    name: "IQOS",
    icon: <Flame className="w-6 h-6" />,
    nicotineMg: 1.0,
    color: "oklch(0.6 0.15 280)",
    description: "~1mg per stick",
  },
]

interface DeviceSelectorProps {
  selectedDevice: DeviceType | null
  onSelect: (device: DeviceType) => void
  onLog: (device: DeviceType) => void
  onSimulate: (device: DeviceType | null) => void
  isSimulating: boolean
}

export function DeviceSelector({
  selectedDevice,
  onSelect,
  onLog,
  onSimulate,
  isSimulating,
}: DeviceSelectorProps) {
  const [hoveredDevice, setHoveredDevice] = useState<DeviceType | null>(null)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium text-foreground">
          Log Nicotine Use
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select your device to log or preview its effect
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {devices.map((device) => (
            <button
              type="button"
              key={device.id}
              onClick={() => onSelect(device.id)}
              onMouseEnter={() => setHoveredDevice(device.id)}
              onMouseLeave={() => setHoveredDevice(null)}
              className={cn(
                "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
                selectedDevice === device.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-muted-foreground/50 bg-secondary/30"
              )}
            >
              <div
                className={cn(
                  "p-3 rounded-full mb-2 transition-colors",
                  selectedDevice === device.id ? "bg-primary/20" : "bg-secondary"
                )}
                style={{
                  color: selectedDevice === device.id || hoveredDevice === device.id 
                    ? device.color 
                    : "oklch(0.6 0 0)",
                }}
              >
                {device.icon}
              </div>
              <span
                className={cn(
                  "font-medium text-sm",
                  selectedDevice === device.id ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {device.name}
              </span>
              <span className="text-xs text-muted-foreground mt-0.5">
                {device.description}
              </span>
            </button>
          ))}
        </div>

        {selectedDevice && (
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => onLog(selectedDevice)}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Log Now
            </Button>
            <Button
              variant="outline"
              onClick={() => onSimulate(isSimulating ? null : selectedDevice)}
              className={cn(
                "flex-1 border-border",
                isSimulating && "bg-accent/20 border-accent text-accent"
              )}
            >
              {isSimulating ? "Clear Preview" : "Preview Effect"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
