import { Sidebar } from "../components/Sidebar";
import { useState, useCallback, useRef } from "react";
import { TitleHeader } from "../components/TitleHeader";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Upload() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [UploadFiles, setUploadFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    const newFiles = Array.from(files);
    setUploadFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const filesArray = Array.from(e.target.files);
        handleFiles(filesArray);
      }
    },
    [handleFiles]
  );

  const handleUpload = () => {
    console.log(UploadFiles);
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      handleFiles(files);
    },
    [handleFiles]
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex flex-col flex-1">
        <TitleHeader toggleSidebar={handleCollapse} title="Upload page" />
        <main className="flex flex-col items-center justify-center p-3 h-full ">
          <h2 className="text-2xl font-semibold text-gray-700">
            Upload pictures or video of your produce here.
          </h2>
          <div
            onClick={() => fileRef.current && fileRef.current.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed ${
              isDragging ? "border-purple-500 bg-slate-300" : "border-gray-300"
            } rounded-lg p-6 mt-6 flex flex-col items-center justify-center w-full max-w-4xl h-96 cursor-pointer`}
          >
            <input
              type="file"
              className="mt-4 hidden"
              ref={fileRef}
              multiple
              accept="image/*,video/*"
              onChange={handleInputChange}
            />
            <button
              className="mt-4 px-4 py-2 bg-gray-300 text-white text-5xl rounded hover:bg-blue-700"
              onClick={handleUpload}
            >
              <FontAwesomeIcon icon={faUpload} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
