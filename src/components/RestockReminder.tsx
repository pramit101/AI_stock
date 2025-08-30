import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircleIcon } from "lucide-react";

type PercentMap = Record<string, number>;

type RestockReminderProps = {
  /** Controlled AI input: { Apples: 0.32 | 32, Bananas: 0.78 | 78, ... } */
  percents?: PercentMap;
  /** Optional: poll an endpoint that returns the same shape as `percents` */
  endpoint?: string;
  /** Poll interval (ms) used only when `endpoint` is provided */
  intervalMs?: number;
  /** Optional: label to show under the title (e.g., "From AI analysis") */
  subtitle?: string;
};

function normalizePercent(v: number): number {
  if (typeof v !== "number" || Number.isNaN(v)) return 0;
  const n = v <= 1 ? v * 100 : v;              // accept 0–1 or 0–100
  return Math.max(0, Math.min(100, Math.round(n)));
}

function usePolledPercents(endpoint?: string, intervalMs = 5000) {
  const [data, setData] = useState<PercentMap | null>(null);
  const timerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!endpoint) return;

    const fetchOnce = async () => {
      try {
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        const res = await fetch(endpoint, { signal: abortRef.current.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as PercentMap;
        setData(json ?? {});
      } catch {
        // ignore errors to keep polling
      }
    };

    fetchOnce();
    timerRef.current = window.setInterval(fetchOnce, intervalMs) as unknown as number;
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      abortRef.current?.abort();
    };
  }, [endpoint, intervalMs]);

  return data;
}

export function RestockReminder({
  percents,
  endpoint,
  intervalMs = 5000,
  subtitle = "Lowest stock item",
}: RestockReminderProps) {
  const polled = usePolledPercents(endpoint, intervalMs);

  // Source of truth: controlled > polled > fallback zeros for six standard items
  const percentMap = useMemo<PercentMap>(() => {
    if (percents && Object.keys(percents).length) return percents;
    if (polled && Object.keys(polled).length) return polled;
    // fallback so the card renders before AI connects
    return {
      Apples: 0,
      Bananas: 0,
      Cucumbers: 0,
      Carrots: 0,
      Potatoes: 0,
      Tomatoes: 0,
    };
  }, [percents, polled]);

  // Find the lowest percentage item
  const lowest = useMemo(() => {
    const entries = Object.entries(percentMap).map(([name, v]) => ({
      name,
      percent: normalizePercent(v),
    }));
    if (!entries.length) return null;
    entries.sort((a, b) => a.percent - b.percent);
    return entries[0];
  }, [percentMap]);

  if (!lowest) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-center text-sm text-gray-500">
        No items to display
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow h-full flex flex-col">
      <div className="p-3 border-b bg-red-50">
        <div className="flex items-center">
          <AlertCircleIcon size={20} className="text-red-600 mr-2" />
          <h3 className="text-lg font-medium text-red-700">
            Urgent Restock Required
          </h3>
        </div>
        <p className="text-xs text-red-600">{subtitle}</p>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-center">
        <div className="text-center mb-2">
          <span className="text-xl font-bold text-gray-900">{lowest.name}</span>
        </div>

        <div className="flex justify-between text-sm mb-1">
          <span>Current Stock</span>
          <span className="font-medium">{lowest.percent}%</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div
            className="h-4 rounded-full bg-red-500"
            style={{ width: `${lowest.percent}%` }}
          />
        </div>

        <div className="text-xs text-gray-500 text-center">
          This item needs to be stocked.
        </div>
      </div>
    </div>
  );
}
