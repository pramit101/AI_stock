// src/components/Dashboard.tsx
import { useState } from "react";
import { StockTable } from "./StockTable";
import { StockCharts } from "./StockCharts";
import { TopProduceChart } from "./TopProduceChart";
import { RestockReminder } from "./RestockReminder";

export function Dashboard() {
  const [restockedItems, setRestockedItems] = useState<number[]>([]);

  const handleItemRestocked = (itemId: number) => {
    setRestockedItems((prev) => [...prev, itemId]);
  };

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6">
      {/* Top row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card rounded-xl shadow-lg h-80 p-4">
          <StockCharts />
        </div>
        <div className="card rounded-xl shadow-lg h-80 p-4">
          <RestockReminder
            percents={{
              Apples: 0,
              Bananas: 0,
              Cucumbers: 0,
              Carrots: 0,
              Potatoes: 0,
              Tomatoes: 0,
            }}
          />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card rounded-xl shadow-lg p-4">
          <StockTable onItemRestocked={handleItemRestocked} />
        </div>
        <div className="card rounded-xl shadow-lg h-80 p-4">
          <TopProduceChart />
        </div>
      </div>
    </div>
  );
}
