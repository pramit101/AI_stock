// src/AppRouter.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Shell } from "./components/Shell";

import Landing from "./pages/Landing";
import HomePage from "./pages/HomePage";
import Upload from "./pages/Upload";
import Inventory from "./pages/Inventory";
import Report from "./pages/Report";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
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
        {/* Landing page */}
        <Route path="/" element={<Landing />} />
        
        {/* Login page outside Shell */}
        <Route path="/login" element={<Login />} />

        {/* All other pages inside Shell layout */}
        <Route element={<Shell />}>
          <Route path="/Home" element={<HomePage />} />
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
          <Route path="/help" element={<Help />} />

          {/* New Test Analysis Page */}
          <Route path="/test-analysis" element={<TestAnalysisPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
