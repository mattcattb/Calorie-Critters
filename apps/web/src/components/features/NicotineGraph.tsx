import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  calculateConcentration,
  type GraphEntry,
  type SimulatedEntry,
} from "./nicotine-model";

interface NicotineGraphProps {
  entries: GraphEntry[];
  simulatedEntry?: SimulatedEntry | null;
  hoursPast?: number;
  hoursFuture?: number;
}

export function NicotineGraph({
  entries,
  simulatedEntry,
  hoursPast = 12,
  hoursFuture = 12,
}: NicotineGraphProps) {
  const { data, now, peakLevel, ticks, minWidth } = useMemo(() => {
    const now = new Date();
    const startTime = new Date(now.getTime() - hoursPast * 60 * 60 * 1000);
    startTime.setMinutes(0, 0, 0);
    const endTime = new Date(now.getTime() + hoursFuture * 60 * 60 * 1000);
    endTime.setMinutes(0, 0, 0);

    const points: Array<{
      timestamp: number;
      actual: number;
      simulated: number;
      isFuture: boolean;
    }> = [];

    const totalMinutes =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    const interval = 5;

    let peakLevel = 0;

    for (let i = 0; i <= totalMinutes; i += interval) {
      const pointTime = new Date(startTime.getTime() + i * 60 * 1000);
      const { actual, simulated } = calculateConcentration(
        entries,
        pointTime,
        simulatedEntry
      );
      const isFuture = pointTime > now;
      peakLevel = Math.max(peakLevel, actual, simulated);

      points.push({
        timestamp: pointTime.getTime(),
        actual: Math.max(0, actual),
        simulated: Math.max(0, simulated),
        isFuture,
      });
    }

    const ticks: number[] = [];
    for (
      let time = startTime.getTime();
      time <= endTime.getTime();
      time += 60 * 60 * 1000
    ) {
      ticks.push(time);
    }

    const minWidth = Math.max(720, ticks.length * 60);

    return {
      data: points,
      now,
      peakLevel: Math.max(peakLevel, 1),
      ticks,
      minWidth,
    };
  }, [entries, simulatedEntry, hoursPast, hoursFuture]);

  const currentLevel = useMemo(() => {
    const { actual } = calculateConcentration(entries, new Date(), null);
    return actual;
  }, [entries]);

  return (
    <Card className="border-border bg-surface/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-foreground">
          Blood Nicotine Concentration
        </CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Current:{" "}
          <span className="font-semibold text-primary">
            {currentLevel.toFixed(2)} ng/mL
          </span>
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[280px] w-full overflow-x-auto pb-2">
          <div style={{ minWidth }}>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.7 0.18 180)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="oklch(0.7 0.18 180)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="simulatedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f5c84c" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f5c84c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                ticks={ticks}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }}
                interval={0}
                tickFormatter={(value) =>
                  new Date(value).toLocaleTimeString([], {
                    hour: "numeric",
                  })
                }
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
                    const point = payload[0].payload as {
                      timestamp: number;
                      actual: number;
                      simulated: number;
                      isFuture: boolean;
                    };
                    return (
                      <div className="rounded-lg border border-border bg-surface/95 px-3 py-2 shadow-lg">
                        <p className="text-xs text-muted-foreground">
                          {new Date(point.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-sm font-medium text-primary">
                          {point.actual.toFixed(2)} ng/mL
                        </p>
                        {simulatedEntry && point.simulated !== point.actual && (
                          <p className="text-sm font-medium text-accent">
                            Projected: {point.simulated.toFixed(2)} ng/mL
                          </p>
                        )}
                        {point.isFuture && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Projected
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                x={now.getTime()}
                stroke="oklch(0.6 0 0)"
                strokeDasharray="2 6"
                label={{
                  value: "Now",
                  position: "top",
                  fill: "oklch(0.6 0 0)",
                  fontSize: 10,
                }}
              />
              <ReferenceLine
                y={2}
                stroke="oklch(0.5 0.1 180)"
                strokeDasharray="5 5"
                strokeOpacity={0.5}
              />
              <Area
                type="monotone"
                dataKey="actual"
                name="Actual"
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
                  name="Projected"
                  stroke="#f5c84c"
                  strokeWidth={2}
                  strokeDasharray="4 6"
                  fill="none"
                  dot={false}
                  activeDot={{ r: 4, fill: "#f5c84c" }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-3 rounded bg-primary" />
            <span className="text-muted-foreground">Actual Level</span>
          </div>
          {simulatedEntry && (
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-3 rounded bg-warning" />
              <span className="text-muted-foreground">If you use now</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div
              className="h-0.5 w-3 rounded"
              style={{ background: "oklch(0.5 0.1 180)" }}
            />
            <span className="text-muted-foreground">Baseline (2 ng/mL)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
