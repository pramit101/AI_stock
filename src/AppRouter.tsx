// src/AppRouter.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";

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

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<Landing />} />
        
        {/* Login page outside Shell */}
        <Route path="/login" element={<Login />} />

        {/* All other pages inside Layout */}
        <Route path="/Home" element={<Layout><HomePage /></Layout>} />
        <Route path="/upload" element={<Layout><Upload /></Layout>} />
        <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
        <Route path="/inventory/apples" element={<Layout><Apples /></Layout>} />
        <Route path="/inventory/bananas" element={<Layout><Bananas /></Layout>} />
        <Route path="/inventory/cucumbers" element={<Layout><Cucumbers /></Layout>} />
        <Route path="/inventory/carrots" element={<Layout><Carrots /></Layout>} />
        <Route path="/inventory/potatoes" element={<Layout><Potatoes /></Layout>} />
        <Route path="/inventory/tomatoes" element={<Layout><Tomatoes /></Layout>} />
        <Route path="/report" element={<Layout><Report /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
        <Route path="/Help" element={<Layout><Help /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}
