
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
import { MenuIcon, Home, CalendarDays, LiveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

const MainNav = () => {
  return (
    <div className="flex items-center gap-6">
      <Button variant="ghost" size="icon" className="mr-2 md:hidden">
        <MenuIcon className="h-6 w-6" />
      </Button>
      
      <Link to="/">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#1EAEDB] bg-clip-text text-transparent">
          DAMITV
        </h1>
      </Link>
      
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link to="/">
              <NavigationMenuLink className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-[#242836] text-white"
              )}>
                <Home className="mr-2 h-4 w-4" />
                Home
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <Link to="/schedule">
              <NavigationMenuLink className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent hover:bg-[#242836] text-white"
              )}>
                <CalendarDays className="mr-2 h-4 w-4" />
                Schedule
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

export default MainNav;
