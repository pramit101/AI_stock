import React, { useEffect, useRef, useState } from "react";
import { CameraIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";

interface StockTableProps {
  onItemRestocked: (itemId: number) => void;
}

type StockItem = { id: number; name: string; percent: number };

export function StockTable({ onItemRestocked }: StockTableProps) {
  const [uploadingForItem, setUploadingForItem] = useState<number | null>(null);
  const [photoUploaded, setPhotoUploaded] = useState<Record<number, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stockItems, setStockItems] = useState<StockItem[]>([
    { id: 1, name: "Apples", percent: 0 },
    { id: 2, name: "Bananas", percent: 0 },
    { id: 3, name: "Cucumbers", percent: 0 },
    { id: 4, name: "Carrots", percent: 0 },
    { id: 5, name: "Potatoes", percent: 0 },
    { id: 6, name: "Tomatoes", percent: 0 },
  ]);

  const getPercentageColor = (p: number) =>
    p < 30 ? "bg-red-500" : p < 60 ? "bg-yellow-500" : "bg-green-500";

  const initiateRestock = (id: number) => {
    setUploadingForItem(id);
    if (fileInputRef.current) fileInputRef.current.value = "";
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setUploadingForItem(null);
      return;
    }
    setTimeout(() => {
      if (uploadingForItem !== null) {
        setPhotoUploaded(prev => ({ ...prev, [uploadingForItem]: true }));
      }
    }, 800);
  };

  useEffect(() => {
    const onFocus = () => {
      if (!fileInputRef.current) return;
      if (
        uploadingForItem !== null &&
        (!fileInputRef.current.files || fileInputRef.current.files.length === 0) &&
        !photoUploaded[uploadingForItem]
      ) {
        setUploadingForItem(null);
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [uploadingForItem, photoUploaded]);

  const completeRestock = (id: number) => {
    setStockItems(items => items.map(it => (it.id === id ? { ...it, percent: 100 } : it)));
    setPhotoUploaded(prev => ({ ...prev, [id]: false }));
    setUploadingForItem(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onItemRestocked(id);
  };

  const cancelRestock = (id: number) => {
    setPhotoUploaded(prev => ({ ...prev, [id]: false }));
    setUploadingForItem(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col h-full main">
      <div className="flex justify-between items-center p-4 border-b border-opacity-20 border-gray-300 dark:border-gray-600">
        <h2 className="text-lg font-semibold">Most Stocked Produce</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-medium">{stockItems.length}</span> items
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
      />

      <div className="flex-1 overflow-hidden">
        <table className="min-w-full divide-y divide-opacity-20 divide-gray-300 dark:divide-gray-600">
          <thead className="bg-opacity-50 bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Stock Remaining
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="card divide-y divide-opacity-20 divide-gray-300 dark:divide-gray-600">
            {stockItems.map(item => {
              const isUploading = uploadingForItem === item.id;
              const hasUploadedPhoto = !!photoUploaded[item.id];

              return (
                <tr key={item.id} className="hover:bg-opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium main">{item.name}</div>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm mr-4 font-semibold">{item.percent}%</div>
                      <div className="w-28 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-300 ${getPercentageColor(item.percent)}`}
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      {!isUploading && !hasUploadedPhoto && (
                        <button
                          onClick={() => initiateRestock(item.id)}
                          className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm"
                          title="Take a photo to verify restock"
                        >
                          <CameraIcon size={16} className="mr-2" />
                          Verify
                        </button>
                      )}

                      {isUploading && !hasUploadedPhoto && (
                        <div className="flex items-center px-3 py-2 text-sm input rounded-lg">
                          <span className="animate-pulse text-gray-700 dark:text-gray-300">Uploading...</span>
                        </div>
                      )}

                      {hasUploadedPhoto && (
                        <>
                          <button
                            onClick={() => completeRestock(item.id)}
                            className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm"
                          >
                            <CheckCircleIcon size={16} className="mr-2" />
                            Confirm
                          </button>
                          <button
                            onClick={() => cancelRestock(item.id)}
                            className="flex items-center px-3 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200"
                            title="Cancel"
                          >
                            <XCircleIcon size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
