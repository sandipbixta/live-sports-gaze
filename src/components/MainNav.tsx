
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { MenuIcon, Home, CalendarDays, Tv2, Radio, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const MainNav = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { title: "Home", icon: Home, path: "/" },
    { title: "Schedule", icon: CalendarDays, path: "/schedule" },
    { title: "Live", icon: Tv2, path: "/live" },
    { title: "Channels", icon: Radio, path: "/channels" }
  ];

  return (
    <div className="flex items-center gap-6">
      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2 md:hidden">
              <MenuIcon className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-[#151922] text-white w-[250px] p-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-[#343a4d]">
                <Link to="/" onClick={() => setIsOpen(false)}>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#1EAEDB] bg-clip-text text-transparent">
                    DAMITV
                  </h1>
                </Link>
              </div>
              
              <div className="py-4 flex-1">
                {menuItems.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path} 
                    className="flex items-center px-4 py-3 hover:bg-[#242836]"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
              
              <div className="p-4 border-t border-[#343a4d]">
                <Button className="w-full bg-[#9b87f5] hover:bg-[#8a75e8] text-white">
                  Sign In
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ) : null}
      
      <Link to="/">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#1EAEDB] bg-clip-text text-transparent">
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
    </div>
  );
};

export default MainNav;
