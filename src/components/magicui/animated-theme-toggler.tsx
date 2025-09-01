"use client";

import { Moon, SunDim } from "lucide-react";
import { useState, useEffect, useRef } from "react";

type props = {
  className?: string;
};

export const AnimatedThemeToggler = ({ className }: props) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Check initial theme
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);
  
  const changeTheme = () => {
    if (!buttonRef.current) return;
    
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Get button position for circular animation
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate the maximum radius needed to cover the entire viewport
    const maxRadius = Math.max(
      Math.hypot(centerX, centerY),
      Math.hypot(window.innerWidth - centerX, centerY),
      Math.hypot(centerX, window.innerHeight - centerY),
      Math.hypot(window.innerWidth - centerX, window.innerHeight - centerY)
    );
    
    // Create the circular overlay element
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '9999';
    overlay.style.borderRadius = '50%';
    overlay.style.transform = 'translate(-50%, -50%)';
    overlay.style.left = `${centerX}px`;
    overlay.style.top = `${centerY}px`;
    overlay.style.width = '0';
    overlay.style.height = '0';
    overlay.style.backgroundColor = 'transparent';
    overlay.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    
    document.body.appendChild(overlay);
    
    // Trigger the circular expansion animation
    requestAnimationFrame(() => {
      overlay.style.width = `${maxRadius * 2}px`;
      overlay.style.height = `${maxRadius * 2}px`;
    });
    
    // Update the DOM and localStorage immediately
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("pv-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("pv-theme", "light");
    }
    
    // Remove the overlay after animation completes
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 800);
  };
  
  return (
    <button 
      ref={buttonRef}
      onClick={changeTheme} 
      className={`p-2.5 rounded-lg header-hover text-gray-700 dark:text-gray-200 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105 active:scale-95 ${className || ''}`}
      aria-label="Toggle dark mode"
    >
      <div className="transition-all duration-300 ease-in-out transform">
        {isDarkMode ? (
          <SunDim size={20} className="transition-all duration-300 ease-in-out" />
        ) : (
          <Moon size={20} className="transition-all duration-300 ease-in-out" />
        )}
      </div>
    </button>
  );
};
