import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

// Define Product type
interface Product {
  name: string;
  category: string;
  stock: number; // percentage of shelf filled
}

// Map product names to real images
const productImages: { [key: string]: string } = {
  Banana:
    "https://images.unsplash.com/photo-1587334206596-c0f9f7dccbe6?w=400&auto=format&fit=crop&q=80",
  Apple:
    "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&auto=format&fit=crop&q=80",
  Cucumber:
    "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&auto=format&fit=crop&q=80",
  Tomatoe:
    "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80",
  Carrot:
    "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&auto=format&fit=crop&q=80",
  Potatoe:
    "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&auto=format&fit=crop&q=80",
};

export default function Inventory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();

  const [products] = useState<Product[]>([
    { name: "Bananas", category: "Fruits", stock: 65 },
    { name: "Apples", category: "Fruits", stock: 75 },
    { name: "Cucumbers", category: "Vegetables", stock: 40 },
    { name: "Tomatoes", category: "Vegetables", stock: 55 },
    { name: "Carrots", category: "Vegetables", stock: 20 },
    { name: "Potatoes", category: "Vegetables", stock: 25 },
  ]);

  const handleProductClick = (product: Product) => {
    // Navigate to the individual product page
    let productRoute = product.name.toLowerCase();
    
    // Handle special plural cases - convert to singular first, then add 's'
    if (product.name === 'Potatoes') {
      productRoute = 'potatoes';
    } else if (product.name === 'Tomatoes') {
      productRoute = 'tomatoes';
    } else if (product.name === 'Bananas') {
      productRoute = 'bananas';
    } else if (product.name === 'Apples') {
      productRoute = 'apples';
    } else if (product.name === 'Cucumbers') {
      productRoute = 'cucumbers';
    } else if (product.name === 'Carrots') {
      productRoute = 'carrots';
    }
    
    navigate(`/inventory/${productRoute}`);
  };


  const filteredList = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="flex mb-10 w-96 ml-7 items-center border border-gray-400 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-800 px-3 py-2">
        <SearchIcon size={16} className="text-gray-500 dark:text-gray-400" />
        <input
          type="text"
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
          placeholder="Search inventory..."
          className="ml-2 bg-transparent border-none focus:outline-none text-sm w-40 md:w-64 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {/* Product cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
        {filteredList.map((p, index) => (
          <button
            key={index}
            onClick={() => handleProductClick(p)}
            className="card rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 flex flex-col justify-between mx-auto hover:scale-105"
            style={{ width: "180px", height: "220px" }}
            aria-label={`View details for ${p.name}`}
          >
            <div className="flex-1 flex items-center justify-center">
              <img
                src={productImages[p.name.slice(0, -1)]}
                alt={p.name}
                className="product-image object-cover rounded-xl shadow-md"
                style={{ width: "140px", height: "140px" }}
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mt-2">
              {t(p.name.toLowerCase())}
            </h3>
          </button>
        ))}
      </div>
    </div>
  );
}
