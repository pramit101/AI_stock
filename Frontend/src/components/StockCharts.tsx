import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";

// ---------- Types ----------
type RangeKey = "day" | "week" | "month";
type Point = {
  time: string;
  apples: number;
  bananas: number;
  cucumbers: number;
  carrots: number;
  potatoes: number;
  tomatoes: number;
};
type RangeData = { day?: Point[]; week?: Point[]; month?: Point[] };

type StockChartsProps = {
  /** Option A: controlled data from parent (push AI updates into these arrays) */
  data?: RangeData;
  /** Option B: polling endpoint that returns Point[]; we call /endpoint?range=<day|week|month> */
  endpoint?: string;
  /** Polling interval (used only when endpoint provided) */
  intervalMs?: number;
  /** Start on a specific range */
  initialRange?: RangeKey;
};

// ---------- Helpers ----------
const PRODUCE_KEYS = [
  { key: "apples", label: "Apples", color: "#eb4031ff" },
  { key: "bananas", label: "Bananas", color: "#cedd2cff" },
  { key: "cucumbers", label: "Cucumbers", color: "#3fa21fff" },
  { key: "carrots", label: "Carrots", color: "#ea9a10ff" },
  { key: "potatoes", label: "Potatoes", color: "#4f3ee7ff" },
  { key: "tomatoes", label: "Tomatoes", color: "#910c7fff" },
] as const;

function clampPct(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function normalizeSeries(points: any[] | undefined): Point[] {
  if (!Array.isArray(points)) return [];
  return points.map((p) => ({
    time: String(p.time ?? ""),
    apples: clampPct(Number(p.apples)),
    bananas: clampPct(Number(p.bananas)),
    cucumbers: clampPct(Number(p.cucumbers)),
    carrots: clampPct(Number(p.carrots)),
    potatoes: clampPct(Number(p.potatoes)),
    tomatoes: clampPct(Number(p.tomatoes)),
  }));
}

// tiny helper to check theme at render-time
function isDark() {
  return (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
  );
}

function usePolledSeries(
  endpoint?: string,
  range: RangeKey = "day",
  intervalMs = 5000
) {
  const [series, setSeries] = useState<Point[]>([]);
  const timerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!endpoint) return;

    const fetchOnce = async () => {
      try {
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        const url = `${endpoint}?range=${encodeURIComponent(range)}`;
        const res = await fetch(url, { signal: abortRef.current.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setSeries(normalizeSeries(json));
      } catch {
        // keep silent; continue polling
      }
    };

    fetchOnce();
    timerRef.current = window.setInterval(
      fetchOnce,
      intervalMs
    ) as unknown as number;

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      abortRef.current?.abort();
    };
  }, [endpoint, range, intervalMs]);

  return series;
}

// ---------- Component ----------
export function StockCharts({
  data,
  endpoint,
  intervalMs = 5000,
  initialRange = "day",
}: StockChartsProps) {
  const [range, setRange] = useState<RangeKey>(initialRange);

  // A: controlled data -> choose current range
  const controlled = useMemo(() => {
    if (!data) return undefined;
    const list = data[range];
    return normalizeSeries(list);
  }, [data, range]);

  // B: polled data (when endpoint present)
  const polled = usePolledSeries(endpoint, range, intervalMs);

  const { t } = useTranslation();

  // Source of truth
  const chartData: Point[] = useMemo(() => {
    if (controlled && controlled.length) return controlled;
    if (polled && polled.length) return polled;
    // fallback placeholder (so the card renders before AI data)
    if (range === "day") {
      return [
        {
          time: "7AM",
          apples: 0,
          bananas: 0,
          cucumbers: 0,
          carrots: 0,
          potatoes: 0,
          tomatoes: 0,
        },
        {
          time: "10AM",
          apples: 0,
          bananas: 0,
          cucumbers: 0,
          carrots: 0,
          potatoes: 0,
          tomatoes: 0,
        },
        {
          time: "1PM",
          apples: 0,
          bananas: 0,
          cucumbers: 0,
          carrots: 0,
          potatoes: 0,
          tomatoes: 0,
        },
        {
          time: "4PM",
          apples: 0,
          bananas: 0,
          cucumbers: 0,
          carrots: 0,
          potatoes: 0,
          tomatoes: 0,
        },
        {
          time: "7PM",
          apples: 0,
          bananas: 0,
          cucumbers: 0,
          carrots: 0,
          potatoes: 0,
          tomatoes: 0,
        },
        {
          time: "10PM",
          apples: 0,
          bananas: 0,
          cucumbers: 0,
          carrots: 0,
          potatoes: 0,
          tomatoes: 0,
        },
      ];
    }
    if (range === "week") {
      return [
        {
          time: "Mon",
          apples: 0,
          bananas: 0,
          cucumbers: 0,
          carrots: 0,
          potatoes: 0,
          tomatoes: 0,
        },
        {
          time: "Tue",
          apples: 0,
          bananas: 0,
          cucumbers: 0,
          carrots: 0,
          potatoes: 0,
          tomatoes: 0,
        },
        {
          time: "Wed",
          apples: 0,
          bananas: 0,
          cucumbers: 0,
          carrots: 0,
          potatoes: 0,
          tomatoes: 0,
        },
        {
          time: "Thu",
          apples: 0,
          bananas: 0,
          cucumbers: 0,
          carrots: 0,
          potatoes: 0,
          tomatoes: 0,
        },
        {
          time: "Fri",
          apples: 0,
          bananas: 0,
          cucumbers: 0,
          carrots: 0,
          potatoes: 0,
          tomatoes: 0,
        },
        {
          time: "Sat",
          apples: 0,
          bananas: 0,
          cucumbers: 0,
          carrots: 0,
          potatoes: 0,
          tomatoes: 0,
        },
        {
          time: "Sun",
          apples: 0,
          bananas: 0,
          cucumbers: 0,
          carrots: 0,
          potatoes: 0,
          tomatoes: 0,
        },
      ];
    }
    // month (e.g., 1..30)
    return Array.from({ length: 30 }, (_, i) => ({
      time: String(i + 1),
      apples: 0,
      bananas: 0,
      cucumbers: 0,
      carrots: 0,
      potatoes: 0,
      tomatoes: 0,
    }));
  }, [controlled, polled, range]);

  const dark = isDark();
  const axisTick = { fontSize: 10, fill: "currentColor" as const }; // SVG uses currentColor from container
  const gridStroke = dark ? "rgba(75,85,99,0.3)" : "rgba(209,213,219,0.6)"; // gray-600 / gray-300
  const tooltipStyles = {
    contentStyle: {
      background: dark ? "#111827" : "#ffffff", // gray-900 / white
      border: `1px solid ${dark ? "#374151" : "#e5e7eb"}`, // gray-700 / gray-200
      borderRadius: 8,
      color: dark ? "#e5e7eb" : "#111827",
      fontSize: 12,
    },
    labelStyle: { color: dark ? "#e5e7eb" : "#111827", fontSize: 12 },
    itemStyle: { color: dark ? "#d1d5db" : "#374151", fontSize: 12 },
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow h-full flex flex-col text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800">
      <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{t("inventoryTrends")}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            (
            {range === "day"
              ? "throughout the day"
              : range === "week"
              ? "daily over the week"
              : "daily over the month"}
            )
          </p>
        </div>

        {/* Range switcher */}
        <div className="flex items-center gap-1 text-xs">
          {(["day", "week", "month"] as RangeKey[]).map((r) => (
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
        <div className="h-full w-full text-inherit">
          {" "}
          {/* sets currentColor for SVG ticks/legend */}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="time" tick={axisTick} />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={axisTick}
              />
              <Tooltip
                formatter={(value: any) => [`${value}%`, "Stock Level"]}
                {...tooltipStyles}
              />
              <Legend
                wrapperStyle={{ fontSize: "10px", color: "inherit" }}
                formatter={(value) => (
                  <span style={{ color: "inherit" }}>{value}</span>
                )}
              />
              {PRODUCE_KEYS.map(({ key, label, color }) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={t(label.toLowerCase())}
                  stroke={color}
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
