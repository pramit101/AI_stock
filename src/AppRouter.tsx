// src/AppRouter.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Shell } from "./components/Shell";

import HomePage from "./pages/HomePage";
import Upload from "./pages/Upload";
import Inventory from "./pages/Inventory";
import Report from "./pages/Report";
import Settings from "./pages/Settings";
import { Apples } from "./pages/Apples";
import { Bananas } from "./pages/Bananas";
import { Cucumbers } from "./pages/Cucumbers";
import { Carrots } from "./pages/Carrots";
import { Potatoes } from "./pages/Potatoes";
import { Tomatoes } from "./pages/Tomatoes";
import { Login } from "./Login";
import TestAnalysisPage from "./pages/TestAnalysisPage"; // import the new page

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login page outside Shell */}
        <Route path="/login" element={<Login />} />

        {/* All other pages inside Shell layout */}
        <Route element={<Shell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/apples" element={<Apples />} />
          <Route path="/inventory/bananas" element={<Bananas />} />
          <Route path="/inventory/cucumbers" element={<Cucumbers />} />
          <Route path="/inventory/carrots" element={<Carrots />} />
          <Route path="/inventory/potatoes" element={<Potatoes />} />
          <Route path="/inventory/tomatoes" element={<Tomatoes />} />
          <Route path="/report" element={<Report />} />
          <Route path="/settings" element={<Settings />} />

          {/* New Test Analysis Page */}
          <Route path="/test-analysis" element={<TestAnalysisPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
