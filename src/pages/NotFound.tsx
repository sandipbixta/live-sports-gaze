
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-sports-dark text-sports-light flex flex-col justify-center items-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-[#fa2d04] to-[#ff6347] bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-xl sm:text-2xl font-semibold mt-3 sm:mt-4 mb-1 sm:mb-2 text-white">Page Not Found</h2>
          <p className="text-gray-400 text-sm sm:text-base">
            The page you're looking for doesn't exist or has been removed.
          </p>
        </div>
        
        <Button className="bg-[#fa2d04] hover:bg-[#e02703] text-white" asChild>
          <Link to="/" className="flex items-center">
            Back to Home <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
