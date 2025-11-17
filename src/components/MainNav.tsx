
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Home, CalendarDays, Tv2, Radio, Info, Phone, Download } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation, useNavigate } from "react-router-dom";
import Clock from "./Clock";
import ThemeToggle from "./ThemeToggle";
import PushNotifications from "./PushNotifications";
import { Button } from "./ui/button";

const MainNav = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { title: "Home", icon: Home, path: "/" },
    { title: "Schedule", icon: CalendarDays, path: "/schedule" },
    { title: "Live", icon: Tv2, path: "/live" },
    { title: "Channels", icon: Radio, path: "/channels" },
    { title: "About", icon: Info, path: "/about" },
    { title: "Contact", icon: Phone, path: "/contact" }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex items-center gap-6 w-full md:w-auto">
      <button onClick={() => navigate("/")} className="cursor-pointer">
        <h1 className="text-2xl font-bold text-foreground">
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
                  "bg-transparent hover:bg-accent text-foreground cursor-pointer",
                  location.pathname === item.path && "bg-accent"
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/install")}
          className="text-foreground hover:bg-accent"
          title="Install DamiTV App"
        >
          <Download className="h-4 w-4" />
        </Button>
        <PushNotifications />
        <ThemeToggle />
        <Clock />
      </div>
    </div>
  );
};

export default MainNav;
