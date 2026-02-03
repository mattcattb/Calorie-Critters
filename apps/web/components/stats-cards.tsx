"use client"

import { Card, CardContent } from "@nicflow/components/ui/card"
import { TrendingDown, Clock, Activity, Zap } from "lucide-react"

interface StatsCardsProps {
  currentLevel: number
  todayCount: number
  timeUntilBaseline: number // in hours
  peakLevel: number
}

export function StatsCards({ currentLevel, todayCount, timeUntilBaseline, peakLevel }: StatsCardsProps) {
  const formatTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`
    }
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  const stats = [
    {
      label: "Current Level",
      value: `${currentLevel.toFixed(1)}`,
      unit: "ng/mL",
      icon: <Activity className="w-4 h-4" />,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Today's Uses",
      value: todayCount.toString(),
      unit: "total",
      icon: <Zap className="w-4 h-4" />,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Time to Baseline",
      value: timeUntilBaseline > 0 ? formatTime(timeUntilBaseline) : "At baseline",
      unit: timeUntilBaseline > 0 ? "remaining" : "",
      icon: <Clock className="w-4 h-4" />,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      label: "Today's Peak",
      value: `${peakLevel.toFixed(1)}`,
      unit: "ng/mL",
      icon: <TrendingDown className="w-4 h-4" />,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-md ${stat.bgColor} ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-semibold ${stat.color}`}>
                {stat.value}
              </span>
              {stat.unit && (
                <span className="text-xs text-muted-foreground">{stat.unit}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
