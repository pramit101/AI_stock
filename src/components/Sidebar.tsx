import React from 'react';
import { LayoutDashboardIcon, ListIcon, UploadIcon, BarChart3Icon, HelpCircleIcon, LogOutIcon, SettingsIcon } from 'lucide-react';
interface SidebarProps {
  collapsed: boolean;
}
export function Sidebar({
  collapsed
}: SidebarProps) {
  const navItems = [{
    name: 'Dashboard',
    icon: <LayoutDashboardIcon size={20} />,
    active: true
  }, {
    name: 'Categories',
    icon: <ListIcon size={20} />
  }, {
    name: 'Upload',
    icon: <UploadIcon size={20} />
  }, {
    name: 'Report',
    icon: <BarChart3Icon size={20} />
  }, {
    name: 'Settings',
    icon: <SettingsIcon size={20} />
  }];
  return <aside className={`bg-gray-900 text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} flex flex-col`}>
      <div className="p-4 flex items-center justify-center">
        {!collapsed && <span className="text-xl font-bold">PentaVision</span>}
        {collapsed && <span className="text-xl font-bold">PV</span>}
      </div>
      <nav className="flex-1 mt-6">
        <ul>
          {navItems.map((item, index) => <li key={index}>
              <a href="#" className={`flex items-center px-4 py-3 hover:bg-gray-800 transition-colors ${item.active ? 'bg-gray-800' : ''}`}>
                <span className="mr-3">{item.icon}</span>
                {!collapsed && <span>{item.name}</span>}
              </a>
            </li>)}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center px-4 py-2 hover:bg-gray-800 rounded-md cursor-pointer">
          <HelpCircleIcon size={20} className="mr-3" />
          {!collapsed && <span>Help</span>}
        </div>
        <div className="flex items-center px-4 py-2 hover:bg-gray-800 rounded-md cursor-pointer mt-2">
          <LogOutIcon size={20} className="mr-3" />
          {!collapsed && <span>Logout</span>}
        </div>
      </div>
    </aside>;
}