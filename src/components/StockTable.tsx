import React, { useState, useRef } from 'react';
import { ChevronDownIcon, ChevronUpIcon, FilterIcon, EditIcon, TrashIcon, PlusIcon, CameraIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
interface StockTableProps {
  onItemRestocked: (itemId: number) => void;
}
export function StockTable({
  onItemRestocked
}: StockTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [uploadingForItem, setUploadingForItem] = useState<number | null>(null);
  const [photoUploaded, setPhotoUploaded] = useState<{
    [key: number]: boolean;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Mock data for most stocked produce with max capacity
  const [stockItems, setStockItems] = useState([{
    id: 1,
    name: 'Organic Bananas',
    quantity: 145,
    maxCapacity: 200
  }, {
    id: 2,
    name: 'Gala Apples',
    quantity: 87,
    maxCapacity: 200
  }, {
    id: 3,
    name: 'Fresh Strawberries',
    quantity: 32,
    maxCapacity: 100
  }, {
    id: 4,
    name: 'Hass Avocados',
    quantity: 53,
    maxCapacity: 150
  }, {
    id: 5,
    name: 'Organic Carrots',
    quantity: 78,
    maxCapacity: 150
  }]);
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  const calculatePercentage = (quantity: number, maxCapacity: number) => {
    return quantity / maxCapacity * 100;
  };
  const getPercentageColor = (percentage: number) => {
    if (percentage < 30) return 'bg-red-500';
    if (percentage < 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  const initiateRestock = (id: number) => {
    setUploadingForItem(id);
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Simulate photo verification
      setTimeout(() => {
        if (uploadingForItem !== null) {
          setPhotoUploaded(prev => ({
            ...prev,
            [uploadingForItem]: true
          }));
        }
      }, 1000);
    }
  };
  const completeRestock = (id: number) => {
    setStockItems(items => items.map(item => item.id === id ? {
      ...item,
      quantity: item.maxCapacity
    } : item));
    setPhotoUploaded(prev => ({
      ...prev,
      [id]: false
    }));
    setUploadingForItem(null);
    onItemRestocked(id); // Notify parent component about restock
  };
  const cancelRestock = (id: number) => {
    setPhotoUploaded(prev => ({
      ...prev,
      [id]: false
    }));
    setUploadingForItem(null);
  };
  const sortedItems = [...stockItems].sort((a, b) => {
    if (sortField === 'stockPercentage') {
      const percentA = calculatePercentage(a.quantity, a.maxCapacity);
      const percentB = calculatePercentage(b.quantity, b.maxCapacity);
      return sortDirection === 'asc' ? percentA - percentB : percentB - percentA;
    } else {
      return sortDirection === 'asc' ? String(a[sortField as keyof typeof a]).localeCompare(String(b[sortField as keyof typeof b])) : String(b[sortField as keyof typeof b]).localeCompare(String(a[sortField as keyof typeof a]));
    }
  });
  return <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-3 border-b">
        <h2 className="text-lg font-medium">Most Stocked Produce</h2>
        <div className="flex items-center space-x-2">
          <button className="flex items-center px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">
            <FilterIcon size={16} className="mr-2" />
            Filter
          </button>
          <button className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
            <PlusIcon size={16} className="mr-2" />
            Add Item
          </button>
        </div>
      </div>
      {/* Hidden file input for photo upload */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
      <div className="overflow-y-auto flex-1">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center">
                  Product Name
                  {sortField === 'name' && (sortDirection === 'asc' ? <ChevronUpIcon size={16} className="ml-1" /> : <ChevronDownIcon size={16} className="ml-1" />)}
                </div>
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('stockPercentage')}>
                <div className="flex items-center">
                  Stock Remaining
                  {sortField === 'stockPercentage' && (sortDirection === 'asc' ? <ChevronUpIcon size={16} className="ml-1" /> : <ChevronDownIcon size={16} className="ml-1" />)}
                </div>
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedItems.map(item => {
            const stockPercentage = calculatePercentage(item.quantity, item.maxCapacity);
            const isUploading = uploadingForItem === item.id;
            const hasUploadedPhoto = photoUploaded[item.id];
            return <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm mr-3 font-medium">
                        {stockPercentage.toFixed(0)}%
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${getPercentageColor(stockPercentage)}`} style={{
                      width: `${stockPercentage}%`
                    }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {!isUploading && !hasUploadedPhoto && <button onClick={() => initiateRestock(item.id)} className="flex items-center px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700" title="Take a photo to verify restock">
                          <CameraIcon size={14} className="mr-1" />
                          Verify
                        </button>}
                      {isUploading && !hasUploadedPhoto && <div className="flex items-center px-2 py-1 text-sm bg-gray-100 rounded">
                          <span className="animate-pulse">Uploading...</span>
                        </div>}
                      {hasUploadedPhoto && <>
                          <button onClick={() => completeRestock(item.id)} className="flex items-center px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                            <CheckCircleIcon size={14} className="mr-1" />
                            Confirm
                          </button>
                          <button onClick={() => cancelRestock(item.id)} className="flex items-center px-2 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200">
                            <XCircleIcon size={14} />
                          </button>
                        </>}
                      <button className="text-blue-600 hover:text-blue-900">
                        <EditIcon size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>;
          })}
          </tbody>
        </table>
      </div>
      <div className="px-3 py-2 flex items-center justify-between border-t border-gray-200 mt-auto">
        <div className="hidden sm:block">
          <p className="text-xs text-gray-700">
            Showing <span className="font-medium">5</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} className="relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              <span className="sr-only">Previous</span>
              <ChevronUpIcon className="h-4 w-4 rotate-90" />
            </button>
            <button className="relative inline-flex items-center px-3 py-1 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              1
            </button>
            <button onClick={() => setCurrentPage(currentPage + 1)} className="relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              <span className="sr-only">Next</span>
              <ChevronDownIcon className="h-4 w-4 -rotate-90" />
            </button>
          </nav>
        </div>
      </div>
    </div>;
}