import { useMemo } from "react";
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";

export interface NicotineLog {
  time: Date;
  amount: number;
  device: string;
}

interface NicotineCurveProps {
  logs: NicotineLog[];
  currentTime: Date;
  hoursPast?: number;
  hoursFuture?: number;
  stepMinutes?: number;
}

const HALF_LIFE_HOURS = 2;
const DECAY_CONSTANT = Math.LN2 / HALF_LIFE_HOURS;

export function calculateNicotineLevel(logs: NicotineLog[], atTime: Date): number {
  let totalNicotine = 0;

  for (const log of logs) {
    const hoursElapsed =
      (atTime.getTime() - log.time.getTime()) / (1000 * 60 * 60);
    if (hoursElapsed >= 0) {
      const remainingNicotine = log.amount * Math.exp(-DECAY_CONSTANT * hoursElapsed);
      totalNicotine += remainingNicotine;
    }
  }

  return totalNicotine;
}

function generateCurveData(
  logs: NicotineLog[],
  currentTime: Date,
  hoursPast = 12,
  hoursFuture = 12,
  stepMinutes = 15
) {
  const data = [] as Array<{
    timestamp: number;
    nicotine: number;
  }>;
  const totalMinutes = (hoursPast + hoursFuture) * 60;
  const steps = Math.ceil(totalMinutes / stepMinutes);
  const startTime = new Date(
    currentTime.getTime() - hoursPast * 60 * 60 * 1000
  );

  for (let i = 0; i <= steps; i += 1) {
    const pointTime = new Date(
      startTime.getTime() + i * stepMinutes * 60 * 1000
    );
    const level = calculateNicotineLevel(logs, pointTime);

    data.push({
      timestamp: pointTime.getTime(),
      nicotine: Math.round(level * 100) / 100,
    });
  }

  return data;
}

export function NicotineCurve({
  logs,
  currentTime,
  hoursPast = 12,
  hoursFuture = 12,
  stepMinutes = 15,
}: NicotineCurveProps) {
  const chartData = useMemo(
    () => generateCurveData(logs, currentTime, hoursPast, hoursFuture, stepMinutes),
    [logs, currentTime, hoursPast, hoursFuture, stepMinutes]
  );
  const currentLevel = useMemo(
    () => calculateNicotineLevel(logs, currentTime),
    [logs, currentTime]
  );
  const cravingThreshold = 0.5;

  const chartConfig = {
    nicotine: {
      label: "Nicotine",
      color: "#22c997",
    },
  };

  return (
    <div className="relative">
      <div className="absolute left-0 top-0 z-10 flex flex-col">
        <span className="text-3xl font-bold text-primary">
          {currentLevel.toFixed(2)} mg
        </span>
        <span className="text-xs text-muted-foreground">Current blood level</span>
      </div>

      <ChartContainer config={chartConfig} className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 40, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="nicotineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c997" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22c997" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={["dataMin", "dataMax"]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#666", fontSize: 10 }}
              tickCount={6}
              tickFormatter={(value) =>
                new Date(value).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#666", fontSize: 10 }}
              width={30}
              domain={[0, "auto"]}
            />
            <ReferenceLine
              x={currentTime.getTime()}
              stroke="#a78bfa"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
            />
            <ReferenceLine
              y={cravingThreshold}
              stroke="#e5833a"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={{ stroke: "#22c997", strokeOpacity: 0.3 }}
              labelFormatter={(value) =>
                new Date(value).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
            />
            <Area
              type="monotone"
              dataKey="nicotine"
              stroke="#22c997"
              strokeWidth={2}
              fill="url(#nicotineGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "#22c997" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>

      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="h-0.5 w-4 bg-primary" />
          <span>Blood nicotine</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-0.5 w-4 bg-accent" style={{ borderStyle: "dashed" }} />
          <span>Craving threshold</span>
        </div>
      </div>
    </div>
  );
}
