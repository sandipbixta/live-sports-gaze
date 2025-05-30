
import { Link } from "react-router-dom";
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
import Clock from "./Clock";
import ThemeToggle from "./ThemeToggle";

const MainNav = () => {
  const isMobile = useIsMobile();

  const menuItems = [
    { title: "Home", icon: Home, path: "/" },
    { title: "Schedule", icon: CalendarDays, path: "/schedule" },
    { title: "Live", icon: Tv2, path: "/live" },
    { title: "Channels", icon: Radio, path: "/channels" },
    { title: "News", icon: Mail, path: "/news" }
  ];

  return (
    <div className="flex items-center gap-6 w-full md:w-auto">
      <Link to="/">
        <h1 className="text-2xl font-bold text-white">
          DAMITV
        </h1>
      </Link>
      
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList>
          {menuItems.map((item) => (
            <NavigationMenuItem key={item.path}>
              <Link to={item.path}>
                <NavigationMenuLink className={cn(
                  navigationMenuTriggerStyle(),
                  "bg-transparent hover:bg-[#242836] text-white"
                )}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      
      <div className="hidden md:flex items-center gap-2 ml-auto">
        <ThemeToggle />
        <Clock />
      </div>
    </div>
  );
};

export default MainNav;
