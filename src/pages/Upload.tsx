import { useState, useCallback, useRef } from "react";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

// Allowed magic bytes for image types
const allowedMagicBytes: Record<string, string[]> = {
  jpg: ["ffd8ff"],
  png: ["89504e47"],
  heic: ["00000018", "66747970"], // HEIC/HEIF containers
  webp: ["52494646"], // RIFF
};

// Helper: read first bytes of file
function getFileMagicBytes(file: File, length = 12): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer);
      const hex = Array.from(arr)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      resolve(hex);
    };
    reader.onerror = () => reject("Failed to read file");
    reader.readAsArrayBuffer(file.slice(0, length));
  });
}

// Validate file by magic bytes
async function validateFileMagic(file: File) {
  const magic = await getFileMagicBytes(file, 12);
  return Object.values(allowedMagicBytes).some((bytesArray) =>
    bytesArray.some((b) => magic.startsWith(b))
  );
}

// Inline notification component
const Notification = ({ message }: { message: string }) => {
  return (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded shadow-lg z-50 animate-slide-in">
      {message}
    </div>
  );
};

export default function Upload() {
  const [UploadFiles, setUploadFiles] = useState<File[]>([]);
  const [notification, setNotification] = useState<null | string>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [user] = useAuthState(auth);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<null | "success" | "error">(null);

  // Process selected or dropped files
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const newFiles: File[] = [];

    for (const file of Array.from(files)) {
      const isValid = await validateFileMagic(file);
      if (isValid) {
        newFiles.push(file);
      }
    }

    if (newFiles.length < files.length) {
      setNotification("Some files were rejected. Only JPG, PNG, HEIC, WEBP are accepted.");
      setTimeout(() => setNotification(null), 5000); // hide after 5s
    }

    setUploadFiles((prev) => [...prev, ...newFiles]);
  type ShelfResult = {
    status: string;
    message: string;
    data: Record<string, number>;
    processing_time: number;
    total_items: number;
    timestamp: string;
  };

  const [results, setResults] = useState<ShelfResult>({
    status: "success",
    message: "Shelf analysis completed successfully",
    data: {
      banana: 69,
      apple: 255.0,
      orange: 90.2,
      milk: 15.8,
    },
    processing_time: 2.345,
    total_items: 4,
    timestamp: "2022-01-15T10:30:45.123456",
  });

  async function saveShelfResult(data: typeof results) {
    const newEntry = {
      id: generateId(),
      data: data.data,
      timestamp: data.timestamp,
    };
    // Reference to your document (Firestore will auto-create the collection & doc if needed)
    if (!user) {
      console.error("No user logged in");
      return;
    }
    const docRef = doc(db, "users", user.uid);
    function generateId() {
      return Date.now() + "-" + Math.random().toString(36).substr(2, 9);
    }

    try {
      // Append the new entry
      await updateDoc(docRef, {
        results: arrayUnion(newEntry),
      });

      console.log("Result appended successfully!");
    } catch (err) {
      console.error("Error saving to Firestore:", err);
    }
  }

  const handleFiles = useCallback((files: FileList | File[]) => {
    const newFiles = Array.from(files);
    setUploadFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setUploadStatus(null);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(e.target.files);
    },
    [handleFiles]
  );

  const handleUpload = useCallback(async () => {
    if (UploadFiles.length === 0) return;

    setIsUploading(true);
    setUploadStatus(null);
    saveShelfResult(results);

    const formData = new FormData();
    UploadFiles.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch("http://localhost:3001/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.invalidFiles.length > 0) {
        setNotification(`Some files were rejected by the server: ${result.invalidFiles.join(", ")}`);
        setTimeout(() => setNotification(null), 5000);
      }

      if (result.validFiles.length > 0) {
        setUploadStatus("success");
        setUploadFiles([]); // clear successfully uploaded files
      } else {
        setUploadStatus("error");
      }
    } catch (err) {
      console.error(err);
      setUploadStatus("error");
      setNotification("Upload failed. Please try again.");
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsUploading(false);
    }
  }, [UploadFiles]);

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
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleRemoveFile = useCallback((fileToRemove: File) => {
    setUploadFiles((prev) => prev.filter((file) => file !== fileToRemove));
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
    } else {
      previewContent = (
        <div className="w-full h-40 flex items-center justify-center bg-slate-950 rounded-t-lg text-center text-slate-500">
          Unsupported file
        </div>
      );
    }

    return (
      <div className="file-preview-card group w-48 h-56 relative bg-slate-900 rounded-lg shadow-md overflow-hidden transition-all duration-300 transform hover:scale-105 hover:border-purple-500 border-2 border-transparent">
        {previewContent}
        <div className="p-4">
          <p className="text-sm font-semibold text-slate-200 truncate">{file.name}</p>
          <p className="text-xs text-slate-400">{`${(file.size / 1024 / 1024).toFixed(2)} MB`}</p>
        </div>
        <div className="overlay absolute top-0 left-0 w-full h-full bg-slate-950 bg-opacity-80 flex items-center justify-center">
          <button
            onClick={() => handleRemoveFile(file)}
            className="remove-file-btn p-2 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors duration-200"
          >
            Remove
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex flex-col flex-1">
        {notification && <Notification message={notification} />}
        <main className="flex flex-col items-center justify-center p-3 h-full ">
          <h2 className="text-2xl font-semibold text-gray-700">
            Upload pictures of your produce here.
          </h2>
          <div
            onClick={() => fileRef.current && fileRef.current.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed ${
              isDragging ? "border-purple-500 bg-slate-300" : "border-gray-300"
            } rounded-lg p-6 mt-6 flex flex-col items-center justify-between w-full max-w-4xl h-96 cursor-pointer`}
          >
            <div className="flex-1 flex items-center justify-center">
              <input
                type="file"
                className="mt-4 hidden"
                ref={fileRef}
                multiple
                accept=".jpg,.jpeg,.png,.heic,.webp"
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
                className={`w-full sm:w-auto px-8 py-4 transition-colors duration-300 text-white font-bold rounded-xl shadow-lg flex items-center justify-center space-x-2 ${
                  UploadFiles.length === 0 || isUploading
                    ? "bg-gray-500 shadow-none"
                    : "bg-violet-600 hover:bg-violet-700 shadow-violet-500/30"
                } ${uploadStatus === "success" ? "bg-green-600 hover:bg-green-700 shadow-green-500/30" : ""}`}
              >
                <span id="button-text">
                  {isUploading
                    ? "Uploading..."
                    : uploadStatus === "success"
                    ? "Upload Successful!"
                    : `Upload ${UploadFiles.length} File(s)`}
                </span>
              </button>
            </div>
          </div>

          <div id="file-previews" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8 mt-5">
            {UploadFiles.map((file, index) => (
              <FilePreview key={index} file={file} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
