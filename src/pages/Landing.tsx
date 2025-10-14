import { useNavigate } from 'react-router-dom';
import RippleGrid from '../components/magicui/RippleGrid';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from "react-i18next";

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ fontFamily: "'Space Grotesk', sans-serif", background: 'linear-gradient(to bottom right, #020617, #0c1e3d, #020617)' }}>
      {/* Animated Background */}
      <RippleGrid
        enableRainbow={false}
        gridColor="#60a5fa"
        rippleIntensity={0.05}
        gridSize={10}
        gridThickness={15}
        mouseInteraction={true}
        mouseInteractionRadius={1.2}
        opacity={0.7}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header/Nav */}
        <header className="px-6 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <img
              src="/logo.svg"
              alt="PentaVision logo"
              className="w-10 h-10 rounded-md object-contain"
            />
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 text-white rounded-lg transition-all duration-300 hover:opacity-90"
            style={{ backgroundColor: '#054E78' }}
          >
{t("login")}
          </button>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-6xl w-full">
            <div className="text-center space-y-8">
              {/* Main Heading */}
              <div className="space-y-6">
                <h2 className="text-6xl md:text-8xl font-black text-white leading-tight tracking-tight">
                  {t("pentavision")}
                </h2>
                <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  AI-Powered Inventory Management: Transforming the fresh produce shelf with AI technology to insights
                </p>
              </div>

              {/* CTA Button */}
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => navigate('/login')}
                  className="group px-10 py-4 text-white text-lg font-semibold rounded-full hover:opacity-90 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 shadow-2xl"
                  style={{ backgroundColor: '#054E78' }}
                >
                  <span>Get Started</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-6 text-center text-gray-400 text-sm">
          <p>&copy; 2025 PentaVision. AI Stock Level Detection System.</p>
        </footer>
      </div>
    </div>
  );
}

