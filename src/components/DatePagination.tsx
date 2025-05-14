
import React from 'react';
import { format, addDays } from 'date-fns';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from './ui/pagination';

interface DatePaginationProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  navigateDate: (days: number) => void;
}

const DatePagination: React.FC<DatePaginationProps> = ({ currentDate, setCurrentDate, navigateDate }) => {
  // Generate dates for pagination
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentDate, i - 3);
    return {
      date,
      formatted: format(date, 'MMM d'),
      isToday: format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
    };
  });

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={() => navigateDate(-1)} className="cursor-pointer text-white hover:bg-[#343a4d]" />
        </PaginationItem>
        
        {dates.map((date, i) => (
          <PaginationItem key={i} className="hidden md:block">
            <PaginationLink 
              className={`cursor-pointer ${date.isToday ? 'bg-[#9b87f5] text-white' : 'text-white hover:bg-[#343a4d]'}`}
              onClick={() => setCurrentDate(date.date)}
            >
              {date.formatted}
            </PaginationLink>
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext onClick={() => navigateDate(1)} className="cursor-pointer text-white hover:bg-[#343a4d]" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default DatePagination;
