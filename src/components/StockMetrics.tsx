import React from 'react';
import { PackageIcon, AlertTriangleIcon, TrendingDownIcon, TrendingUpIcon } from 'lucide-react';
export function StockMetrics() {
  const metrics = [{
    title: 'Total Items',
    value: '2,543',
    change: '+5%',
    icon: <PackageIcon size={20} />,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    trend: 'up'
  }, {
    title: 'Low Stock Items',
    value: '28',
    change: '+12%',
    icon: <AlertTriangleIcon size={20} />,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    trend: 'up'
  }, {
    title: 'Out of Stock',
    value: '14',
    change: '-3%',
    icon: <TrendingDownIcon size={20} />,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    trend: 'down'
  }, {
    title: 'Inventory Value',
    value: '$143,245',
    change: '+8%',
    icon: <TrendingUpIcon size={20} />,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    trend: 'up'
  }];
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {metrics.map((metric, index) => <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`${metric.iconBg} p-3 rounded-full ${metric.iconColor}`}>
              {metric.icon}
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">
                {metric.title}
              </h3>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">
                  {metric.value}
                </p>
                <span className={`ml-2 text-sm font-medium ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change}
                </span>
              </div>
            </div>
          </div>
        </div>)}
    </div>;
}