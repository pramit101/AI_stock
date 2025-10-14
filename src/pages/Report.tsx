import { useState, useRef } from "react";
import { FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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
import { createRoot } from "react-dom/client";
import { useSettings } from "../context/SettingsContext";

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
  const { fontSize, fontStyle } = useSettings();
  
  // Get real data from Inventory page - but keep it blank (0%) since no uploads yet
  const [products] = useState<Product[]>([
    { name: "Bananas", category: "Fruits", stock: 0 },
    { name: "Apples", category: "Fruits", stock: 0 },
    { name: "Cucumbers", category: "Vegetables", stock: 0 },
    { name: "Tomatoes", category: "Vegetables", stock: 0 },
    { name: "Carrots", category: "Vegetables", stock: 0 },
    { name: "Potatoes", category: "Vegetables", stock: 0 },
  ]);

  // Helper function to get PDF font settings
  const getPDFFontSettings = () => {
    const sizeMap = {
      small: "12px",
      medium: "14px", 
      large: "16px",
      "x-large": "18px",
    };

    const styleMap = {
      Arial: "Arial, sans-serif",
      Verdana: "Verdana, sans-serif",
      Helvetica: "Helvetica, sans-serif",
      Tahoma: "Tahoma, sans-serif",
      "Trebuchet MS": "Trebuchet MS, sans-serif",
      "Times New Roman": "Times New Roman, serif",
      Georgia: "Georgia, serif",
      Garamond: "Garamond, serif",
      "Courier New": "Courier New, monospace",
      "Lucida Console": "Lucida Console, monospace",
      "Brush Script MT": "Brush Script MT, cursive",
      "Comic Sans MS": "Comic Sans MS, cursive",
      Impact: "Impact, sans-serif",
      "Sans-serif": "Arial, sans-serif",
      Palatino: "Palatino, serif",
    };

    return {
      fontFamily: styleMap[fontStyle],
      fontSize: sizeMap[fontSize],
    };
  };

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

  // Generate simple chart data based on timeframe - using real stock values
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

  // 🚀 CAPTURE REAL CHARTS: Use actual Recharts components from individual pages
  const exportToPDF = async (product?: Product) => {
    try {
      if (product) {
        await generateIndividualPDFWithRealChart(product);
      } else {
        await generateOverviewPDFWithRealCharts();
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF generation failed. Please try again.');
    }
  };

  // Generate individual product PDF with real Recharts component
  const generateIndividualPDFWithRealChart = async (product: Product) => {
    const chartData = getTimeframeData(product);
    const fontSettings = getPDFFontSettings();
    
    // Create a temporary container for rendering the React component
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '800px';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.padding = '20px';
    document.body.appendChild(tempContainer);
    
    // Create React root and render the chart component
    const root = createRoot(tempContainer);
    
    const ChartComponent = () => (
      <div style={{ 
        fontFamily: fontSettings.fontFamily, 
        fontSize: fontSettings.fontSize,
        background: 'white',
        padding: '20px'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          padding: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h1 style={{ margin: 0, fontSize: `calc(${fontSettings.fontSize} * 1.7)` }}>{t(product.name.toLowerCase())} {t("report")}</h1>
          <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: `calc(${fontSettings.fontSize} * 0.9)` }}>
            {t(product.category.toLowerCase())} • {timeframe === "daily" ? t("daily") : timeframe === "weekly" ? t("weekly") : t("monthly")} {t("report")}
          </p>
        </div>
        
        {/* Current Stock Level */}
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, fontSize: `calc(${fontSettings.fontSize} * 1.3)` }}>{t("currentStockLevel")}</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: fontSettings.fontSize }}>{t("stockPercentage")}</span>
            <span style={{ fontWeight: 'bold', fontSize: `calc(${fontSettings.fontSize} * 1.3)` }}>{product.stock}%</span>
          </div>
          <div style={{ 
            width: '100%', 
            background: '#e5e7eb', 
            borderRadius: '8px', 
            height: '20px', 
            overflow: 'hidden',
            marginTop: '10px'
          }}>
            <div style={{
              height: '100%',
              borderRadius: '8px',
              width: `${product.stock}%`,
              background: product.stock < 30 ? '#dc2626' : product.stock < 60 ? '#f59e0b' : '#10b981'
            }} />
          </div>
        </div>
        
        {/* Real Recharts Line Chart */}
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, fontSize: `calc(${fontSettings.fontSize} * 1.3)` }}>
            {t("stockHistory")} ({timeframe === "daily" ? t("daily") : timeframe === "weekly" ? t("weekly") : t("monthly")})
          </h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(209,213,219,0.6)" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10, fill: '#374151' }}
                  interval={timeframe === "monthly" ? 0 : 0}
                  tickCount={timeframe === "monthly" ? 30 : undefined}
                  angle={0}
                  textAnchor="middle"
                />
                      <YAxis 
                        domain={[0, 100]} 
                        ticks={[0, 25, 50, 75, 100]}
                        tickFormatter={(v) => `${v}%`} 
                        tick={{ fontSize: 10, fill: '#374151' }} 
                      />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, t("stockLevel")]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    color: '#111827',
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
    
    root.render(<ChartComponent />);
    
    // Wait for chart to render
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Capture with html2canvas
    const canvas = await html2canvas(tempContainer, {
      background: '#ffffff',
      useCORS: true,
      allowTaint: true,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const scale = imgHeight > pageHeight ? pageHeight / imgHeight : 1;
    const finalWidth = imgWidth * scale;
    const finalHeight = imgHeight * scale;
    
    pdf.addImage(imgData, 'PNG', (210 - finalWidth) / 2, (295 - finalHeight) / 2, finalWidth, finalHeight);
    pdf.save(`${product.name}-report-${timeframe}.pdf`);
    
    // Cleanup
    root.unmount();
    document.body.removeChild(tempContainer);
    console.log('Individual PDF with real chart generated successfully');
  };


  // Generate overview PDF with real Recharts components
  const generateOverviewPDFWithRealCharts = async () => {
    const fontSettings = getPDFFontSettings();
    
    // Create a temporary container for rendering the React component
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '1200px';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.padding = '15px';
    document.body.appendChild(tempContainer);
    
    // Create React root and render the overview component
    const root = createRoot(tempContainer);
    
    const OverviewComponent = () => (
      <div style={{ 
        fontFamily: fontSettings.fontFamily, 
        fontSize: fontSettings.fontSize,
        background: 'white',
        padding: '15px'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          padding: '15px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '8px',
          marginBottom: '15px'
        }}>
          <h1 style={{ margin: 0, fontSize: `calc(${fontSettings.fontSize} * 1.4)` }}>{t("freshProduceOverview")}</h1>
          <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: `calc(${fontSettings.fontSize} * 0.85)` }}>
            {timeframe === "daily" ? t("daily") : timeframe === "weekly" ? t("weekly") : t("monthly")} {t("report")}
          </p>
        </div>
        
        {/* Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          gap: '10px', 
          marginBottom: '15px' 
        }}>
          <div style={{ 
            background: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '6px', 
            padding: '10px', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: `calc(${fontSettings.fontSize} * 1.3)`, fontWeight: 'bold', color: '#4f46e5' }}>{totalProducts}</div>
            <div style={{ fontSize: `calc(${fontSettings.fontSize} * 0.7)`, color: '#666' }}>{t("totalProducts")}</div>
          </div>
          <div style={{ 
            background: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '6px', 
            padding: '10px', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: `calc(${fontSettings.fontSize} * 1.3)`, fontWeight: 'bold', color: '#059669' }}>{averageStock}%</div>
            <div style={{ fontSize: `calc(${fontSettings.fontSize} * 0.7)`, color: '#666' }}>{t("averageStock")}</div>
          </div>
          <div style={{ 
            background: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '6px', 
            padding: '10px', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: `calc(${fontSettings.fontSize} * 1.3)`, fontWeight: 'bold', color: '#dc2626' }}>{lowStockProducts.length}</div>
            <div style={{ fontSize: `calc(${fontSettings.fontSize} * 0.7)`, color: '#666' }}>{t("lowStockProducts")}</div>
          </div>
        </div>
        
        {/* Individual Product Charts - Full Size */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '15px' 
        }}>
          {products.map(product => {
            const chartData = getTimeframeData(product);
            return (
              <div key={product.name} style={{ 
                background: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                padding: '15px',
                marginBottom: '15px'
              }}>
                {/* Product Header */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '15px' 
                }}>
                  <img
                    src={productImages[product.name.slice(0, -1)]}
                    alt={product.name}
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      objectFit: 'cover', 
                      borderRadius: '6px',
                      marginRight: '10px'
                    }}
                  />
                  <div>
                    <div style={{ 
                      fontWeight: 'bold', 
                      fontSize: `calc(${fontSettings.fontSize} * 1.0)`,
                      color: '#111827'
                    }}>
                      {t(product.name.toLowerCase())}
                    </div>
                    <div style={{ 
                      fontSize: `calc(${fontSettings.fontSize} * 0.7)`,
                      color: '#6b7280'
                    }}>
                      {t(product.category.toLowerCase())}
                    </div>
                  </div>
                </div>
                
                {/* Stock Level */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '8px', 
                  fontSize: `calc(${fontSettings.fontSize} * 0.8)` 
                }}>
                  <span>{t("stockPercentage")}</span>
                  <span style={{ fontWeight: 'bold' }}>{product.stock}%</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  background: '#e5e7eb', 
                  borderRadius: '4px', 
                  height: '8px', 
                  marginBottom: '15px' 
                }}>
                  <div style={{
                    height: '100%',
                    borderRadius: '4px',
                    width: `${product.stock}%`,
                    background: product.stock < 30 ? '#dc2626' : product.stock < 60 ? '#f59e0b' : '#10b981'
                  }} />
                </div>
                
                {/* Full Size Recharts Line Chart */}
                <div style={{ 
                  height: '180px', 
                  background: '#f8fafc', 
                  borderRadius: '6px', 
                  padding: '15px', 
                  border: '1px solid #e2e8f0' 
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: 60, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(209,213,219,0.4)" />
                      <XAxis 
                        dataKey="time" 
                        tick={{ fontSize: 8, fill: '#6b7280' }}
                        interval={timeframe === "monthly" ? 4 : 0}
                        tickCount={timeframe === "monthly" ? 8 : undefined}
                        angle={0}
                        textAnchor="middle"
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        ticks={[0, 25, 50, 75, 100]}
                        tickFormatter={(v) => `${v}%`} 
                        tick={{ fontSize: 12, fill: '#374151' }}
                        width={60}
                      />
                      <Tooltip
                        formatter={(value: any) => [`${value}%`, t("stockLevel")]}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: 6,
                          color: '#111827',
                          fontSize: 10,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
    
    root.render(<OverviewComponent />);
    
    // Wait for charts to render
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Capture with html2canvas
    const canvas = await html2canvas(tempContainer, {
      background: '#ffffff',
      useCORS: true,
      allowTaint: true,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const scale = imgHeight > pageHeight ? pageHeight / imgHeight : 1;
    const finalWidth = imgWidth * scale;
    const finalHeight = imgHeight * scale;
    
    pdf.addImage(imgData, 'PNG', (210 - finalWidth) / 2, (295 - finalHeight) / 2, finalWidth, finalHeight);
    pdf.save(`overview-report-${timeframe}.pdf`);
    
    // Cleanup
    root.unmount();
    document.body.removeChild(tempContainer);
    console.log('Overview PDF with real charts generated successfully');
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

      {/* Individual Product Charts - using line graphs consistently */}
      <div className="mt-8 no-page-break" style={{ display: 'none' }}>
        <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 text-center">
          {t("individualProductCharts")}
        </h3>
        <div className="grid grid-cols-1 gap-8">
          {products.map((product) => (
            <div key={product.name} className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow no-page-break">
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={productImages[product.name.slice(0, -1)]}
                  alt={product.name}
                  className="product-image w-12 h-12 object-cover rounded-lg"
                />
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {t(product.name.toLowerCase())}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t(product.category.toLowerCase())}
                  </p>
                </div>
              </div>
              
              {/* Line Chart with Stock Level */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Line Chart */}
                <div className="h-80 chart-container">
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow h-full flex flex-col text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-800">
                      <div>
                        <h5 className="text-lg font-medium">{product.name} Stock Trends</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Stock levels ({timeframe === "daily" ? "throughout the day" : timeframe === "weekly" ? "daily over the week" : "daily over the month"})
                        </p>
                      </div>
                    </div>
                    <div className="p-2 flex-1">
                      <div className="h-full w-full text-inherit">
              <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={getTimeframeData(product)} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={document.documentElement.classList.contains('dark') ? "rgba(75,85,99,0.3)" : "rgba(209,213,219,0.6)"} />
                            <XAxis 
                              dataKey="time" 
                              tick={{ fontSize: 10, fill: "currentColor" }}
                              interval={timeframe === "monthly" ? 0 : 0}
                              tickCount={timeframe === "monthly" ? 30 : undefined}
                              angle={0}
                              textAnchor="middle"
                            />
                            <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: "currentColor" }} />
                            <Tooltip
                              formatter={(value: any) => [`${value}%`, "Stock Level"]}
                              contentStyle={{
                                background: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
                                border: `1px solid ${document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'}`,
                                borderRadius: 8,
                                color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#111827',
                                fontSize: 12,
                              }}
                            />
                  <Line
                    type="monotone"
                              dataKey="value"
                              name={product.name}
                    stroke="#4f46e5"
                              strokeWidth={2}
                              activeDot={{ r: 6 }}
                              isAnimationActive={false}
                            />
                </LineChart>
              </ResponsiveContainer>
            </div>
                    </div>
                  </div>
                </div>

                {/* CurrentStockLevel component */}
                <div className="h-80">
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow h-full flex flex-col text-gray-900 dark:text-gray-100">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-blue-600 dark:bg-blue-400 rounded mr-2"></div>
                        <h5 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                          Current Stock Level
                        </h5>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Stock percentage</p>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-center">
                      <div className="text-center mb-4">
                        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{product.name}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-700 dark:text-gray-300">Current Stock</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{product.stock}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-4 mb-4">
                        <div
                          className={`h-4 rounded-full transition-all duration-500 ${
                            product.stock < 30 ? 'bg-red-500' : product.stock < 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${product.stock}%` }}
                        />
                      </div>
                      <div className="text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          product.stock < 30 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          product.stock < 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {product.stock < 30 ? 'Low Stock' : product.stock < 60 ? 'Medium Stock' : 'High Stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
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
      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow no-page-break">
            <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
              {t("stockHistory")} ({timeframe === "daily" ? t("daily") : timeframe === "weekly" ? t("weekly") : t("monthly")})
            </h4>
        <div className="h-64 chart-container">
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
                ticks={[0, 25, 50, 75, 100]}
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
