import { Sidebar } from "../components/Sidebar";
import { useState, FormEvent, ChangeEvent } from "react";
import { TitleHeader } from "../components/TitleHeader";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

// Product type
interface Product {
  name: string;
  category: string;
  stock: number;
}

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Categories() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const handleCollapse = () => setSidebarCollapsed(!sidebarCollapsed);

  // State for search, filters, products, editing, etc.
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const [products, setProducts] = useState<Product[]>([
    { name: "Banana", category: "Fruits", stock: 65 },
    { name: "Broccoli", category: "Vegetables", stock: 15 },
    { name: "Onion", category: "Vegetables", stock: 90 },
    { name: "Apple", category: "Fruits", stock: 75 },
    { name: "Carrot", category: "Vegetables", stock: 20 },
    { name: "Potato", category: "Vegetables", stock: 25 },
  ]);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  const [newProduct, setNewProduct] = useState<{
    name: string;
    category: string;
    stock: string; // keep as string for input
  }>({ name: "", category: "", stock: "" });

  // Handlers for CRUD
  const handleDelete = (productName: string) => {
    setProducts(products.filter((p) => p.name !== productName));
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setEditedProduct({ ...product });
    setIsAddingNew(false);
  };

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (editingProduct && editedProduct) {
      setProducts(
        products.map((p) =>
          p.name === editingProduct.name ? editedProduct : p
        )
      );
      setEditingProduct(null);
      setEditedProduct(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditedProduct(null);
  };

  const handleAddNewProduct = (e: FormEvent) => {
    e.preventDefault();
    if (newProduct.name && newProduct.category && newProduct.stock) {
      setProducts([
        ...products,
        { ...newProduct, stock: parseInt(newProduct.stock, 10) },
      ]);
      setNewProduct({ name: "", category: "", stock: "" });
      setIsAddingNew(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Pie chart data
  const stockData = {
    labels: products.map((p) => p.name),
    datasets: [
      {
        label: "Stock Levels",
        data: products.map((p) => p.stock),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#6699FF",
        ],
        hoverOffset: 4,
      },
    ],
  };

  // Low stock reminders
  const lowStockReminders = products.filter((p) => p.stock < 30);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <TitleHeader toggleSidebar={handleCollapse} title="Categories page" />

        {/* Content Area */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Add New Product Button */}
          <div className="mb-4">
            <button
              onClick={() => setIsAddingNew(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-purple-700 transition-colors"
            >
              Add New Product
            </button>
          </div>

          {/* New Product Form */}
          {isAddingNew && (
            <div className="mb-4 bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Add New Product</h3>
              <form
                onSubmit={handleAddNewProduct}
                className="flex flex-col md:flex-row md:space-x-4"
              >
                <input
                  type="text"
                  placeholder="Product Name"
                  value={newProduct.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="border p-2 rounded mb-2 md:mb-0 flex-1"
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={newProduct.category}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setNewProduct({ ...newProduct, category: e.target.value })
                  }
                  className="border p-2 rounded mb-2 md:mb-0 flex-1"
                />
                <input
                  type="number"
                  placeholder="Stock (%)"
                  value={newProduct.stock}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setNewProduct({ ...newProduct, stock: e.target.value })
                  }
                  className="border p-2 rounded mb-2 md:mb-0 flex-1"
                />
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </form>
            </div>
          )}

          {/* Edit Form */}
          {editingProduct && editedProduct && (
            <div className="mb-4 bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">
                Edit Product: {editingProduct.name}
              </h3>
              <form
                onSubmit={handleSaveEdit}
                className="flex flex-col md:flex-row md:space-x-4"
              >
                <input
                  type="text"
                  placeholder="Product Name"
                  value={editedProduct.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEditedProduct({ ...editedProduct, name: e.target.value })
                  }
                  className="border p-2 rounded mb-2 md:mb-0 flex-1"
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={editedProduct.category}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEditedProduct({
                      ...editedProduct,
                      category: e.target.value,
                    })
                  }
                  className="border p-2 rounded mb-2 md:mb-0 flex-1"
                />
                <input
                  type="number"
                  placeholder="Stock (%)"
                  value={editedProduct.stock}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEditedProduct({
                      ...editedProduct,
                      stock: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="border p-2 rounded mb-2 md:mb-0 flex-1"
                />
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </form>
            </div>
          )}

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search product..."
              className="border p-2 rounded mb-2 md:mb-0 flex-1"
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
            />

            {/* Category Filter */}
            <select
              className="border p-2 rounded flex-1"
              value={categoryFilter}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setCategoryFilter(e.target.value)
              }
            >
              <option value="All">All Categories</option>
              <option value="Fruits">Fruits</option>
              <option value="Vegetables">Vegetables</option>
            </select>
          </div>

          {/* Product Table */}
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full bg-white border border-gray-300 rounded">
              <thead>
                <tr>
                  <th className="border-b p-2 text-left">Product Name</th>
                  <th className="border-b p-2 text-left">Category</th>
                  <th className="border-b p-2 text-left">Stock Level</th>
                  <th className="border-b p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border-b p-2">{p.name}</td>
                      <td className="border-b p-2">{p.category}</td>
                      <td className="border-b p-2">{p.stock}%</td>
                      <td className="border-b p-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.name)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-2 text-center">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Charts & Reminders */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Pie Chart */}
            <div className="bg-white p-4 rounded shadow flex-1 md:w-1/2">
              <h3 className="text-lg font-semibold mb-2">
                Stock Distribution
              </h3>
              <div className="w-full h-80">
                <Pie data={stockData} />
              </div>
            </div>

            {/* Low Stock Reminders */}
            {lowStockReminders.length > 0 && (
              <div className="bg-yellow-100 p-4 rounded shadow flex-1 md:w-1/2">
                <h4 className="font-semibold mb-2">Reminders</h4>
                <ul className="list-disc list-inside">
                  {lowStockReminders.map((p, index) => (
                    <li key={index}>
                      {p.name} stock is low! ({p.stock}% units)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
