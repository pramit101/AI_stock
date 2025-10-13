import { useState, useRef } from "react";
import { FileText } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Product {
  name: string;
  category: string;
  stock: number;
  history?: number[];
}

const productImages: { [key: string]: string } = {
  Banana:
    "https://images.unsplash.com/photo-1587334206596-c0f9f7dccbe6?w=600&auto=format&fit=crop&q=60",
  Apple: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce",
  Cucumber:
    "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&auto=format&fit=crop&q=60",
  Tomato: "https://plus.unsplash.com/premium_photo-1726138646616-ec9fb0277048",
  Carrot: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37",
  Potato: "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
};

export default function Report() {
  const [products] = useState<Product[]>([
    {
      name: "Banana",
      category: "Fruits",
      stock: 65,
      history: [60, 62, 64, 65],
    },
    { name: "Apple", category: "Fruits", stock: 75, history: [70, 72, 74, 75] },
    {
      name: "Cucumber",
      category: "Vegetables",
      stock: 40,
      history: [42, 41, 40, 40],
    },
    {
      name: "Tomato",
      category: "Vegetables",
      stock: 55,
      history: [50, 53, 54, 55],
    },
    {
      name: "Carrot",
      category: "Vegetables",
      stock: 20,
      history: [30, 25, 22, 20],
    },
    {
      name: "Potato",
      category: "Vegetables",
      stock: 25,
      history: [28, 27, 26, 25],
    },
  ]);

  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">(
    "weekly"
  );
  const reportRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const totalProducts = products.length;
  const averageStock = Math.round(
    products.reduce((sum, p) => sum + p.stock, 0) / totalProducts
  );
  const lowStockProducts = products.filter((p) => p.stock <= 30);

  const handleReportClick = (report: string) => setSelectedReport(report);
  const handleCloseModal = () => setSelectedReport(null);

  const getHistoryByTimeframe = (history: number[] = []) => {
    switch (timeframe) {
      case "daily":
        return history.slice(-1);
      case "weekly":
        return history.slice(-7);
      case "monthly":
        return history.slice(-30);
      default:
        return history;
    }
  };

  // ✅ PDF export - type-safe and hides buttons
  const exportToPDF = async (product?: Product) => {
    if (!reportRef.current) return;

    const reportElement = reportRef.current as HTMLElement;

    // Hide download buttons during capture
    const buttons = reportElement.querySelectorAll(".export-buttons");
    buttons.forEach((btn) => {
      (btn as HTMLElement).style.display = "none";
    });

    // Save original styles
    const originalOverflow = reportElement.style.overflow;
    const originalMaxHeight = reportElement.style.maxHeight;

    reportElement.style.overflow = "visible";
    reportElement.style.maxHeight = "none";

    // Capture canvas
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      backgroundColor: "#ffffff",
    } as any);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    while (heightLeft > 0) {
      pdf.addImage(imgData, "PNG", 0, -position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      position += pdfHeight;
      if (heightLeft > 0) pdf.addPage();
    }

    pdf.save(`${product ? product.name : "overview"}-report.pdf`);

    // Restore buttons and original styles
    buttons.forEach((btn) => {
      (btn as HTMLElement).style.display = "";
    });
    reportElement.style.overflow = originalOverflow;
    reportElement.style.maxHeight = originalMaxHeight;
  };

  const exportToCSV = (product?: Product) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (product) {
      csvContent += `Name,Category,Stock%,History\n${product.name},${
        product.category
      },${product.stock},${product.history?.join("|") || ""}`;
    } else {
      csvContent += "Name,Category,Stock%\n";
      products.forEach(
        (p) => (csvContent += `${p.name},${p.category},${p.stock}\n`)
      );
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${product ? product.name : "overview"}-report.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateOverviewReport = () => (
    <div className="p-6 bg-gray-50 rounded-xl shadow-md space-y-6">
      <h2 className="text-3xl font-bold text-center mb-4">
        Fresh Produce Overview
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-lg">
        <p>
          <strong>Total Products:</strong> {totalProducts}
        </p>
        <p>
          <strong>Average Stock:</strong> {averageStock}%
        </p>
        <p>
          <strong>Low Stock Products:</strong>{" "}
          {lowStockProducts.map((p) => p.name).join(", ") || "None"}
        </p>
      </div>

      {/* Individual product mini charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map((p) => (
          <div
            key={p.name}
            className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="w-full sm:w-48 h-28">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={getHistoryByTimeframe(p.history).map(
                    (value, index) => ({
                      day: index + 1,
                      stock: value,
                    })
                  )}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  <Line
                    type="monotone"
                    dataKey="stock"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={false}
                  />
                  <XAxis
                    dataKey="day"
                    label={{
                      value: "Day",
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    label={{
                      value: "Stock %",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1">
              <p className="text-xl font-semibold">
                {p.name}{" "}
                <span className="text-gray-500 text-sm">({p.category})</span>
              </p>
              <p className="mt-1 text-gray-700">
                Most Recent Stock: <span className="font-bold">{p.stock}%</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Combined chart */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-2">
          All Products Stock History
        </h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={Array.from(
                {
                  length: Math.max(
                    ...products.map(
                      (p) => getHistoryByTimeframe(p.history).length
                    )
                  ),
                },
                (_, i) => {
                  const entry: any = { day: i + 1 };
                  products.forEach((p) => {
                    const hist = getHistoryByTimeframe(p.history);
                    entry[p.name] = hist[i] !== undefined ? hist[i] : null;
                  });
                  return entry;
                }
              )}
            >
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
              <XAxis
                dataKey="day"
                label={{ value: "Day", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                domain={[0, 100]}
                label={{ value: "Stock %", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                formatter={(value: number, name: string) => [`${value}%`, name]}
                contentStyle={{
                  backgroundColor: "#f9f9f9",
                  borderRadius: 8,
                  borderColor: "#ddd",
                }}
              />
              <Legend verticalAlign="top" height={36} />
              {products.map((p, index) => (
                <Line
                  key={p.name}
                  type="monotone"
                  dataKey={p.name}
                  stroke={
                    [
                      "#4f46e5",
                      "#10b981",
                      "#f59e0b",
                      "#ef4444",
                      "#8b5cf6",
                      "#ec4899",
                    ][index % 6]
                  }
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const generateProductReport = (product: Product) => (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
      <img
        src={productImages[product.name]}
        alt={product.name}
        className="w-48 h-48 object-cover mb-4 rounded-lg shadow"
      />
      <p>Most Recent Stock: {product.stock}%</p>
      {product.history && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={product.history.map((value, index) => ({
              day: index + 1,
              stock: value,
            }))}
          >
            <Line
              type="monotone"
              dataKey="stock"
              stroke="#8884d8"
              strokeWidth={2}
            />
            <CartesianGrid stroke="#ccc" />
            <XAxis
              dataKey="day"
              label={{ value: "Day", position: "insideBottom", offset: 0 }}
            />
            <YAxis
              domain={[0, 100]}
              label={{ value: "Stock %", angle: -90, position: "insideLeft" }}
            />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );

  const selectedProduct =
    selectedReport && selectedReport !== "Overview"
      ? products.find((p) => p.name === selectedReport)
      : null;

  return (
    <div className="p-6">
      {/* Product & Overview Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {products.map((p) => (
          <button
            key={p.name}
            onClick={() => handleReportClick(p.name)}
            className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow"
          >
            <img
              src={productImages[p.name]}
              alt={p.name}
              className="w-full h-auto object-cover rounded-lg mb-2"
            />
            <h3 className="text-lg font-semibold">{t(p.name.toLowerCase())}</h3>
            <p className="text-sm text-gray-600">Stock: {p.stock}%</p>
          </button>
        ))}
        <button
          onClick={() => handleReportClick("Overview")}
          className="bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-center mb-2">
            <FileText size={60} />
          </div>
          <h3 className="text-lg font-semibold">Overview</h3>
          <p className="text-sm opacity-90">Complete Report</p>
        </button>
      </div>

      {/* Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
            ref={reportRef}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {selectedReport === "Overview"
                    ? "Fresh Produce Overview"
                    : `${selectedReport} Report`}
                </h2>
                <div className="flex items-center gap-4">
                  <select
                    value={timeframe}
                    onChange={(e) =>
                      setTimeframe(
                        e.target.value as "daily" | "weekly" | "monthly"
                      )
                    }
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              {selectedReport === "Overview"
                ? generateOverviewReport()
                : generateProductReport(selectedProduct!)}

              <div className="mt-6 flex justify-end gap-3 export-buttons">
                <button
                  onClick={() =>
                    selectedReport === "Overview"
                      ? exportToPDF()
                      : exportToPDF(selectedProduct!)
                  }
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Download PDF
                </button>
                <button
                  onClick={() =>
                    selectedReport === "Overview"
                      ? exportToCSV()
                      : exportToCSV(selectedProduct!)
                  }
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Download CSV
                </button>
                <button
                  onClick={handleCloseModal}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Close Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
