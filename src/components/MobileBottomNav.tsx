
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, CalendarDays, Tv2, Tv, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  
  const navItems = [
    { title: "Home", icon: Home, path: "/" },
    { title: "Schedule", icon: CalendarDays, path: "/schedule" },
    { title: "Live", icon: Tv2, path: "/live" },
    { title: "Channels", icon: Tv, path: "/channels" },
    { title: "Download", icon: Download, path: "/install" }
  ];

  const handleNavigate = (path: string) => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border shadow-lg" aria-label="Mobile navigation">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className="flex flex-col items-center justify-center py-1 w-full"
              aria-label={`Navigate to ${item.title}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon 
                className={cn(
                  "h-5 w-5 transition-colors", 
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
                aria-hidden="true"
              />
              <span className={cn(
                "text-xs mt-1 transition-colors",
                isActive ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {item.title}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
