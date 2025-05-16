
import React from 'react';

const LoadingFallback: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#1A1F2C] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9b87f5] mx-auto"></div>
        <p className="mt-4 text-gray-300">Loading content...</p>
      </div>
    </div>
  );
};

export default LoadingFallback;
