// src/context/SettingsContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useTranslation } from "react-i18next";

export type FontSize = "small" | "medium" | "large" | "x-large";
export type FontStyle =
  | "Arial"
  | "Verdana"
  | "Helvetica"
  | "Tahoma"
  | "Trebuchet MS"
  | "Times New Roman"
  | "Georgia"
  | "Garamond"
  | "Courier New"
  | "Brush Script MT"
  | "Comic Sans MS"
  | "Impact"
  | "Lucida Console"
  | "Palatino"
  | "Sans-serif";

interface Settings {
  language: string;
  fontSize: FontSize;
  fontStyle: FontStyle;
}

interface SettingsContextType extends Settings {
  updateSetting: (key: keyof Settings, value: any) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  language: "en",
  fontSize: "medium",
  fontStyle: "Sans-serif",
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem("appSettings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const { i18n } = useTranslation();

  const updateSetting = (key: keyof Settings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => setSettings(defaultSettings);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("appSettings", JSON.stringify(settings));
  }, [settings]);

  // Apply global changes
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    const sizeMap: Record<FontSize, string> = {
      small: "80%",
      medium: "100%",
      large: "120%",
      "x-large": "150%",
    };

    const styleMap: Record<FontStyle, string> = {
      Arial: "font-sans",
      Verdana: "font-sans",
      Helvetica: "font-sans",
      Tahoma: "font-sans",
      "Trebuchet MS": "font-sans",
      "Times New Roman": "font-serif",
      Georgia: "font-serif",
      Garamond: "font-serif",
      "Courier New": "font-mono",
      "Lucida Console": "font-mono",
      "Brush Script MT": "cursive",
      "Comic Sans MS": "cursive",
      Impact: "cursive",
      "Sans-serif": "font-sans",
      Palatino: "font-serif",
    };

    // Font size
    root.style.fontSize = sizeMap[settings.fontSize];

    // Font style
    body.classList.remove("font-sans", "font-serif", "font-mono", "cursive", "monospace", "serif");
    body.classList.add(styleMap[settings.fontStyle]);

    // Language
    i18n.changeLanguage(settings.language);
  }, [settings, i18n]);

  return (
    <SettingsContext.Provider value={{ ...settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within SettingsProvider");
  return context;
};
