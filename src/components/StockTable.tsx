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

  const getPercentageColor = (p: number) => (p < 30 ? "bg-red-500" : p < 60 ? "bg-yellow-500" : "bg-green-500");

  const initiateRestock = (id: number) => {
    setUploadingForItem(id);
    // clear previous selection so selecting the same file again works
    if (fileInputRef.current) fileInputRef.current.value = "";
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    // If user canceled dialog (no files), revert to Verify
    if (!files || files.length === 0) {
      setUploadingForItem(null);
      return;
    }
    // Simulate upload/verification, then show Confirm/Cancel
    setTimeout(() => {
      if (uploadingForItem !== null) {
        setPhotoUploaded(prev => ({ ...prev, [uploadingForItem]: true }));
      }
    }, 800);
  };

  // Detect dialog cancel: when focus returns and no file picked, exit "Uploading..."
  useEffect(() => {
    const onFocus = () => {
      if (!fileInputRef.current) return;
      // If we were "uploading" but no file is selected and no photoUploaded flag, treat as cancel
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
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-3 border-b">
        <h2 className="text-lg font-medium">Most Stocked Produce</h2>
        <div className="text-xs text-gray-600">
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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Remaining
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {stockItems.map(item => {
              const isUploading = uploadingForItem === item.id;
              const hasUploadedPhoto = !!photoUploaded[item.id];

              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm mr-3 font-medium">{item.percent}%</div>
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${getPercentageColor(item.percent)}`}
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {!isUploading && !hasUploadedPhoto && (
                        <button
                          onClick={() => initiateRestock(item.id)}
                          className="flex items-center px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          title="Take a photo to verify restock"
                        >
                          <CameraIcon size={14} className="mr-1" />
                          Verify
                        </button>
                      )}

                      {isUploading && !hasUploadedPhoto && (
                        <div className="flex items-center px-2 py-1 text-sm bg-gray-100 rounded">
                          <span className="animate-pulse">Uploading...</span>
                        </div>
                      )}

                      {hasUploadedPhoto && (
                        <>
                          <button
                            onClick={() => completeRestock(item.id)}
                            className="flex items-center px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            <CheckCircleIcon size={14} className="mr-1" />
                            Confirm
                          </button>
                          <button
                            onClick={() => cancelRestock(item.id)}
                            className="flex items-center px-2 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                          >
                            <XCircleIcon size={14} />
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
