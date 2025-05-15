
import React from 'react';
import MainNav from '../MainNav';
import { Button } from '../ui/button';

const AppHeader: React.FC = () => {
  return (
    <header className="bg-[#151922] shadow-md">
      <div className="container mx-auto py-4 px-4">
        <div className="flex justify-between items-center">
          <MainNav />
          <div className="hidden md:flex items-center space-x-4">
            <Button className="bg-[#fa2d04] hover:bg-[#e02903] text-white">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
