import React from "react";
import { Package } from "lucide-react";

type CurrentStockLevelProps = {
  produceName: string;
  stockLevel: number;
};

export function CurrentStockLevel({ produceName, stockLevel }: CurrentStockLevelProps) {
  const getStatusColor = (level: number) => {
    if (level < 30) return 'bg-red-500';
    if (level < 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = (level: number) => {
    if (level < 30) return 'Low Stock';
    if (level < 60) return 'Medium Stock';
    return 'High Stock';
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow h-full flex flex-col text-gray-900 dark:text-gray-100">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Package size={20} className="text-blue-600 dark:text-blue-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Current Stock Level
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Stock percentage</p>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-center">
        <div className="text-center mb-4">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{produceName}</span>
        </div>

        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-700 dark:text-gray-300">Current Stock</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{stockLevel}%</span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-4 mb-4">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${getStatusColor(stockLevel)}`}
            style={{ width: `${stockLevel}%` }}
          />
        </div>

        <div className="text-center">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            stockLevel < 30 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
            stockLevel < 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
          }`}>
            {getStatusText(stockLevel)}
          </span>
        </div>
      </div>
    </div>
  );
}
