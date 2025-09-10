// src/components/Shell.tsx
import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  MenuIcon,
  SearchIcon,
  BellIcon,
  UserIcon,
  LayoutDashboardIcon,
  ListIcon,
  UploadIcon,
  BarChart3Icon,
  SettingsIcon,
  HelpCircleIcon,
  LogOutIcon,
} from "lucide-react";
import { AnimatedThemeToggler } from "./magicui/animated-theme-toggler";

const SIDEBAR_WIDTH_PX = 256; // open width
const SIDEBAR_RAIL_WIDTH_PX = 72; // closed width (icons only)

/* ---------------- Header ---------------- */
function Header({
  open,
  onOpen,
  onClose,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const offset = open ? SIDEBAR_WIDTH_PX : SIDEBAR_RAIL_WIDTH_PX;

  return (
    <header
      className="header sticky top-0 z-10 transition-all duration-300 border-b border-gray-200 dark:border-gray-800"
      style={{ marginLeft: offset }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={open ? onClose : onOpen}
            className="p-2 rounded-md header-hover focus:outline-none"
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            aria-pressed={open}
          >
            <MenuIcon size={20} className="text-gray-800 dark:text-gray-200" />
          </button>
          <div className="ml-4"></div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Theme Toggle */}
          <AnimatedThemeToggler />

          <button
            className="p-2 rounded-md header-hover relative"
            aria-label="Notifications"
          >
            <BellIcon size={20} className="text-gray-800 dark:text-gray-200" />
            <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2" />
          </button>

          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              <UserIcon
                size={16}
                className="text-gray-600 dark:text-gray-300"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Sidebar (rail when collapsed) ---------------- */
function Sidebar({ open }: { open: boolean }) {
  const navItems = [
    { name: "Dashboard", to: "/", icon: <LayoutDashboardIcon size={20} /> },
    { name: "Inventory", to: "/inventory", icon: <ListIcon size={20} /> },
    { name: "Upload", to: "/upload", icon: <UploadIcon size={20} /> },
    { name: "Report", to: "/report", icon: <BarChart3Icon size={20} /> },
    { name: "Settings", to: "/settings", icon: <SettingsIcon size={20} /> },
  ];

  const location = useLocation();
  const width = open ? SIDEBAR_WIDTH_PX : SIDEBAR_RAIL_WIDTH_PX;

  return (
    <aside
      /* Light mode: bluish | Dark mode: charcoal */
      className="fixed top-0 left-0 h-screen sidebar text-white z-20 transition-all duration-300 flex flex-col border-r border-blue-800 dark:border-gray-800"
      style={{ width }}
      aria-label="Primary"
      aria-expanded={open}
    >
      {/* Brand */}
      <div className="p-3 flex items-center border-b border-blue-800 dark:border-gray-800 mt-1">
        <img
          src="/logo.svg"
          alt="PentaVision logo"
          className="w-8 h-8 rounded-md object-contain"
        />
        <span
          className={`ml-3 text-xl font-bold whitespace-nowrap transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          PentaVision
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 mt-2 overflow-hidden" role="navigation">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <li key={item.name}>
                <Link
                  to={item.to}
                  className={`flex items-center px-3 py-2 rounded-md transition-colors
                    ${active ? "sidebar-active" : "hover:sidebar-hover"}`}
                  aria-current={active ? "page" : undefined}
                  title={open ? undefined : item.name}
                >
                  <span className="mr-3 shrink-0">{item.icon}</span>
                  <span
                    className={`transition-opacity duration-200 ${
                      open ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-blue-800 dark:border-gray-800">
        <button
          type="button"
          className="w-full flex items-center px-3 py-2 rounded-md text-left transition-colors hover:sidebar-hover"
          title={open ? undefined : "Help"}
        >
          <HelpCircleIcon size={20} className="mr-3 shrink-0" />
          <span
            className={`transition-opacity duration-200 ${
              open ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            Help
          </span>
        </button>
        <button
          type="button"
          className="w-full flex items-center px-3 py-2 rounded-md text-left mt-2 transition-colors hover:sidebar-hover"
          title={open ? undefined : "Logout"}
        >
          <LogOutIcon size={20} className="mr-3 shrink-0" />
          <span
            className={`transition-opacity duration-200 ${
              open ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}

/* ---------------- Slim Footer ---------------- */
function Footer({ open }: { open: boolean }) {
  const offset = open ? SIDEBAR_WIDTH_PX : SIDEBAR_RAIL_WIDTH_PX;
  return (
    <footer
      className="bg-white dark:bg-gray-900 shadow-inner transition-all duration-300 border-t border-gray-200 dark:border-gray-800"
      style={{ marginLeft: offset }}
    >
      <div className="px-4 py-2 text-center">
        <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
          Pentavision AI Stock level Detection
        </span>
      </div>
    </footer>
  );
}

/* ---------------- Shell (push layout) ---------------- */
export function Shell() {
  const [open, setOpen] = useState(true); // Start with sidebar open

  const sidebarWidth = open ? SIDEBAR_WIDTH_PX : SIDEBAR_RAIL_WIDTH_PX;

  return (
    <div className="min-h-screen main">
      {/* Sidebar */}
      <Sidebar open={open} />

      {/* Header */}
      <Header
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
      />

      {/* Main */}
      <main
        className="main p-4 transition-all duration-300 min-h-[calc(100vh-40px)]"
        style={{ marginLeft: sidebarWidth }}
      >
        <Outlet />
      </main>

      {/* Footer */}
      <Footer open={open} />
    </div>
  );
}
