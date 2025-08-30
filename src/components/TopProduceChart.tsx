import React, { useEffect, useMemo, useRef, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts";

type ProduceDatum = { name: string; value: number };
type TopProduceChartProps = {
  data?: ProduceDatum[];
  endpoint?: string;
  intervalMs?: number;
};

const FIXED_COLORS: Record<string, string> = {
  Apples:   "#eb4031ff",
  Bananas:  "#cedd2cff",
  Cucumbers:"#3fa21fff",
  Carrots:  "#ea9a10ff",
  Potatoes: "#4f3ee7ff",
  Tomatoes: "#bb27a7ff",
};

function usePollingData(endpoint?: string, intervalMs = 4000) {
  const [data, setData] = useState<ProduceDatum[] | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!endpoint) return;
    const fetchOnce = async () => {
      try {
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as ProduceDatum[];
        const cleaned = Array.isArray(json)
          ? json.filter(d => d && typeof d.name === "string" && typeof d.value === "number")
          : [];
        setData(cleaned);
      } catch {/* ignore */}
    };
    fetchOnce();
    timerRef.current = window.setInterval(fetchOnce, intervalMs) as unknown as number;
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [endpoint, intervalMs]);

  return data;
}

function isDark() {
  return typeof document !== "undefined" && document.documentElement.classList.contains("dark");
}

export function TopProduceChart({ data, endpoint, intervalMs = 4000 }: TopProduceChartProps) {
  const polled = usePollingData(endpoint, intervalMs);

  const topProduceData = useMemo<ProduceDatum[]>(() => {
    if (data && data.length) return data;
    if (polled && polled.length) return polled;
    // default six fresh produces
    return [
      { name: "Apples", value: 0 },
      { name: "Bananas", value: 0 },
      { name: "Cucumbers", value: 0 },
      { name: "Carrots", value: 0 },
      { name: "Potatoes", value: 0 },
      { name: "Tomatoes", value: 0 },
    ];
  }, [data, polled]);

  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    if (!topProduceData.length) return;
    setActiveIndex(i => Math.min(i, topProduceData.length - 1));
  }, [topProduceData]);

  const nameToColor = FIXED_COLORS; // lock colors to the palette you provided
  const onPieEnter = (_: any, index: number) => setActiveIndex(index);

  const dark = isDark();
  const tooltipStyles = {
    contentStyle: {
      background: dark ? "#3869d3ff" : "#ffffff",
      border: `1px solid ${dark ? "#374151" : "#e5e7eb"}`,
      borderRadius: 8,
      color: dark ? "#e5e7eb" : "#111827",
      fontSize: 12,
    },
    labelStyle: { color: dark ? "#e5e7eb" : "#111827", fontSize: 12 },
    itemStyle: { color: dark ? "#d1d5db" : "#374151", fontSize: 12 },
  };

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";

    const primaryText = dark ? "#e5e7eb" : "#333333";
    const secondaryText = dark ? "#9ca3af" : "#999999";

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-xs font-medium">
          {payload.name}
        </text>
        <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius}
                startAngle={startAngle} endAngle={endAngle} fill={fill} />
        <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle}
                innerRadius={outerRadius + 6} outerRadius={outerRadius + 10} fill={fill} />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill={primaryText} className="text-xs">
          {`${value} units`}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill={secondaryText} className="text-xs">
          {`(${(percent * 100).toFixed(0)}%)`}
        </text>
      </g>
    );
  };

  return (
    <div className="card rounded-xl shadow-lg h-full flex flex-col">
      <div className="p-4 border-b border-opacity-20 border-gray-300 dark:border-gray-600">
        <h3 className="text-lg font-semibold">Popular Produce</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">By sales volume</p>
      </div>

      <div className="p-4 flex-1 flex flex-col min-h-0">
        <div className="h-full text-inherit min-h-0 flex flex-col">
          {/* Chart takes top section with more space */}
          <div className="flex-1 min-h-0 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={topProduceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  paddingAngle={2}
                >
                  {topProduceData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}-${index}`} fill={nameToColor[entry.name] || "#999"} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v} units`, "Sales"]} {...tooltipStyles} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend table below the chart with compact spacing */}
          <div className="flex-shrink-0">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider py-1">Item</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-opacity-20 divide-gray-300 dark:divide-gray-600">
                {topProduceData.map((item, index) => (
                  <tr
                    key={`${item.name}-${index}`}
                    className="hover:bg-opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <td className="py-1">
                      <div className="flex items-center">
                        <span
                          className="h-2.5 w-2.5 rounded-full mr-2 flex-shrink-0"
                          style={{ backgroundColor: nameToColor[item.name] || "#999" }}
                        />
                        <span className="text-xs font-medium truncate">{item.name}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
