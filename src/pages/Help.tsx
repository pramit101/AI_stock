import { 
  LayoutDashboardIcon,
  UploadIcon, 
  ListIcon,
  BarChart3Icon, 
  SettingsIcon,
  PlayCircle,
  BookOpen,
  MapIcon
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Help() {
  const { t } = useTranslation();
  return (
    <div className="p-6 max-w-7xl mx-auto main">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">{t("helpDocumentation")}</h1>

      {/* Instructional Video Section */}
      <div className="card rounded-xl p-6 mb-8">
        <div className="flex items-center mb-4">
          <PlayCircle className="text-blue-600 dark:text-blue-400 mr-3" size={28} />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t("instructionalVideo")}</h2>
        </div>
        
        {/* Video Placeholder */}
        <div className="relative w-full max-w-3xl mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden" style={{ paddingBottom: '42%' /* Smaller aspect ratio */ }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <PlayCircle className="text-gray-400 dark:text-gray-500 mb-4" size={64} />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Video Tutorial Coming Soon</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Learn to use PentaVision</p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="card rounded-xl p-6 mb-8">
        <div className="flex items-center mb-4">
          <BookOpen className="text-blue-600 dark:text-blue-400 mr-3" size={28} />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">How PentaVision Works</h2>
        </div>
        
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <p className="text-lg leading-relaxed">
            <strong className="text-gray-900 dark:text-gray-100">PentaVision</strong> uses advanced artificial intelligence and computer vision to automatically monitor and manage your fresh produce inventory. The system works through a simple yet powerful process:
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
            <ol className="space-y-3 text-base">
              <li className="flex items-start">
                <span className="font-semibold text-blue-600 dark:text-blue-400 mr-2">1.</span>
                <span><strong>Image Capture:</strong> Simply upload photos of your inventory shelves through our Upload page.</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-blue-600 dark:text-blue-400 mr-2">2.</span>
                <span><strong>AI Analysis:</strong> Our computer vision AI instantly analyzes the images to identify products and calculate stock levels.</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-blue-600 dark:text-blue-400 mr-2">3.</span>
                <span><strong>Real-Time Updates:</strong> Stock percentages are automatically updated in the system and displayed on your dashboard.</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-blue-600 dark:text-blue-400 mr-2">4.</span>
                <span><strong>Smart Alerts:</strong> When stock drops below threshold levels, you receive instant notifications to restock.</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-blue-600 dark:text-blue-400 mr-2">5.</span>
                <span><strong>Data Insights:</strong> Historical data is tracked and visualized to help you make informed business decisions.</span>
              </li>
            </ol>
          </div>
          
          <p className="text-lg leading-relaxed">
            This automated process eliminates manual counting, reduces human error, and ensures you always have the right amount of inventory on hand—helping you reduce waste and maximize profits.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Smart Monitoring</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Real-time tracking of inventory levels with AI-powered shelf analysis through image recognition.
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Predictive Analytics</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Forecast stock needs and prevent shortages with data-driven insights and trend analysis.
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Automated Alerts</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Receive instant notifications when stock levels drop below optimal thresholds.
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Comprehensive Reports</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Generate detailed reports with visual analytics to support business decisions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Help Section */}
      <div className="card rounded-xl p-6">
        <div className="flex items-center mb-4">
          <MapIcon className="text-blue-600 dark:text-blue-400 mr-3" size={28} />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Navigation Guide</h2>
        </div>
        
        <div className="space-y-6">
          <p className="text-gray-700 dark:text-gray-300">
            Here's a quick guide to navigate through the system and make the most of its features:
          </p>

          {/* Navigation Items */}
          <div className="space-y-4">
            {/* Dashboard */}
            <div className="flex items-start border-l-4 border-blue-500 pl-4 py-2">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-4">
                <LayoutDashboardIcon className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Dashboard (Home)</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Your central hub displaying real-time stock charts, top produce items, and urgent restock alerts. Get a quick overview of your entire inventory at a glance.
                </p>
              </div>
            </div>

            {/* Upload */}
            <div className="flex items-start border-l-4 border-purple-500 pl-4 py-2">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-4">
                <UploadIcon className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Upload</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Upload images of your shelves for AI-powered analysis. The system will automatically detect stock levels and update your inventory. Simply drag and drop or select images to upload.
                </p>
              </div>
            </div>

            {/* Inventory */}
            <div className="flex items-start border-l-4 border-green-500 pl-4 py-2">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mr-4">
                <ListIcon className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Inventory</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Browse all products in your inventory with visual cards. View stock percentages, identify low-stock items with alerts, and click on any product to see detailed analytics including stock trends, current levels, and restock actions.
                </p>
              </div>
            </div>

            {/* Report */}
            <div className="flex items-start border-l-4 border-orange-500 pl-4 py-2">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg mr-4">
                <BarChart3Icon className="text-orange-600 dark:text-orange-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Report</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Generate comprehensive reports for individual products or view an overview of all items. Export reports as PDF or CSV for record-keeping. Choose timeframes (daily, weekly, monthly) to analyze historical trends.
                </p>
              </div>
            </div>

            {/* Settings */}
            <div className="flex items-start border-l-4 border-gray-500 pl-4 py-2">
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg mr-4">
                <SettingsIcon className="text-gray-600 dark:text-gray-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Settings</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Customize your experience by managing your profile, notification preferences, and system configurations. Toggle between light and dark modes using the theme switcher in the header.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

