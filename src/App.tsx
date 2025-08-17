import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./App.css";

export default function LoopingText() {
  const textRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!textRef.current) return;

    // Animate text color pulsing
    gsap.to(textRef.current, {
      duration: 1,
      color: "#ff0000",
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });

    // Rotate logo infinitely
    gsap.to("#logo img", {
      rotation: 360,
      transformOrigin: "50% 50%",
      duration: 4,
      repeat: -1,
      ease: "linear",
    });
  }, []);

  return (
    <>
      <div id="main_text">
        <div id="logo">
          <img src="/src/assets/icon.svg" alt="Logo" />
        </div>
        <div ref={textRef} style={{ display: "inline-block" }}>
          TEAM PENTAVISION
        </div>
      </div>

      {/* Upload Section */}
      <div className="upload-section">
        <input
          type="file"
          onChange={(e) =>
            setSelectedFile(e.target.files ? e.target.files[0] : null)
          }
        />
        <p>
          {selectedFile
            ? `Selected file: ${selectedFile.name}`
            : "No file selected"}
        </p>
      </div>

      {/* Results Table Placeholder */}
      <div className="results">
        <h2>Results</h2>
        <table>
          <thead>
            <tr>
              <th>File Name</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {selectedFile ? (
              <tr>
                <td>{selectedFile.name}</td>
                <td>Uploaded</td>
                <td>Processing...</td>
              </tr>
            ) : (
              <tr>
                <td colSpan={3}>No results yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
