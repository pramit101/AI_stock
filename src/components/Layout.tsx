import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useTranslation } from "react-i18next";
import {
  MenuIcon,
  BellIcon,
  LayoutDashboardIcon,
  ListIcon,
  UploadIcon,
  BarChart3Icon,
  SettingsIcon,
  LogOutIcon,
} from "lucide-react";
import { AnimatedThemeToggler } from "./magicui/animated-theme-toggler";

const SIDEBAR_WIDTH_PX = 256;
const SIDEBAR_RAIL_WIDTH_PX = 72;

const percentagePlaceholder = {
  Apples: 0,
  Bananas: 0,
  Cucumbers: 0,
  Carrots: 0,
  Potatoes: 0,
  Tomatoes: 0,
};

const filterPlaceholder = Object.entries(percentagePlaceholder).filter(
  ([n, p]) => p <= 20
);

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
  const [opened, setOpened] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user.displayName);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

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

        <div>
          <span className="text-gray-800 dark:text-gray-200 font-medium">
            {`${t("welcome")}, ${user}`}
          </span>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <AnimatedThemeToggler />

          <button
            className="p-2 rounded-md header-hover relative"
            aria-label="Notifications"
            onClick={() => setOpened(!opened)}
          >
            <BellIcon size={20} className="text-gray-800 dark:text-gray-200" />
            <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2" />
          </button>
          {opened && (
            <div className="absolute p-5 right-5 top-16 w-64 rounded-xl shadow-lg bg-white border border-gray-200 z-50">
              <ul className="divide-y divide-gray-100">
                {filterPlaceholder.map(([n, p]) => (
                  <li key={n} className="p-3 hover:bg-gray-50">
                    {n} are critically low at {p}%
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Sidebar({ open }: { open: boolean }) {
  const { t } = useTranslation();
  const navItems = [
    { name: t("dashboard"), to: "/Home", icon: <LayoutDashboardIcon size={20} /> },
    { name: t("inventory"), to: "/inventory", icon: <ListIcon size={20} /> },
    { name: t("upload"), to: "/upload", icon: <UploadIcon size={20} /> },
    { name: t("report"), to: "/report", icon: <BarChart3Icon size={20} /> },
    { name: t("settings"), to: "/settings", icon: <SettingsIcon size={20} /> },
  ];

  const location = useLocation();
  const width = open ? SIDEBAR_WIDTH_PX : SIDEBAR_RAIL_WIDTH_PX;
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <aside
      className="fixed top-0 left-0 h-screen sidebar text-white z-20 transition-all duration-300 flex flex-col border-r border-blue-800 dark:border-gray-800"
      style={{ width }}
      aria-label="Primary"
      aria-expanded={open}
    >
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

      <div className="p-3 border-t border-blue-800 dark:border-gray-800 space-y-1">
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center px-3 py-2 rounded-md text-left transition-colors hover:sidebar-hover"
          title={open ? undefined : "Logout"}
        >
          <LogOutIcon size={20} className="mr-3 shrink-0" />
          <span
            className={`transition-opacity duration-200 ${
              open ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {t("logout")}
          </span>
        </button>
      </div>
    </aside>
  );
}

function Footer({ open }: { open: boolean }) {
  const offset = open ? SIDEBAR_WIDTH_PX : SIDEBAR_RAIL_WIDTH_PX;
  return (
    <footer
      className="bg-white dark:bg-gray-900 shadow-inner transition-all duration-300 border-t border-gray-200 dark:border-gray-800"
      style={{ marginLeft: offset }}
    >
      <div className="px-4 py-2 text-center">
        <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
          PentaVision 2025 All rights are reserved
        </span>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const sidebarWidth = open ? SIDEBAR_WIDTH_PX : SIDEBAR_RAIL_WIDTH_PX;

  return (
    <div className="min-h-screen main">
      <Sidebar open={open} />
      <Header
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
      />
      <main
        className="main p-4 transition-all duration-300 min-h-[calc(100vh-40px)]"
        style={{ marginLeft: sidebarWidth }}
      >
        {children}
      </main>
      <Footer open={open} />
    </div>
  );
}
