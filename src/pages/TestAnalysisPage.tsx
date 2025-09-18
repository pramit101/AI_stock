// src/pages/TestAnalysisPage.tsx
import React, { useState } from "react";
import { saveAnalysis, getAnalyses } from "../analysisService";
import { mockResult } from "../mockData";

interface Analysis {
  id: string;
  status: string;
  message: string;
  data: Record<string, number>;
  processing_time: number;
  total_items: number;
  timestamp: string;
}

const TestAnalysisPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);

  const handleSave = async () => {
    try {
      await saveAnalysis(mockResult);
      alert("Mock analysis saved to Firestore!");
    } catch (error) {
      console.error("Error saving analysis:", error);
      alert("Failed to save analysis.");
    }
  };

  const handleFetch = async () => {
    try {
      const results = await getAnalyses();
      setAnalyses(results);
    } catch (error) {
      console.error("Error fetching analyses:", error);
      alert("Failed to fetch analyses.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Test Analysis Page</h1>
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={handleSave} style={{ marginRight: "1rem" }}>
          Save Mock Analysis
        </button>
        <button onClick={handleFetch}>Load Analyses</button>
      </div>

      {analyses.length > 0 && (
        <table border={1} cellPadding={5} style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Message</th>
              <th>Data</th>
              <th>Processing Time</th>
              <th>Total Items</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {analyses.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.status}</td>
                <td>{a.message}</td>
                <td>
                  {Object.entries(a.data)
                    .map(([item, value]) => `${item}: ${value}`)
                    .join(", ")}
                </td>
                <td>{a.processing_time}</td>
                <td>{a.total_items}</td>
                <td>{a.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TestAnalysisPage;
