import { useState, useRef } from "react";
import { FileText } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";

interface Product {
  name: string;
  category: string;
  stock: number;
  history?: number[];
}

const productImages: { [key: string]: string } = {
  Banana:
    "https://images.unsplash.com/photo-1587334206596-c0f9f7dccbe6?w=400&auto=format&fit=crop&q=80",
  Apple: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&auto=format&fit=crop&q=80",
  Cucumber:
    "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&auto=format&fit=crop&q=80",
  Tomatoe: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80",
  Carrot: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&auto=format&fit=crop&q=80",
  Potatoe: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&auto=format&fit=crop&q=80",
};

export default function Report() {
  const { t } = useTranslation();
  const [products] = useState<Product[]>([
    {
      name: "Bananas",
      category: "Fruits",
      stock: 0, // No mock data - real data only
      history: [0],
    },
    { name: "Apples", category: "Fruits", stock: 0, history: [0] },
    {
      name: "Cucumbers",
      category: "Vegetables",
      stock: 0,
      history: [0],
    },
    {
      name: "Tomatoes",
      category: "Vegetables",
      stock: 0,
      history: [0],
    },
    {
      name: "Carrots",
      category: "Vegetables",
      stock: 0,
      history: [0],
    },
    {
      name: "Potatoes",
      category: "Vegetables",
      stock: 0,
      history: [0],
    },
  ]);

  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">(
    "weekly"
  );
  const reportRef = useRef<HTMLDivElement>(null);

  const totalProducts = products.length;
  const averageStock = Math.round(
    products.reduce((sum, p) => sum + p.stock, 0) / totalProducts
  );
  const lowStockProducts = products.filter((p) => p.stock <= 30);

  const handleReportClick = (report: string) => setSelectedReport(report);
  const handleCloseModal = () => setSelectedReport(null);

  // Generate timeframe-based data similar to SingleProduceChart
  const getTimeframeData = (product: Product) => {
    const currentStock = product.stock;
    
    if (timeframe === "daily") {
      return [
        { time: "6AM", value: currentStock },
        { time: "8AM", value: currentStock },
        { time: "10AM", value: currentStock },
        { time: "12PM", value: currentStock },
        { time: "2PM", value: currentStock },
        { time: "4PM", value: currentStock },
        { time: "6PM", value: currentStock },
        { time: "8PM", value: currentStock },
        { time: "10PM", value: currentStock },
      ];
    }
    
    if (timeframe === "weekly") {
      return [
        { time: t("mon"), value: currentStock },
        { time: t("tue"), value: currentStock },
        { time: t("wed"), value: currentStock },
        { time: t("thu"), value: currentStock },
        { time: t("fri"), value: currentStock },
        { time: t("sat"), value: currentStock },
        { time: t("sun"), value: currentStock },
      ];
    }
    
    // monthly - show days 1-30
    return Array.from({ length: 30 }, (_, i) => ({
      time: `${i + 1}`,
      value: currentStock,
    }));
  };

  // ✅ PDF export - type-safe and hides buttons
  const exportToPDF = async (product?: Product) => {
    if (!reportRef.current) return;

    const reportElement = reportRef.current as HTMLElement;

    // For overview, show charts section during PDF generation
    let chartsSection: HTMLElement | null = null;
    if (!product && selectedReport === "Overview") {
      chartsSection = reportElement.querySelector('.mt-8[style*="display: none"]') as HTMLElement;
      if (chartsSection) {
        chartsSection.style.display = 'block';
      }
    }

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

    // Wait a moment for charts to render
    await new Promise(resolve => setTimeout(resolve, 500));

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

    // Restore charts section visibility
    if (chartsSection) {
      chartsSection.style.display = 'none';
    }

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
    
    // Create a blob with proper encoding
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${product ? product.name : "overview"}-report.csv`
    );
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  };

  const generateOverviewReport = () => (
    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md space-y-6">
      <h2 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-gray-100">
        {t("freshProduceOverview")}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-lg text-gray-900 dark:text-gray-100">
            <p>
              <strong>{t("totalProducts")}:</strong> {totalProducts}
            </p>
            <p>
              <strong>{t("averageStock")}:</strong> {averageStock}%
            </p>
            <p>
              <strong>{t("lowStockProducts")}:</strong>{" "}
              {lowStockProducts.map((p) => t(p.name.toLowerCase())).join(", ") || t("none")}
            </p>
      </div>

      {/* Simple product cards with current stock */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div
            key={p.name}
            className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-3">
              <img
                src={productImages[p.name.slice(0, -1)]}
                alt={p.name}
                className="product-image w-12 h-12 object-cover rounded-lg"
              />
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t(p.name.toLowerCase())}
                </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t(p.category.toLowerCase())}
                    </p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t("currentStock")}</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{p.stock}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  p.stock < 30 ? 'bg-red-500' : p.stock < 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${p.stock}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Individual Product Charts - only visible when generating PDF */}
      <div className="mt-8" style={{ display: 'none' }}>
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 text-center">
              {t("individualProductCharts")}
            </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {products.map((product) => (
            <div key={product.name} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={productImages[product.name.slice(0, -1)]}
                  alt={product.name}
                  className="product-image w-8 h-8 object-cover rounded-lg"
                />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t(product.name.toLowerCase())}
                </h4>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getTimeframeData(product)}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={document.documentElement.classList.contains('dark') ? "rgba(75,85,99,0.3)" : "rgba(209,213,219,0.6)"} 
                    />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 8, fill: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280' }}
                      interval={timeframe === "monthly" ? 0 : 0}
                      tickCount={timeframe === "monthly" ? 30 : undefined}
                      angle={0}
                      textAnchor="middle"
                      height={25}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fontSize: 10, fill: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280' }}
                    />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, t("stockLevel")]}
                    contentStyle={{
                      backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
                      border: `1px solid ${document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'}`,
                      borderRadius: 8,
                      color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#111827',
                      fontSize: 12,
                    }}
                  />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const generateProductReport = (product: Product) => (
    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <img
          src={productImages[product.name.slice(0, -1)]}
          alt={product.name}
          className="product-image w-16 h-16 object-cover rounded-lg shadow"
        />
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t(product.name.toLowerCase())}</h3>
          <p className="text-gray-600 dark:text-gray-400">{t(product.category.toLowerCase())}</p>
        </div>
      </div>

      {/* Current Stock Level */}
      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">{t("currentStockLevel")}</h4>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600 dark:text-gray-400">{t("stockPercentage")}</span>
          <span className="font-bold text-gray-900 dark:text-gray-100">{product.stock}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              product.stock < 30 ? 'bg-red-500' : product.stock < 60 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${product.stock}%` }}
          />
        </div>
        <div className="mt-2 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    product.stock < 30 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                    product.stock < 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  }`}>
                    {product.stock < 30 ? t("lowStock") : product.stock < 60 ? t("mediumStock") : t("highStock")}
                  </span>
        </div>
      </div>

      {/* Stock History Chart with Timeframe */}
      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
              {t("stockHistory")} ({timeframe === "daily" ? t("daily") : timeframe === "weekly" ? t("weekly") : t("monthly")})
            </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getTimeframeData(product)}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={document.documentElement.classList.contains('dark') ? "rgba(75,85,99,0.3)" : "rgba(209,213,219,0.6)"} 
              />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 10, fill: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280' }}
                      interval={timeframe === "monthly" ? 0 : 0}
                      tickCount={timeframe === "monthly" ? 30 : undefined}
                      angle={0}
                      textAnchor="middle"
                      height={30}
                    />
              <YAxis 
                domain={[0, 100]} 
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 12, fill: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280' }}
              />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, t("stockLevel")]}
                    contentStyle={{
                      backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
                      border: `1px solid ${document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'}`,
                      borderRadius: 8,
                      color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#111827',
                      fontSize: 12,
                    }}
                  />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
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
            className="card rounded-lg p-4 text-center hover:shadow-lg transition-shadow"
          >
            <div className="w-full h-32 mb-2 flex items-center justify-center">
              <img
                src={productImages[p.name.slice(0, -1)]}
                alt={p.name}
                className="product-image w-full h-full object-cover rounded-lg"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{t(p.name.toLowerCase())}</h3>
          </button>
        ))}
        <button
          onClick={() => handleReportClick("Overview")}
          className="bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-center mb-2">
            <FileText size={60} />
          </div>
          <h3 className="text-lg font-semibold">{t("overview")}</h3>
          <p className="text-sm opacity-90">{t("completeReport")}</p>
        </button>
      </div>

      {/* Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-gray-800 dark:bg-black bg-opacity-50 dark:bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
            ref={reportRef}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {selectedReport === "Overview"
                    ? t("freshProduceOverview")
                    : `${selectedReport} ${t("report")}`}
                </h2>
                <div className="flex items-center gap-4">
                  <select
                    value={timeframe}
                    onChange={(e) =>
                      setTimeframe(
                        e.target.value as "daily" | "weekly" | "monthly"
                      )
                    }
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1 text-sm"
                  >
                    <option value="daily">{t("daily")}</option>
                    <option value="weekly">{t("weekly")}</option>
                    <option value="monthly">{t("monthly")}</option>
                  </select>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
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
                  {t("downloadPdf")}
                </button>
                <button
                  onClick={() =>
                    selectedReport === "Overview"
                      ? exportToCSV()
                      : exportToCSV(selectedProduct!)
                  }
                  className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  {t("downloadCsv")}
                </button>
                <button
                  onClick={handleCloseModal}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {t("closeReport")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
