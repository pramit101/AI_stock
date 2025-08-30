// src/pages/Inventory.tsx
import React from "react";
import { Link } from "react-router-dom";
import { 
  Apple, 
  Banana, 
  Carrot, 
  Circle, 
  CircleDot, 
  CircleEllipsis,
  TrendingUp,
  AlertTriangle,
  Package
} from "lucide-react";

interface ProduceItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  stockLevel: number;
  status: 'low' | 'medium' | 'high';
  lastUpdated: string;
  color: string;
}

const produceItems: ProduceItem[] = [
  {
    id: 'apples',
    name: 'Apples',
    icon: <Apple size={32} className="text-red-500" />,
    stockLevel: 25,
    status: 'low',
    lastUpdated: '2 hours ago',
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'bananas',
    name: 'Bananas',
    icon: <Banana size={32} className="text-yellow-500" />,
    stockLevel: 65,
    status: 'medium',
    lastUpdated: '1 hour ago',
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    id: 'cucumbers',
    name: 'Cucumbers',
    icon: <Circle size={32} className="text-green-500" />,
    stockLevel: 80,
    status: 'high',
    lastUpdated: '30 minutes ago',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'carrots',
    name: 'Carrots',
    icon: <Carrot size={32} className="text-orange-500" />,
    stockLevel: 45,
    status: 'medium',
    lastUpdated: '3 hours ago',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'potatoes',
    name: 'Potatoes',
    icon: <CircleDot size={32} className="text-amber-600" />,
    stockLevel: 90,
    status: 'high',
    lastUpdated: '4 hours ago',
    color: 'from-amber-500 to-amber-600'
  },
  {
    id: 'tomatoes',
    name: 'Tomatoes',
    icon: <CircleEllipsis size={32} className="text-red-600" />,
    stockLevel: 15,
    status: 'low',
    lastUpdated: '1 hour ago',
    color: 'from-red-600 to-red-700'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'low':
      return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    case 'high':
      return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'low':
      return <AlertTriangle size={16} className="text-red-600" />;
    case 'medium':
      return <TrendingUp size={16} className="text-yellow-600" />;
    case 'high':
      return <Package size={16} className="text-green-600" />;
    default:
      return <Package size={16} className="text-gray-600" />;
  }
};

export function Inventory() {
  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Inventory Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and manage your fresh produce stock levels
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{produceItems.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Package size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Stock Items</p>
              <p className="text-2xl font-bold text-red-600">
                {produceItems.filter(item => item.status === 'low').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="card rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Stock Level</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {Math.round(produceItems.reduce((acc, item) => acc + item.stockLevel, 0) / produceItems.length)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Produce Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produceItems.map((item) => (
          <Link
            key={item.id}
            to={`/inventory/${item.id}`}
            className="card rounded-xl p-6 hover:shadow-lg transition-all duration-200 group hover:scale-[1.02]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-md`}>
                {item.icon}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(item.status)}`}>
                {getStatusIcon(item.status)}
                <span className="capitalize">{item.status}</span>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 transition-colors">
              {item.name}
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Stock Level</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{item.stockLevel}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      item.status === 'low' ? 'bg-red-500' : 
                      item.status === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${item.stockLevel}%` }}
                  />
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                Last updated: {item.lastUpdated}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">View Details</span>
                <div className="w-5 h-5 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <svg className="w-3 h-3 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
