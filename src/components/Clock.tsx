
import React, { useState, useEffect } from 'react';
import { Clock as ClockIcon } from 'lucide-react';

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="flex items-center gap-2 text-white bg-[#242836] px-3 py-1 rounded-md">
      <ClockIcon className="h-4 w-4" />
      <span className="text-sm font-mono">{formatTime(time)}</span>
    </div>
  );
};

export default Clock;
