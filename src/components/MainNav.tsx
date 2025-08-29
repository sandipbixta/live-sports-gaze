
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Home, CalendarDays, Tv2, Radio, Mail } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation, useNavigate } from "react-router-dom";
import Clock from "./Clock";
import ThemeToggle from "./ThemeToggle";
import PushNotifications from "./PushNotifications";

const MainNav = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { title: "Home", icon: Home, path: "/" },
    { title: "IPTV Channels", icon: Tv2, path: "/channels" },
    { title: "Schedule", icon: CalendarDays, path: "/schedule" },
    { title: "Live Sports", icon: Radio, path: "/live" },
    { title: "News", icon: Mail, path: "/news" }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex items-center gap-6 w-full md:w-auto">
      <button onClick={() => navigate("/")} className="cursor-pointer">
        <h1 className="text-2xl font-bold text-white">
          DAMITV
        </h1>
      </button>
      
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList>
          {menuItems.map((item) => (
            <NavigationMenuItem key={item.path}>
              <NavigationMenuLink 
                className={cn(
                  navigationMenuTriggerStyle(),
                  "bg-transparent hover:bg-[#242836] text-white cursor-pointer",
                  location.pathname === item.path && "bg-[#242836]"
                )}
                onClick={() => handleNavigate(item.path)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      
      <div className="hidden md:flex items-center gap-2 ml-auto">
        <PushNotifications />
        <ThemeToggle />
        <Clock />
      </div>
    </div>
  );
};

export default MainNav;
