
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, CalendarDays, Tv2, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const MobileBottomNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const navItems = [
    { title: "Home", icon: Home, path: "/" },
    { title: "Schedule", icon: CalendarDays, path: "/schedule" },
    { title: "Live", icon: Tv2, path: "/live" },
    { title: "Channels", icon: Radio, path: "/channels" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#151922] border-t border-[#343a4d] shadow-lg">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center py-1 w-full"
            >
              <item.icon 
                className={cn(
                  "h-5 w-5 transition-colors", 
                  isActive ? "text-white" : "text-gray-400"
                )} 
              />
              <span className={cn(
                "text-xs mt-1 transition-colors",
                isActive ? "text-white font-medium" : "text-gray-400"
              )}>
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
