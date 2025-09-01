import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

// ---------- Types ----------
type RangeKey = "day" | "week" | "month";
type SinglePoint = {
  time: string;
  value: number;
};
type SingleRangeData = { day?: SinglePoint[]; week?: SinglePoint[]; month?: SinglePoint[] };

type SingleProduceChartProps = {
  produceName: string;
  produceKey: string;
  produceColor: string;
  /** Option A: controlled data from parent (push AI updates into these arrays) */
  data?: SingleRangeData;
  /** Option B: polling endpoint that returns SinglePoint[]; we call /endpoint?range=<day|week|month>&produce=<produceKey> */
  endpoint?: string;
  /** Polling interval (used only when endpoint provided) */
  intervalMs?: number;
  /** Start on a specific range */
  initialRange?: RangeKey;
};

// ---------- Helpers ----------
function clampPct(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function normalizeSingleSeries(points: any[] | undefined): SinglePoint[] {
  if (!Array.isArray(points)) return [];
  return points.map((p) => ({
    time: String(p.time ?? ""),
    value: clampPct(Number(p.value ?? 0)),
  }));
}

// tiny helper to check theme at render-time
function isDark() {
  return typeof document !== "undefined" && document.documentElement.classList.contains("dark");
}

function usePolledSingleSeries(endpoint: string | undefined, range: RangeKey, produceKey: string, intervalMs = 5000) {
  const [series, setSeries] = useState<SinglePoint[]>([]);
  const timerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!endpoint) return;

    const fetchOnce = async () => {
      try {
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        const url = `${endpoint}?range=${encodeURIComponent(range)}&produce=${encodeURIComponent(produceKey)}`;
        const res = await fetch(url, { signal: abortRef.current.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setSeries(normalizeSingleSeries(json));
      } catch {
        // keep silent; continue polling
      }
    };

    fetchOnce();
    timerRef.current = window.setInterval(fetchOnce, intervalMs) as unknown as number;

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      abortRef.current?.abort();
    };
  }, [endpoint, range, produceKey, intervalMs]);

  return series;
}

// ---------- Component ----------
export function SingleProduceChart({
  produceName,
  produceKey,
  produceColor,
  data,
  endpoint,
  intervalMs = 5000,
  initialRange = "day",
}: SingleProduceChartProps) {
  const [range, setRange] = useState<RangeKey>(initialRange);

  // A: controlled data -> choose current range
  const controlled = useMemo(() => {
    if (!data) return undefined;
    const list = data[range];
    return normalizeSingleSeries(list);
  }, [data, range]);

  // B: polled data (when endpoint present)
  const polled = usePolledSingleSeries(endpoint, range, produceKey, intervalMs);

  // Source of truth - all data set to zero initially as requested
  const chartData: SinglePoint[] = useMemo(() => {
    if (controlled && controlled.length) return controlled;
    if (polled && polled.length) return polled;
    // fallback placeholder with zero data (as requested for AI integration)
    if (range === "day") {
      return [
        { time: "6AM",  value: 0 },
        { time: "8AM",  value: 0 },
        { time: "10AM", value: 0 },
        { time: "12PM", value: 0 },
        { time: "2PM",  value: 0 },
        { time: "4PM",  value: 0 },
        { time: "6PM",  value: 0 },
        { time: "8PM",  value: 0 },
        { time: "10PM", value: 0 },
      ];
    }
    if (range === "week") {
      return [
        { time: "Mon", value: 0 },
        { time: "Tue", value: 0 },
        { time: "Wed", value: 0 },
        { time: "Thu", value: 0 },
        { time: "Fri", value: 0 },
        { time: "Sat", value: 0 },
        { time: "Sun", value: 0 },
      ];
    }
    // month (e.g., 1..31)
    return Array.from({ length: 31 }, (_, i) => ({
      time: String(i + 1),
      value: 0,
    }));
  }, [controlled, polled, range]);

  const dark = isDark();
  const axisTick = { fontSize: 10, fill: "currentColor" as const }; // SVG uses currentColor from container
  const gridStroke = dark ? "rgba(75,85,99,0.3)" : "rgba(209,213,219,0.6)";   // gray-600 / gray-300
  const tooltipStyles = {
    contentStyle: {
      background: dark ? "#111827" : "#ffffff", // gray-900 / white
      border: `1px solid ${dark ? "#374151" : "#e5e7eb"}`, // gray-700 / gray-200
      borderRadius: 8,
      color: dark ? "#e5e7eb" : "#111827",
      fontSize: 12,
    },
    labelStyle: { color: dark ? "#28509fff" : "#111827", fontSize: 12 },
    itemStyle: { color: dark ? "#d1d5db" : "#374151", fontSize: 12 },
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow h-full flex flex-col text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800">
      <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{produceName} Stock Trends</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Stock levels ({range === "day" ? "throughout the day" : range === "week" ? "daily over the week" : "daily over the month"})
          </p>
        </div>

        {/* Range switcher */}
        <div className="flex items-center gap-1 text-xs">
          {(["day","week","month"] as RangeKey[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2 py-1 rounded border transition-colors ${
                range === r
                  ? "bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
              }`}
              aria-pressed={range === r}
            >
              {r[0].toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-2 flex-1">
        <div className="h-full w-full text-inherit"> {/* sets currentColor for SVG ticks/legend */}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="time" tick={axisTick} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={axisTick} />
              <Tooltip
                formatter={(value: any) => [`${value}%`, "Stock Level"]}
                {...tooltipStyles}
              />
              <Legend
                wrapperStyle={{ fontSize: "10px", color: "inherit" }}
                formatter={(value) => <span style={{ color: "inherit" }}>{value}</span>}
              />
              <Line
                type="monotone"
                dataKey="value"
                name={produceName}
                stroke={produceColor}
                strokeWidth={2}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
