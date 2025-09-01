import React, { useState } from "react";
import { Upload, CheckCircle, Loader2 } from "lucide-react";

type RestockActionsProps = {
  produceName: string;
};

export function RestockActions({ produceName }: RestockActionsProps) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      // Simulate file processing
      setTimeout(() => {
        setUploaded(true);
        setUploading(false);
      }, 2000);
    }
  };

  const handleReset = () => {
    setUploaded(false);
    setUploading(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow h-full flex flex-col text-gray-900 dark:text-gray-100">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Upload size={20} className="text-blue-600 dark:text-blue-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Restock Actions
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Verify restock with file upload</p>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-center">
        {!uploading && !uploaded && (
          <div className="text-center">
            <div className="mb-4">
              <Upload size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload a file to verify restock for {produceName}
              </p>
            </div>
            
            <div className="relative">
              <input
                type="file"
                accept=".csv,.xlsx,.txt,image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200">
                Verify Restock
              </button>
            </div>
          </div>
        )}

        {uploading && (
          <div className="text-center">
            <Loader2 size={48} className="mx-auto text-blue-600 dark:text-blue-400 mb-4 animate-spin" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Processing file...
            </p>
          </div>
        )}

        {uploaded && (
          <div className="text-center">
            <CheckCircle size={48} className="mx-auto text-green-600 dark:text-green-400 mb-4" />
            <p className="text-sm text-green-600 dark:text-green-400 mb-4">
              File uploaded successfully!
            </p>
            <button
              onClick={handleReset}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Upload Another File
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
