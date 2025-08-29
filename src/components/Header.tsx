import { MenuIcon, BellIcon, UserIcon, SearchIcon } from "lucide-react";
interface HeaderProps {
  toggleSidebar: () => void;
  sidebarCollapsed: boolean;
}
export function Header({ toggleSidebar, sidebarCollapsed }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
          >
            <MenuIcon size={20} />
          </button>
          <div className="ml-4 relative md:ml-6">
            <div className="flex items-center border rounded-md bg-gray-100 px-3 py-2">
              <SearchIcon size={16} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search inventory..."
                className="ml-2 bg-transparent border-none focus:outline-none text-sm w-40 md:w-64"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-md hover:bg-gray-100 relative">
            <BellIcon size={20} />
            <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
          </button>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <UserIcon size={16} className="text-gray-600" />
            </div>
            <span className="ml-2 text-sm font-medium hidden md:block">
              Admin User
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
