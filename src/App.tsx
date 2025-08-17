import { useEffect, useRef, useState } from "react";
import "./App.css";

export default function App() {
  const textRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    // Text color animation
    const textEl = textRef.current;
    if (textEl) {
      const interval = setInterval(() => {
        textEl.style.color = textEl.style.color === "red" ? "#007bff" : "red";
      }, 1200);
      return () => clearInterval(interval);
    }

    // Logo rotation
    const logoEl = document.getElementById("logo");
    if (logoEl) {
      logoEl.style.animation = "spin 5s linear infinite";
    }
  }, []);

  const handleFile = (selectedFile: File) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResults([]);
  };

  const analyze = () => {
    setLoading(true);
    setTimeout(() => {
      setResults([
        { product: "Bananas", level: "75%", status: "✅ Well Stocked" },
        { product: "Broccoli", level: "30%", status: "⚠️ Low Stock" },
        { product: "Onions", level: "95%", status: "📦 Overstocked" },
      ]);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div id="logo" className="logo">
          🏪
        </div>
        <div ref={textRef} className="header-text">
          AI STOCK ANALYZER
        </div>
      </header>

      {/* Upload Section */}
      <div
        className={`upload-section ${file ? "file-selected" : ""}`}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files[0]);
        }}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        {!file ? (
          <>
            <div className="upload-icon">📁</div>
            <p className="upload-text">Drop files here or click to browse</p>
            <small>Images & Videos supported</small>
          </>
        ) : (
          <div className="file-preview-container">
            {file.type.startsWith("image") ? (
              <img src={preview} alt="preview" className="file-preview" />
            ) : (
              <video src={preview} controls className="file-preview" />
            )}
            <p className="file-name">{file.name}</p>
            <div className="file-buttons">
              <button onClick={(e) => { e.stopPropagation(); analyze(); }} className="btn analyze" disabled={loading}>
                {loading ? "🔍 Analyzing..." : "🔍 Analyze Stock"}
              </button>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(""); setResults([]); }} className="btn remove" disabled={loading}>
                🗑️ Remove
              </button>
            </div>
          </div>
        )}
        <input
          id="fileInput"
          type="file"
          accept="image/*,video/*"
          style={{ display: "none" }}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      {/* Results */}
      <div className="results">
        <h3>📊 Analysis Results</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Stock Level</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="loading-cell">
                  🔄 Processing with AI models...
                </td>
              </tr>
            ) : results.length > 0 ? (
              results.map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? "even-row" : "odd-row"}>
                  <td>{r.product}</td>
                  <td>{r.level}</td>
                  <td>{r.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="no-results">
                  {file ? 'Click "Analyze Stock" to process your file' : "No analysis available - Upload a file to begin"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
