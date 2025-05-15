
import React from "react";
import { Link } from "react-router-dom";
import { Home, CalendarDays, Tv2, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const MobileBottomNav = () => {
  const navItems = [
    { title: "Home", icon: Home, path: "/" },
    { title: "Schedule", icon: CalendarDays, path: "/schedule" },
    { title: "Live", icon: Tv2, path: "/live" },
    { title: "Channels", icon: Radio, path: "/channels" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#151922] border-t border-[#343a4d]">
      <div className="flex justify-around items-center h-14">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col items-center justify-center py-1 w-full"
          >
            <item.icon className="h-5 w-5 text-gray-300" />
            <span className="text-xs text-gray-300 mt-1">{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNav;
