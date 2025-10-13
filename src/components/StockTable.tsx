import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface StockTableProps {
  onItemRestocked: (itemId: number) => void;
}

type StockItem = { id: number; name: string; percent: number };

export function StockTable({ onItemRestocked }: StockTableProps) {
  const [uploadingForItem, setUploadingForItem] = useState<number | null>(null);
  const [photoUploaded, setPhotoUploaded] = useState<Record<number, boolean>>(
    {}
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setUploadingForItem(null);
      return;
    }
    setTimeout(() => {
      if (uploadingForItem !== null) {
        setPhotoUploaded((prev) => ({ ...prev, [uploadingForItem]: true }));
      }
    }, 800);
  };

  useEffect(() => {
    const onFocus = () => {
      if (!fileInputRef.current) return;
      if (
        uploadingForItem !== null &&
        (!fileInputRef.current.files ||
          fileInputRef.current.files.length === 0) &&
        !photoUploaded[uploadingForItem]
      ) {
        setUploadingForItem(null);
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [uploadingForItem, photoUploaded]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b border-opacity-20 border-gray-300 dark:border-gray-600">
        <h2 className="text-lg font-semibold">{t("mostStockedProduce")}</h2>
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

      <div className="flex-1 overflow-hidden justify-center items-center flex">
        <table className="w-2/3 divide-y divide-opacity-20 divide-gray-300 dark:divide-gray-600">
          <thead className="bg-opacity-50 bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                {t("product")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                {t("stockRemaining")}
              </th>
            </tr>
          </thead>

          <tbody className="card divide-y divide-opacity-20 divide-gray-300 dark:divide-gray-600">
            {stockItems.map((item) => {
              return (
                <tr
                  key={item.id}
                  className="hover:bg-opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Link
                      to={`/inventory/${item.name.toLowerCase()}`}
                      className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 cursor-pointer"
                    >
                      {t(item.name.toLowerCase())}
                    </Link>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm mr-4 font-semibold">
                        {item.percent}%
                      </div>
                      <div className="w-28 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-300 ${getPercentageColor(
                            item.percent
                          )}`}
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
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
