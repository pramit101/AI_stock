// src/components/Dashboard.tsx
import { useState } from "react";
import { StockTable } from "./StockTable";
import { StockCharts } from "./StockCharts";
import { TopProduceChart } from "./TopProduceChart";
import { RestockReminder } from "./RestockReminder";

export function Dashboard() {
  const [restockedItems, setRestockedItems] = useState<number[]>([]);

  const handleItemRestocked = (itemId: number) => {
    setRestockedItems(prev => [...prev, itemId]);
  };

  return (
    <div className="max-w-7xl mx-auto w-full space-y-4">
      {/* Top row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-lg shadow h-80 p-2">
          <StockCharts />
        </div>
        <div className="bg-white rounded-lg shadow h-80 p-2">
          <RestockReminder percents={{
            Apples: 0, Bananas: 0, Cucumbers: 0, Carrots: 0, Potatoes: 0, Tomatoes: 0
          }} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-2">
          <StockTable onItemRestocked={handleItemRestocked} />
        </div>
        <div className="bg-white rounded-lg shadow h-80 p-2">
          <TopProduceChart />
        </div>
      </div>
    </div>
  );
}
