import { useState, useCallback, useRef, useEffect } from "react";
import { faUpload, faVideo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useTranslation } from "react-i18next";
import JSMpeg from "@cycjimmy/jsmpeg-player";

const allowedMagicBytes: Record<string, string[]> = {
  jpg: ["ffd8ff"],
  png: ["89504e47"],
  heic: ["00000018", "66747970"],
  webp: ["52494646"],
};

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

async function validateFileMagic(file: File) {
  const magic = await getFileMagicBytes(file, 12);
  return Object.values(allowedMagicBytes).some((bytesArray) =>
    bytesArray.some((b) => magic.startsWith(b))
  );
}

const Notification = ({ message }: { message: string }) => (
  <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded shadow-lg z-50 animate-slide-in">
    {message}
  </div>
);

export default function Upload() {
  const [UploadFiles, setUploadFiles] = useState<File[]>([]);
  const [notification, setNotification] = useState<null | string>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [user] = useAuthState(auth);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { t } = useTranslation();
  const [uploadStatus, setUploadStatus] = useState<null | "success" | "error">(
    null
  );

  // NEW: toggle between upload and CCTV mode
  const [mode, setMode] = useState<"upload" | "cctv">("upload");

  // CCTV stream and capture setup
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerRef = useRef<any>(null);
  const snapshotIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasFrameRef = useRef(false);

  // Handle files (from manual upload or snapshots)
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const validFiles: File[] = [];
    for (const file of Array.from(files)) {
      const isValid = await validateFileMagic(file);
      if (isValid) validFiles.push(file);
    }
    if (validFiles.length < files.length) {
      setNotification(
        "Some files were rejected. Only JPG, PNG, HEIC, WEBP are accepted."
      );
      setTimeout(() => setNotification(null), 5000);
    }
    setUploadFiles((prev) => [...prev, ...validFiles]);
    setUploadStatus(null);
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
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  // Capture snapshot from canvas
  const captureSnapshot = useCallback(() => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob(
      (blob) => {
        if (blob && blob.size > 0) {
          const file = new File([blob], `snapshot-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          setUploadFiles((prev) => [...prev, file]);
          console.log("📸 Snapshot captured and added", file.size);
        } else {
          console.log("⚠ Snapshot blob is empty");
        }
      },
      "image/jpeg",
      0.95
    );
  }, []);

  useEffect(() => {
    if (mode !== "cctv") {
      // Clean up when leaving CCTV mode
      if (snapshotIntervalRef.current) {
        clearInterval(snapshotIntervalRef.current);
        snapshotIntervalRef.current = null;
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (error) {
          console.error("Error destroying player:", error);
        }
      }
      return;
    }

    // Start player
    if (canvasRef.current && !playerRef.current) {
      console.log("Connecting to ws://localhost:9999");

      playerRef.current = new (JSMpeg.Player as any)("ws://localhost:9999", {
        canvas: canvasRef.current,
        autoplay: true,
        audio: false,
        loop: true,
        disableGl: true, // keeps CPU rendering
      });

      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      // 🔍 Wait for the first non-black frame
      const waitForFrame = setInterval(() => {
        const frame = ctx.getImageData(0, 0, 10, 10).data; // sample top-left corner
        const sum = frame.reduce((acc, val) => acc + val, 0);

        if (sum > 0) {
          console.log("🎥 First frame detected — starting snapshots...");
          clearInterval(waitForFrame);

          snapshotIntervalRef.current = setInterval(() => {
            captureSnapshot();
          }, 10000);
        }
      }, 500);
    }

    return () => {
      if (snapshotIntervalRef.current) {
        clearInterval(snapshotIntervalRef.current);
        snapshotIntervalRef.current = null;
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (error) {
          console.error("Error destroying player:", error);
        }
      }
    };
  }, [mode, captureSnapshot]);

  // Dummy data for your Firestore save
  const results = {
    status: "success",
    message: "Shelf analysis completed successfully",
    data: { banana: 69, apple: 255.0, orange: 90.2, milk: 15.8 },
    processing_time: 2.345,
    total_items: 4,
    timestamp: new Date().toISOString(),
  };

  async function saveShelfResult(data: typeof results) {
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    const newEntry = {
      id: Date.now() + "-" + Math.random().toString(36).substr(2, 9),
      data: data.data,
      timestamp: data.timestamp,
    };
    await updateDoc(docRef, { results: arrayUnion(newEntry) });
  }

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(e.target.files);
    },
    [handleFiles]
  );

  const handleUpload = useCallback(() => {
    if (UploadFiles.length === 0) return;
    setIsUploading(true);
    saveShelfResult(results);
    setTimeout(() => {
      setIsUploading(false);
      setUploadStatus("success");
      setUploadFiles([]);
    }, 3000);
  }, [UploadFiles]);

  const handleRemoveFile = (fileToRemove: File) => {
    setUploadFiles((prev) => prev.filter((file) => file !== fileToRemove));
  };

  const FilePreview = ({ file }: { file: File }) => (
    <div className="file-preview-card group w-48 h-56 relative card rounded-lg shadow-md overflow-hidden transition-all duration-300 transform hover:scale-105 hover:border-purple-500 border-2 border-transparent">
      <img
        src={URL.createObjectURL(file)}
        alt={file.name}
        className="w-full h-40 object-cover rounded-t-lg"
      />
      <div className="p-4">
        <p className="text-sm font-semibold truncate">{file.name}</p>
        <p className="text-xs text-gray-500">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={() => handleRemoveFile(file)}
          className="p-2 bg-red-600 rounded-full text-white"
        >
          Remove
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center p-4">
      {notification && <Notification message={notification} />}
      <h2 className="text-2xl font-semibold main pb-10">
        {t("uploadProducePrompt")}
      </h2>

      {/* 🔘 Toggle buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setMode("upload")}
          className={`px-6 py-2 rounded-lg font-semibold ${
            mode === "upload"
              ? "bg-violet-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          }`}
        >
          <FontAwesomeIcon icon={faUpload} className="mr-2" />
          Upload Images
        </button>
        <button
          onClick={() => setMode("cctv")}
          className={`px-6 py-2 rounded-lg font-semibold ${
            mode === "cctv"
              ? "bg-violet-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          }`}
        >
          <FontAwesomeIcon icon={faVideo} className="mr-2" />
          Use CCTV Footage
        </button>
      </div>

      {mode === "upload" ? (
        <>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed ${
              isDragging
                ? "border-purple-500 bg-purple-100 dark:bg-purple-900/20"
                : "border-gray-300 dark:border-gray-600"
            } rounded-lg p-6 mt-6 flex flex-col items-center justify-around w-1/2 max-w-4xl  cursor-pointer card`}
          >
            <input
              type="file"
              className="hidden"
              ref={fileRef}
              multiple
              accept=".jpg,.jpeg,.png,.heic,.webp"
              onChange={handleInputChange}
            />
            <FontAwesomeIcon
              icon={faUpload}
              className="text-5xl mb-3 text-gray-600"
            />
            <p className="text-gray-700">Click or drag files to upload</p>
          </div>
        </>
      ) : (
        <>
          {/* CCTV Live Stream */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              style={{
                width: "100%",
                maxWidth: "800px",
                height: "auto",
                border: "2px solid #333",
                borderRadius: "8px",
                backgroundColor: "#000",
              }}
            />
            <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm font-semibold">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              LIVE
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Snapshots captured automatically every 10 seconds
          </p>
        </>
      )}

      {/* Previews */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {UploadFiles.map((file, i) => (
          <FilePreview key={i} file={file} />
        ))}
      </div>

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={UploadFiles.length === 0 || isUploading}
        className={`mt-8 px-8 py-3 rounded-xl font-bold shadow-md ${
          isUploading
            ? "bg-gray-500"
            : "bg-violet-600 hover:bg-violet-700 text-white"
        }`}
      >
        {isUploading
          ? "Uploading..."
          : uploadStatus === "success"
          ? "Upload Successful!"
          : `Upload ${UploadFiles.length} File(s)`}
      </button>
    </div>
  );
}
