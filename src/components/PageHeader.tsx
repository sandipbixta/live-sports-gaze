
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Home, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  currentDate?: Date;
  showHomeButton?: boolean;
  showCalendar?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  currentDate,
  showHomeButton = true,
  showCalendar = false,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="text-gray-300">{subtitle}</p>
      </div>
      
      <div className="flex items-center gap-4 mt-4 md:mt-0">
        {showHomeButton && (
          <Link to="/">
            <Button variant="outline" className="text-white border-[#343a4d] hover:bg-[#343a4d] bg-transparent">
              <Home className="mr-2 h-4 w-4" /> Home
            </Button>
          </Link>
        )}
        
        {showCalendar && currentDate && (
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gray-300" />
            <span className="text-white font-medium">{format(currentDate, 'MMMM d, yyyy')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
