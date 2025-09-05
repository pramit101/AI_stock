import { useState, useCallback, useRef } from "react";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Upload() {
  const [UploadFiles, setUploadFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<null | "success" | "error">(
    null
  );

  const handleFiles = useCallback((files: FileList | File[]) => {
    const newFiles = Array.from(files);
    setUploadFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setUploadStatus(null);
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

  const handleUpload = useCallback(() => {
    setIsUploading(true);
    setUploadStatus(null);

    // Simulate an API call
    setTimeout(() => {
      setIsUploading(false);
      setUploadStatus("success");
      setUploadFiles([]);
    }, 3000);
  }, []);

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

  const handleRemoveFile = useCallback((fileToRemove: File) => {
    setUploadFiles((prevFiles) =>
      prevFiles.filter((file) => file !== fileToRemove)
    );
  }, []);

  const FilePreview = ({ file }: { file: File }) => {
    let previewContent = null;
    if (file.type.startsWith("image/")) {
      previewContent = (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="w-full h-40 object-cover rounded-t-lg"
        />
      );
    } else if (file.type.startsWith("video/")) {
      previewContent = (
        <video
          src={URL.createObjectURL(file)}
          className="w-full h-40 object-cover rounded-t-lg"
          muted
          playsInline
        />
      );
    } else {
      previewContent = (
        <div className="w-full h-40 flex items-center justify-center bg-slate-950 rounded-t-lg text-center text-slate-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-file-x"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <path d="m14 2-.5 5.5h5.5" />
            <path d="m10 10 4 4" />
            <path d="m14 10-4 4" />
          </svg>
        </div>
      );
    }

    return (
      <div className="file-preview-card group w-48 h-56 relative bg-slate-900 rounded-lg shadow-md overflow-hidden transition-all duration-300 transform hover:scale-105 hover:border-purple-500 border-2 border-transparent">
        {previewContent}
        <div className="p-4">
          <p className="text-sm font-semibold text-slate-200 truncate">
            {file.name}
          </p>
          <p className="text-xs text-slate-400">{`${(
            file.size /
            1024 /
            1024
          ).toFixed(2)} MB`}</p>
        </div>
        <div className="overlay absolute top-0 left-0 w-full h-full bg-slate-950 bg-opacity-80 flex items-center justify-center">
          <button
            onClick={() => handleRemoveFile(file)}
            className="remove-file-btn p-2 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-trash-2"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" x2="10" y1="11" y2="17" />
              <line x1="14" x2="14" y1="11" y2="17" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex flex-col flex-1">
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
            } rounded-lg p-6 mt-6 flex flex-col items-center justify-between w-full  max-w-4xl h-96 cursor-pointer`}
          >
            <div className="flex-1 flex items-center justify-center">
              <input
                type="file"
                className="mt-4 hidden"
                ref={fileRef}
                multiple
                accept="image/*,video/*"
                onChange={handleInputChange}
              />

              <button className="mt-4 px-4 py-2 bg-gray-300 text-white text-5xl rounded hover:bg-blue-700">
                <FontAwesomeIcon icon={faUpload} />
              </button>
            </div>
            <div className="flex justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload();
                }}
                disabled={UploadFiles.length === 0 || isUploading}
                className={`w-full sm:w-auto px-8 py-4 transition-colors duration-300 text-white font-bold rounded-xl shadow-lg flex items-center justify-center space-x-2 
                            ${
                              UploadFiles.length === 0 || isUploading
                                ? "bg-gray-500 shadow-none"
                                : "bg-violet-600 hover:bg-violet-700 shadow-violet-500/30"
                            }
                            ${
                              uploadStatus === "success"
                                ? "bg-green-600 hover:bg-green-700 shadow-green-500/30"
                                : ""
                            }
                        `}
              >
                <span id="button-text">
                  {isUploading
                    ? "Uploading..."
                    : uploadStatus === "success"
                    ? "Upload Successful!"
                    : `Upload ${UploadFiles.length} File(s)`}
                </span>
                <svg
                  id="spinner"
                  className={`animate-spin h-5 w-5 text-white ${
                    isUploading ? "" : "hidden"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          <div
            id="file-previews"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8 mt-5"
          >
            {UploadFiles.map((file, index) => (
              <FilePreview key={index} file={file} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
