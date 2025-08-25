import React from 'react';
import { AlertCircleIcon, CameraIcon } from 'lucide-react';
interface RestockReminderProps {
  restockedItems: number[];
}
export function RestockReminder({
  restockedItems
}: RestockReminderProps) {
  // Mock data for restock reminders
  const restockItems = [{
    id: 3,
    name: 'Fresh Strawberries',
    currentStock: 32,
    maxCapacity: 100,
    restockThreshold: 40
  }, {
    id: 4,
    name: 'Hass Avocados',
    currentStock: 53,
    maxCapacity: 150,
    restockThreshold: 60
  }, {
    id: 1,
    name: 'Organic Bananas',
    currentStock: 145,
    maxCapacity: 200,
    restockThreshold: 50
  }, {
    id: 2,
    name: 'Gala Apples',
    currentStock: 87,
    maxCapacity: 200,
    restockThreshold: 40
  }, {
    id: 5,
    name: 'Organic Carrots',
    currentStock: 78,
    maxCapacity: 150,
    restockThreshold: 60
  }];
  // Find the most urgent item (lowest percentage of stock)
  const getMostUrgentItem = () => {
    // Filter out restocked items
    const availableItems = restockItems.filter(item => !restockedItems.includes(item.id));
    // If all items have been restocked, show the first item at 100%
    if (availableItems.length === 0) {
      return {
        ...restockItems[0],
        currentStock: restockItems[0].maxCapacity // Set to max capacity (100%)
      };
    }
    return [...availableItems].sort((a, b) => {
      const percentA = a.currentStock / a.maxCapacity * 100;
      const percentB = b.currentStock / b.maxCapacity * 100;
      return percentA - percentB;
    })[0];
  };
  const mostUrgentItem = getMostUrgentItem();
  const isRestocked = restockedItems.includes(mostUrgentItem.id);
  const stockPercentage = isRestocked ? 100 : mostUrgentItem.currentStock / mostUrgentItem.maxCapacity * 100;
  return <div className="bg-white rounded-lg shadow h-full flex flex-col">
      <div className="p-3 border-b bg-red-50">
        <div className="flex items-center">
          <AlertCircleIcon size={20} className="text-red-600 mr-2" />
          <h3 className="text-lg font-medium text-red-700">
            Urgent Restock Required
          </h3>
        </div>
        <p className="text-sm text-red-600">
          The following item needs immediate attention
        </p>
      </div>
      <div className="p-4 flex flex-col items-center justify-center flex-1">
        <div className="w-full">
          <div className="text-center mb-2">
            <span className="text-xl font-bold text-gray-900">
              {mostUrgentItem.name}
            </span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Current Stock</span>
            <span className="font-medium">
              {stockPercentage.toFixed(0)}% remaining
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div className={`h-4 rounded-full ${isRestocked ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} style={{
            width: `${stockPercentage}%`
          }}></div>
          </div>
          <div className="text-center">
            {!isRestocked ? <>
                <div className="text-sm text-gray-500 mb-3">
                  <strong className="text-red-600">Critical level:</strong> Only{' '}
                  {mostUrgentItem.currentStock} of {mostUrgentItem.maxCapacity}{' '}
                  units remaining
                </div>
                <div className="p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50 mb-3">
                  <div className="flex flex-col items-center">
                    <CameraIcon size={36} className="text-gray-400 mb-2" />
                    <p className="text-center text-xs text-gray-600">
                      To restock this item, please take a photo of the fully
                      stocked shelf using the verify button
                    </p>
                  </div>
                </div>
              </> : <div className="text-sm text-green-600 font-medium mb-3">
                ✓ This item has been successfully restocked to 100%
              </div>}
            <div className="text-xs text-gray-500 italic">
              Last checked: Today at 11:23 AM
            </div>
          </div>
        </div>
      </div>
    </div>;
}