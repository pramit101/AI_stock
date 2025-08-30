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
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-xs">
          {`${value} units`}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-xs">
          {`(${(percent * 100).toFixed(0)}%)`}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow h-full flex flex-col">
      <div className="p-3 border-b">
        <h3 className="text-lg font-medium">Popular Produce</h3>
        <p className="text-xs text-gray-500">By sales volume</p>
      </div>

      <div className="p-2 flex-1 flex flex-col">
        <div className="h-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={topProduceData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                dataKey="value"
                onMouseEnter={onPieEnter}
                paddingAngle={5}
              >
                {topProduceData.map((entry, index) => (
                  <Cell key={`cell-${entry.name}-${index}`} fill={nameToColor[entry.name] || "#999"} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => [`${v} units`, "Sales"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend table (no scroll; always show all items) */}
        <div className="mt-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topProduceData.map((item, index) => (
                <tr
                  key={`${item.name}-${index}`}
                  className="hover:bg-gray-50 cursor-pointer"
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <td className="py-1">
                    <div className="flex items-center">
                      <span
                        className="h-2 w-2 rounded-full mr-2"
                        style={{ backgroundColor: nameToColor[item.name] || "#999" }}
                      />
                      <span className="text-xs font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-1 text-right text-xs">{item.value} units</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
