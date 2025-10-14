// src/components/Dashboard.tsx
import { useState, useEffect} from "react";
import { StockTable } from "./StockTable";
import { StockCharts } from "./StockCharts";
import { TopProduceChart } from "./TopProduceChart";
import { RestockReminder } from "./RestockReminder";
import { Image } from "lucide-react"; // Imported for the placeholder icon

// --- AnnotatedImageDashboard (Uses actual API endpoint) ---
function AnnotatedImageDashboard() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ⬅️ REVERTED: Back to the actual API call
    const fetchImage = async () => {
      try {
        const response = await fetch("/api/latest-annotated-image");
        
        if (!response.ok) {
            // Throw error for bad status codes (404, 500, etc.)
            throw new Error(`API returned status ${response.status}`);
        }
        
        const data = await response.json();
        // Assume data contains the URL directly, e.g., { url: "..." }
        setImageUrl(data.url); 
      } catch (error) {
        // Handle API errors gracefully (e.g., if the server isn't running)
        console.error("Failed to fetch annotated image:", error);
        setImageUrl(null);
      } finally {
        setLoading(false);
      }
    };
    fetchImage();
  }, []);

  return (
    <div className="card rounded-xl shadow-lg p-3 border-2 border-dashed border-blue-400 dark:border-blue-600 flex flex-col h-full">
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center">
        <Image size={16} className="mr-2 text-blue-500" />
        Most Recent Annotated Image
      </h3>

      <div className="flex-1 w-full mt-2 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg min-h-[120px]">
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400 text-xs">Loading image...</p>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Most recent annotated"
            className="rounded-lg w-full h-full object-contain"
          />
        ) : (
          // This message will appear if the API call fails or returns no image
          <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold text-center">
            No image available
          </p>
        )}
      </div>
    </div>
  );
}
// -----------------------------------------------------------

export function Dashboard() {
  const [restockedItems, setRestockedItems] = useState<number[]>([]);

  const handleItemRestocked = (itemId: number) => {
    setRestockedItems((prev) => [...prev, itemId]);
  };

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6">
      {/* Top row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Stock Charts - Fixed Height (h-80) */}
        <div className="lg:col-span-2 card rounded-xl shadow-lg h-80 p-4">
          <StockCharts />
        </div>
        
        {/* RIGHT COLUMN: Now has fixed height (h-80) and uses flex to split the space */}
        <div className="flex flex-col gap-4 h-80"> 
          
          {/* 1. ANNOTATED IMAGE PLACEHOLDER: flex-1 ensures it shares the available height */}
          <div className="flex-1">
            <AnnotatedImageDashboard />
          </div>
                    
          {/* 2. RESTOCK REMINDER: flex-1 ensures it shares the available height and balances the column */}
          <div className="flex-1 card rounded-xl shadow-lg p-4">
            <RestockReminder
             percents={{
              Apples: 0,
              Bananas: 0,
              Cucumbers: 0,
              Carrots: 0,
              Potatoes: 0,
              Tomatoes: 0,
            }}
          />
        </div>
      </div>
    </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card rounded-xl shadow-lg p-4">
          <StockTable onItemRestocked={handleItemRestocked} />
        </div>
        <div className="card rounded-xl shadow-lg h-80 p-4">
          <TopProduceChart />
        </div>
      </div>
    </div>
  );
}
