import React from 'react';
import { format, isSameDay, startOfDay } from 'date-fns';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
} from './ui/pagination';
import { Calendar } from './ui/calendar';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '../hooks/use-mobile';

interface DatePaginationProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  navigateDate: (days: number) => void;
  availableDates?: Date[]; // Optional: dates that have matches
}

const DatePagination: React.FC<DatePaginationProps> = ({ 
  currentDate, 
  setCurrentDate, 
  navigateDate,
  availableDates 
}) => {
  const isMobile = useIsMobile();
  const today = startOfDay(new Date());
  
  // If available dates provided, use them; otherwise show dates around current
  const sortedDates = availableDates 
    ? [...availableDates].sort((a, b) => a.getTime() - b.getTime())
    : [];
  
  // Find current index in available dates
  const currentIndex = sortedDates.findIndex(d => isSameDay(d, currentDate));
  
  // Get dates to display
  const getDatesToShow = () => {
    if (!availableDates || availableDates.length === 0) {
      // Fallback: show 5 days around current date
      const datesCount = isMobile ? 3 : 5;
      const offset = isMobile ? 1 : 2;
      return Array.from({ length: datesCount }, (_, i) => {
        const dayOffset = i - offset;
        const date = new Date(currentDate);
        date.setDate(date.getDate() + dayOffset);
        return startOfDay(date);
      });
    }
    
    // Show available dates with matches
    const displayCount = isMobile ? 3 : 5;
    const halfCount = Math.floor(displayCount / 2);
    
    let startIndex = Math.max(0, currentIndex - halfCount);
    let endIndex = Math.min(sortedDates.length, startIndex + displayCount);
    
    // Adjust if we're near the end
    if (endIndex - startIndex < displayCount && startIndex > 0) {
      startIndex = Math.max(0, endIndex - displayCount);
    }
    
    return sortedDates.slice(startIndex, endIndex);
  };
  
  const datesToShow = getDatesToShow();
  
  // Navigation handlers for available dates
  const handlePrev = () => {
    if (availableDates && availableDates.length > 0 && currentIndex > 0) {
      setCurrentDate(sortedDates[currentIndex - 1]);
    } else if (!availableDates) {
      navigateDate(-1);
    }
  };
  
  const handleNext = () => {
    if (availableDates && availableDates.length > 0 && currentIndex < sortedDates.length - 1) {
      setCurrentDate(sortedDates[currentIndex + 1]);
    } else if (!availableDates) {
      navigateDate(1);
    }
  };
  
  const canGoPrev = availableDates ? currentIndex > 0 : true;
  const canGoNext = availableDates ? currentIndex < sortedDates.length - 1 : true;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
      <Pagination className="w-full">
        <PaginationContent className="flex w-full justify-between bg-card rounded-lg p-2">
          <PaginationItem>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handlePrev}
              disabled={!canGoPrev}
              className="cursor-pointer text-foreground hover:bg-muted disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </PaginationItem>
          
          <div className="flex items-center justify-center flex-1 gap-1 overflow-x-auto">
            {datesToShow.map((date, i) => {
              const isToday = isSameDay(date, today);
              const isCurrent = isSameDay(date, currentDate);
              
              return (
                <PaginationItem key={i} className="flex-1 max-w-40">
                  <PaginationLink 
                    className={cn(
                      "cursor-pointer w-full justify-center text-center px-1 py-2 rounded-md transition-all",
                      isToday ? "bg-primary text-primary-foreground" : 
                      isCurrent ? "bg-muted text-foreground" : 
                      "text-foreground hover:bg-muted"
                    )}
                    onClick={() => setCurrentDate(date)}
                  >
                    <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                      {format(date, 'EEE, MMM d')}
                    </span>
                  </PaginationLink>
                </PaginationItem>
              );
            })}
          </div>
          
          <PaginationItem>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleNext}
              disabled={!canGoNext}
              className="cursor-pointer text-foreground hover:bg-muted disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="bg-card border-border text-foreground hover:bg-muted whitespace-nowrap">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(currentDate, 'MMMM d, yyyy')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-card border-border" align="end">
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={(date) => date && setCurrentDate(startOfDay(date))}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
            disabled={availableDates ? (date) => !availableDates.some(d => isSameDay(d, date)) : undefined}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePagination;
