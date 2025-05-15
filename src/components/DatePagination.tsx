
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
import { Calendar } from './ui/calendar';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="flex items-center justify-between w-full">
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
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="ml-auto bg-[#242836] border-[#343a4d] text-white hover:bg-[#343a4d]">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(currentDate, 'MMMM d, yyyy')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-[#242836] border-[#343a4d]" align="end">
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={(date) => date && setCurrentDate(date)}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePagination;
