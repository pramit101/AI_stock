import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { TitleHeader } from "../components/TitleHeader";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { AlertTriangle } from "lucide-react";

// Define Product type
interface Product {
  name: string;
  category: string;
  stock: number; // percentage of shelf filled
}

// Map product names to real images
const productImages: { [key: string]: string } = {
  Banana:
    "https://images.unsplash.com/photo-1587334206596-c0f9f7dccbe6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjR8fGJhbmFuYXxlbnwwfHwwfHx8MA%3D%3D",
  Apple:
    "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1024&q=80",
  Cucumber:
    "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y3VjdW1iZXJ8ZW58MHx8MHx8fDA%3D",
  Tomato:
    "https://plus.unsplash.com/premium_photo-1726138646616-ec9fb0277048?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8dG9tYXRvZXN8ZW58MHx8MHx8fDA%3D",
  Carrot:
    "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2Fycm90fGVufDB8fDB8fHww",
  Potato:
    "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cG90YXRvfGVufDB8fDB8fHww",
};

export default function Categories() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const handleCollapse = () => setSidebarCollapsed(!sidebarCollapsed);

  const [products] = useState<Product[]>([
    { name: "Banana", category: "Fruits", stock: 65 },
    { name: "Apple", category: "Fruits", stock: 75 },
    { name: "Cucumber", category: "Vegetables", stock: 40 },
    { name: "Tomato", category: "Vegetables", stock: 55 },
    { name: "Carrot", category: "Vegetables", stock: 20 },
    { name: "Potato", category: "Vegetables", stock: 25 },
  ]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleProductClick = (product: Product) => setSelectedProduct(product);
  const handleCloseModal = () => setSelectedProduct(null);

  const pieChartData = products.map((product) => ({
    name: product.name,
    value: product.stock,
  }));

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1", "#d084d0"];

  const lowStockProducts = products.filter((product) => product.stock <= 30);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TitleHeader toggleSidebar={handleCollapse} title="Categories Page" />
        <div className="p-4 overflow-y-auto flex-1 flex gap-6">
          {/* Product cards */}
          <div className="flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p, index) => (
                <button
                  key={index}
                  onClick={() => handleProductClick(p)}
                  className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow"
                  aria-label={`View details for ${p.name}`}
                >
                  <img
                    src={productImages[p.name]}
                    alt={p.name}
                    className="w-full h-auto object-cover rounded-lg mb-2"
                  />
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                </button>
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-80 space-y-6">
            {/* Pie chart */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Product Stock Levels
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      dataKey="value"
                    >
                      {pieChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Low stock alerts */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center mb-4">
                <AlertTriangle className="text-red-500 mr-2" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">
                  Low Stock Alert
                </h3>
              </div>

              {lowStockProducts.length > 0 ? (
                <div className="space-y-3">
                  {lowStockProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-500"
                    >
                      <div className="flex items-center">
                        <img
                          src={productImages[product.name]}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-800">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">{product.stock}%</p>
                        <p className="text-xs text-gray-500">Shelf Level</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">All products are well stocked!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80">
            <img
              src={productImages[selectedProduct.name]}
              alt={selectedProduct.name}
              className="w-full h-40 object-cover rounded-lg mb-4"
            />
            <h2 className="text-xl font-bold mb-2">{selectedProduct.name}</h2>
            <p className="text-sm text-gray-600 mb-2">{selectedProduct.category}</p>
            <p className="text-lg">
              <strong>Stock Level:</strong>{" "}
              <span className="text-purple-600">{selectedProduct.stock}%</span>
            </p>
            <button
              onClick={handleCloseModal}
              className="mt-6 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}