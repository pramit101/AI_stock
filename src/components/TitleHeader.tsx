import { MenuIcon } from "lucide-react";
interface HeaderProps {
  toggleSidebar: () => void;
  title: string;
}
export function TitleHeader({ toggleSidebar, title }: HeaderProps) {
  return (
    <header className="bg-white w-full h-20 flex items-center shadow-md ">
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
      >
        <MenuIcon size={20} />
      </button>
      <h1 className="text-4xl flex-1 text-center">{title}</h1>
    </header>
  );
}
