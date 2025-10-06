import React from 'react';
import { Loader2 } from 'lucide-react';

interface BufferIndicatorProps {
  isBuffering: boolean;
  className?: string;
}

const BufferIndicator: React.FC<BufferIndicatorProps> = ({ isBuffering, className = '' }) => {
  if (!isBuffering) return null;

  return (
    <div className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 ${className}`}>
      <div className="bg-black/80 rounded-lg px-6 py-4 flex items-center gap-3">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        <div className="text-white">
          <div className="font-medium">Buffering...</div>
          <div className="text-xs text-white/70">Please wait</div>
        </div>
      </div>
    </div>
  );
};

export default BufferIndicator;
