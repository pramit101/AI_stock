import { Sidebar } from "../components/Sidebar";
import { useState } from "react";
import { TitleHeader } from "../components/TitleHeader";

export default function Upload() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const handleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar collapsed={sidebarCollapsed} />
      <TitleHeader toggleSidebar={handleCollapse} title="Upload page" />
    </div>
  );
}
