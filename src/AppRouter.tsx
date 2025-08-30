// src/AppRouter.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Shell } from "./components/Shell";

import HomePage from "./pages/HomePage";
import Upload from "./pages/Upload";
import Inventory from "./pages/Inventory";
import Report from "./pages/Report";
import Settings from "./pages/Settings";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/report" element={<Report />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
