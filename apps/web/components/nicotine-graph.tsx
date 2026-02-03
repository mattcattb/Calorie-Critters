"use client"

import { useState, useMemo } from "react"
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@nicflow/components/ui/card"
import { Button } from "@nicflow/components/ui/button"
import { cn } from "@nicflow/api/lib/utils"

interface NicotineEntry {
  time: Date
  amount: number // mg of nicotine
  type: "vape" | "zyn" | "cigarette" | "iqos"
}

interface NicotineGraphProps {
  entries: NicotineEntry[]
  simulatedEntry?: { type: "vape" | "zyn" | "cigarette" | "iqos"; time: Date } | null
}

// Nicotine pharmacokinetics - half-life is ~2 hours
const HALF_LIFE_HOURS = 2
const DECAY_CONSTANT = Math.log(2) / HALF_LIFE_HOURS

// Absorption rates vary by delivery method
const ABSORPTION_PROFILES = {
  vape: { peakTime: 0.1, peakFactor: 0.9, mg: 1.5 },
  zyn: { peakTime: 0.5, peakFactor: 0.7, mg: 4 },
  cigarette: { peakTime: 0.15, peakFactor: 0.85, mg: 1.2 },
  iqos: { peakTime: 0.12, peakFactor: 0.8, mg: 1.0 },
}

function calculateConcentration(
  entries: NicotineEntry[],
  timePoint: Date,
  simulatedEntry?: { type: "vape" | "zyn" | "cigarette" | "iqos"; time: Date } | null
): { actual: number; simulated: number } {
  let actual = 0
  let simulated = 0

  const allEntries = [...entries]
  
  for (const entry of allEntries) {
    const hoursElapsed = (timePoint.getTime() - entry.time.getTime()) / (1000 * 60 * 60)
    if (hoursElapsed < 0) continue

    const profile = ABSORPTION_PROFILES[entry.type]
    const peakConcentration = entry.amount * profile.peakFactor

    // Simple exponential decay after absorption
    if (hoursElapsed >= profile.peakTime) {
      const decayTime = hoursElapsed - profile.peakTime
      actual += peakConcentration * Math.exp(-DECAY_CONSTANT * decayTime)
    } else {
      // Rising phase
      const riseProgress = hoursElapsed / profile.peakTime
      actual += peakConcentration * riseProgress
    }
  }

  simulated = actual

  // Add simulated entry effect
  if (simulatedEntry) {
    const hoursElapsed = (timePoint.getTime() - simulatedEntry.time.getTime()) / (1000 * 60 * 60)
    if (hoursElapsed >= 0) {
      const profile = ABSORPTION_PROFILES[simulatedEntry.type]
      const peakConcentration = profile.mg * profile.peakFactor

      if (hoursElapsed >= profile.peakTime) {
        const decayTime = hoursElapsed - profile.peakTime
        simulated += peakConcentration * Math.exp(-DECAY_CONSTANT * decayTime)
      } else {
        const riseProgress = hoursElapsed / profile.peakTime
        simulated += peakConcentration * riseProgress
      }
    }
  }

  return { actual, simulated }
}

export function NicotineGraph({ entries, simulatedEntry }: NicotineGraphProps) {
  const [timeRange, setTimeRange] = useState<"6h" | "12h" | "24h">("12h")

  const data = useMemo(() => {
    const now = new Date()
    const hoursBack = timeRange === "6h" ? 3 : timeRange === "12h" ? 6 : 12
    const hoursForward = timeRange === "6h" ? 3 : timeRange === "12h" ? 6 : 12
    const points: Array<{
      time: number
      label: string
      actual: number
      simulated: number
      isFuture: boolean
    }> = []

    const startTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000)
    const endTime = new Date(now.getTime() + hoursForward * 60 * 60 * 1000)
    const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60)
    const interval = 5 // minutes

    for (let i = 0; i <= totalMinutes; i += interval) {
      const pointTime = new Date(startTime.getTime() + i * 60 * 1000)
      const { actual, simulated } = calculateConcentration(entries, pointTime, simulatedEntry)
      const isFuture = pointTime > now

      points.push({
        time: pointTime.getTime(),
        label: pointTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actual: Math.max(0, actual),
        simulated: Math.max(0, simulated),
        isFuture,
      })
    }

    return points
  }, [entries, simulatedEntry, timeRange])

  const currentLevel = useMemo(() => {
    const { actual } = calculateConcentration(entries, new Date(), null)
    return actual
  }, [entries])

  const peakLevel = useMemo(() => {
    return Math.max(...data.map(d => Math.max(d.actual, d.simulated)))
  }, [data])

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-medium text-foreground">
            Blood Nicotine Concentration
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Current: <span className="text-primary font-semibold">{currentLevel.toFixed(2)} ng/mL</span>
          </p>
        </div>
        <div className="flex gap-1">
          {(["6h", "12h", "24h"] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={cn(
                "text-xs px-3",
                timeRange === range 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {range}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.7 0.18 180)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="oklch(0.7 0.18 180)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="simulatedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.75 0.15 60)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="oklch(0.75 0.15 60)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }}
                domain={[0, Math.max(peakLevel * 1.2, 5)]}
                tickFormatter={(value) => `${value.toFixed(1)}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
                        <p className="text-xs text-muted-foreground">{data.label}</p>
                        <p className="text-sm font-medium text-primary">
                          {data.actual.toFixed(2)} ng/mL
                        </p>
                        {simulatedEntry && data.simulated !== data.actual && (
                          <p className="text-sm font-medium text-accent">
                            Projected: {data.simulated.toFixed(2)} ng/mL
                          </p>
                        )}
                        {data.isFuture && (
                          <p className="text-xs text-muted-foreground mt-1">Projected</p>
                        )}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <ReferenceLine
                x={new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                stroke="oklch(0.6 0 0)"
                strokeDasharray="3 3"
                label={{
                  value: "Now",
                  position: "top",
                  fill: "oklch(0.6 0 0)",
                  fontSize: 10,
                }}
              />
              {/* Threshold lines */}
              <ReferenceLine
                y={2}
                stroke="oklch(0.5 0.1 180)"
                strokeDasharray="5 5"
                strokeOpacity={0.5}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="oklch(0.7 0.18 180)"
                strokeWidth={2}
                fill="url(#actualGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "oklch(0.7 0.18 180)" }}
              />
              {simulatedEntry && (
                <Area
                  type="monotone"
                  dataKey="simulated"
                  stroke="oklch(0.75 0.15 60)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#simulatedGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: "oklch(0.75 0.15 60)" }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-primary rounded" />
            <span className="text-muted-foreground">Actual Level</span>
          </div>
          {simulatedEntry && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-accent rounded" style={{ borderStyle: "dashed" }} />
              <span className="text-muted-foreground">If you use now</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 rounded" style={{ background: "oklch(0.5 0.1 180)" }} />
            <span className="text-muted-foreground">Baseline (2 ng/mL)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
