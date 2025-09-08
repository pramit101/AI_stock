// src/pages/Apples.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ArrowLeft } from "lucide-react";
import { SingleProduceChart } from "../components/SingleProduceChart";
import { CurrentStockLevel } from "../components/CurrentStockLevel";
import { RestockActions } from "../components/RestockActions";

export function Apples() {
  const navigate = useNavigate();
  const [stockLevel] = useState(0); // Set to 0 as requested

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/inventory')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Inventory</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-4 mt-4">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Apples</h1>
            <p className="text-gray-600 dark:text-gray-400">Fresh Red Apples - Inventory Management</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid - Left Side: Stock Trends, Current Stock Level, Restock Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stock Information and Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock Trends */}
          <div className="card rounded-xl shadow-lg h-80 p-4">
            <SingleProduceChart
              produceName="Apples"
              produceKey="apples"
              produceColor="#eb4031ff"
            />
          </div>

          {/* Current Stock Level */}
          <div className="card rounded-xl shadow-lg h-80 p-4">
            <CurrentStockLevel
              produceName="Apples"
              stockLevel={stockLevel}
            />
          </div>

          {/* Restock Actions */}
          <div className="card rounded-xl shadow-lg h-80 p-4">
            <RestockActions produceName="Apples" />
          </div>
        </div>

        {/* Right Column - Product Details and Recent Activity */}
        <div className="space-y-6">
          {/* Product Details Card - Same height as Stock Trends */}
          <div className="card rounded-xl shadow-lg h-80 p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Product Details</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Category:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">Fresh Produce</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Variety:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">Red Delicious</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Storage:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">Refrigerated</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Shelf Life:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">2-3 weeks</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">2 hours ago</span>
              </div>
            </div>
          </div>

          {/* Recent Activity Card - Extended height to cover Restock Actions space */}
          <div className="card rounded-xl shadow-lg h-[660px] p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
            
            <div className="h-64 overflow-y-auto">
              {/* Initially blank as requested - no activities yet */}
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Package size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                  <p className="text-xs">Activity shall appear</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
