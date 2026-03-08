import { useRef, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

export interface HashrateDataPoint {
  time: string;
  hashrate: number;
  shares: number;
}

interface HashrateGraphProps {
  data: HashrateDataPoint[];
  maxPoints?: number;
}

export const HashrateGraph = ({ data, maxPoints = 60 }: HashrateGraphProps) => {
  const displayData = data.slice(-maxPoints);
  const maxHashrate = Math.max(...displayData.map((d) => d.hashrate), 1);
  const avgHashrate = displayData.length > 0
    ? displayData.reduce((sum, d) => sum + d.hashrate, 0) / displayData.length
    : 0;
  const peakHashrate = Math.max(...displayData.map((d) => d.hashrate), 0);

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Live Hashrate</h3>
        <div className="flex gap-4 text-xs font-mono">
          <span className="text-muted-foreground">
            Avg: <span className="text-primary">{avgHashrate.toFixed(1)} H/s</span>
          </span>
          <span className="text-muted-foreground">
            Peak: <span className="text-primary">{peakHashrate.toFixed(1)} H/s</span>
          </span>
        </div>
      </div>
      <div className="h-52">
        {displayData.length < 2 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm font-mono">
            Waiting for data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="hashrateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(199 89% 48%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sharesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 16%)" />
              <XAxis
                dataKey="time"
                stroke="hsl(215 20% 35%)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="hsl(215 20% 35%)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[0, Math.ceil(maxHashrate * 1.2)]}
                tickFormatter={(v: number) => `${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(222 47% 8%)",
                  border: "1px solid hsl(222 30% 16%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontFamily: "JetBrains Mono, monospace",
                }}
                labelStyle={{ color: "hsl(210 40% 96%)" }}
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)} ${name === "hashrate" ? "H/s" : ""}`,
                  name === "hashrate" ? "Hashrate" : "Shares",
                ]}
              />
              <Area
                type="monotone"
                dataKey="hashrate"
                stroke="hsl(199 89% 48%)"
                strokeWidth={2}
                fill="url(#hashrateGradient)"
                dot={false}
                animationDuration={300}
              />
              <Area
                type="stepAfter"
                dataKey="shares"
                stroke="hsl(142 71% 45%)"
                strokeWidth={1}
                fill="url(#sharesGradient)"
                dot={false}
                animationDuration={300}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

/** Hook to manage rolling hashrate history */
export const useHashrateHistory = (maxPoints = 60) => {
  const historyRef = useRef<HashrateDataPoint[]>([]);

  const addPoint = useCallback(
    (hashrate: number, shares: number) => {
      const now = new Date();
      const time = `${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
      historyRef.current = [
        ...historyRef.current.slice(-(maxPoints - 1)),
        { time, hashrate, shares },
      ];
      return [...historyRef.current];
    },
    [maxPoints]
  );

  const clear = useCallback(() => {
    historyRef.current = [];
  }, []);

  return { history: historyRef, addPoint, clear };
};
