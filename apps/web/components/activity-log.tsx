import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@nicflow/components/ui/card"
import { Wind, Cigarette, Flame, Package, X } from "lucide-react"
import { Button } from "@nicflow/components/ui/button"
import type { DeviceType } from "./device-selector"

interface LogEntry {
  id: string
  time: Date
  type: DeviceType
  amount: number
}

const deviceIcons: Record<DeviceType, React.ReactNode> = {
  vape: <Wind className="w-4 h-4" />,
  zyn: <Package className="w-4 h-4" />,
  cigarette: <Cigarette className="w-4 h-4" />,
  iqos: <Flame className="w-4 h-4" />,
}

const deviceColors: Record<DeviceType, string> = {
  vape: "oklch(0.7 0.18 180)",
  zyn: "oklch(0.75 0.15 60)",
  cigarette: "oklch(0.65 0.2 340)",
  iqos: "oklch(0.6 0.15 280)",
}

const deviceNames: Record<DeviceType, string> = {
  vape: "Vape hit",
  zyn: "Zyn pouch",
  cigarette: "Cigarette",
  iqos: "IQOS stick",
}

interface ActivityLogProps {
  entries: LogEntry[]
  onRemove: (id: string) => void
}

export function ActivityLog({ entries, onRemove }: ActivityLogProps) {
  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  const todayEntries = entries.filter((entry) => {
    const today = new Date()
    return (
      entry.time.getDate() === today.getDate() &&
      entry.time.getMonth() === today.getMonth() &&
      entry.time.getFullYear() === today.getFullYear()
    )
  })

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-foreground">
            Today&apos;s Activity
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {todayEntries.length} logged
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {todayEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No activity logged today</p>
            <p className="text-xs mt-1">Select a device above to start tracking</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[240px] overflow-y-auto">
            {todayEntries
              .sort((a, b) => b.time.getTime() - a.time.getTime())
              .map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-full bg-secondary"
                      style={{ color: deviceColors[entry.type] }}
                    >
                      {deviceIcons[entry.type]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {deviceNames[entry.type]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.amount.toFixed(1)}mg nicotine
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(entry.time)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={() => onRemove(entry.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
