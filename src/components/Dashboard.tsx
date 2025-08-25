import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { StockTable } from './StockTable';
import { StockCharts } from './StockCharts';
import { TopProduceChart } from './TopProduceChart';
import { RestockReminder } from './RestockReminder';
export function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [restockedItems, setRestockedItems] = useState<number[]>([]);
  const handleItemRestocked = (itemId: number) => {
    setRestockedItems(prev => [...prev, itemId]);
  };
  return <div className="flex h-screen bg-gray-100">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} sidebarCollapsed={sidebarCollapsed} />
        <main className="flex-1 overflow-hidden p-3 md:p-4">
          <div className="max-w-7xl mx-auto h-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 h-1/2">
              <div className="lg:col-span-2">
                <StockCharts />
              </div>
              <div>
                <RestockReminder restockedItems={restockedItems} />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-1/2">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow h-full overflow-hidden">
                  <StockTable onItemRestocked={handleItemRestocked} />
                </div>
              </div>
              <div>
                <TopProduceChart />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>;
}