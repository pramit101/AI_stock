// src/pages/Report.tsx

import { useState } from "react";
import {
  Package,
  FileText,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// Define Product type
interface Product {
  name: string;
  category: string;
  stock: number; // percentage of shelf filled
}

// Map product names to real images
const productImages: { [key: string]: string } = {
  Banana: "https://images.unsplash.com/photo-1587334206596-c0f9f7dccbe6?w=600&auto=format&fit=crop&q=60",
  Apple: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce",
  Cucumber: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&auto=format&fit=crop&q=60",
  Tomato: "https://plus.unsplash.com/premium_photo-1726138646616-ec9fb0277048",
  Carrot: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37",
  Potato: "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
};

export default function Report() {
  const [products] = useState<Product[]>([
    { name: "Banana", category: "Fruits", stock: 65 },
    { name: "Apple", category: "Fruits", stock: 75 },
    { name: "Cucumber", category: "Vegetables", stock: 40 },
    { name: "Tomato", category: "Vegetables", stock: 55 },
    { name: "Carrot", category: "Vegetables", stock: 20 },
    { name: "Potato", category: "Vegetables", stock: 25 },
  ]);

  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const totalProducts = products.length;
  const averageStock = Math.round(
    products.reduce((sum, p) => sum + p.stock, 0) / totalProducts
  );
  const lowStockProducts = products.filter((p) => p.stock <= 30);

  const handleReportClick = (report: string) => {
    setSelectedReport(report);
  };

  const handleCloseModal = () => {
    setSelectedReport(null);
  };

  // Generate single product report
  const generateProductReport = (product: Product) => {
    const status =
      product.stock <= 30
        ? "Critical"
        : product.stock <= 50
        ? "Low"
        : product.stock <= 70
        ? "Moderate"
        : "Good";
    const statusColor =
      product.stock <= 30
        ? "text-red-600"
        : product.stock <= 50
        ? "text-orange-600"
        : product.stock <= 70
        ? "text-yellow-600"
        : "text-green-600";

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <img
            src={productImages[product.name]}
            alt={product.name}
            className="w-20 h-20 rounded-lg object-cover"
          />
          <div>
            <h3 className="text-2xl font-bold">{product.name}</h3>
            <p className="text-gray-600">{product.category}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Current Stock</p>
            <p className="text-2xl font-bold text-purple-600">
              {product.stock}%
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Status</p>
            <p className={`text-lg font-semibold ${statusColor}`}>{status}</p>
          </div>
        </div>
      </div>
    );
  };

  // Generate overview report
  const generateOverviewReport = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-center mb-4">
        Fresh Produce Overview
      </h3>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <Package className="mx-auto mb-2 text-blue-600" size={24} />
          <p className="text-sm text-gray-600">Total Products</p>
          <p className="text-xl font-bold text-blue-600">{totalProducts}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <TrendingUp className="mx-auto mb-2 text-green-600" size={24} />
          <p className="text-sm text-gray-600">Average Stock</p>
          <p className="text-xl font-bold text-green-600">{averageStock}%</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <TrendingDown className="mx-auto mb-2 text-red-600" size={24} />
          <p className="text-sm text-gray-600">Low Stock Items</p>
          <p className="text-xl font-bold text-red-600">
            {lowStockProducts.length}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {products.map((p) => (
          <button
            key={p.name}
            onClick={() => handleReportClick(p.name)}
            className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow"
          >
            <img
              src={productImages[p.name]}
              alt={p.name}
              className="w-full h-auto object-cover rounded-lg mb-2"
            />
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <p className="text-sm text-gray-600">Stock: {p.stock}%</p>
          </button>
        ))}
        <button
          onClick={() => handleReportClick("Overview")}
          className="bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-center mb-2">
            <FileText size={60} />
          </div>
          <h3 className="text-lg font-semibold">Overview</h3>
          <p className="text-sm opacity-90">Complete Report</p>
        </button>
      </div>

      {/* Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {selectedReport === "Overview"
                    ? "Fresh Produce Overview"
                    : `${selectedReport} Report`}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div>
                {selectedReport === "Overview"
                  ? generateOverviewReport()
                  : generateProductReport(
                      products.find((p) => p.name === selectedReport)!
                    )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Close Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
