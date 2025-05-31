
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const NotFound = () => {
  // Set the proper 404 status code when this component renders
  useEffect(() => {
    // This is a client-side solution that helps some crawlers
    // Note: For full SEO compliance, server-side status code is needed
    document.title = "404 - Page Not Found | DamiTV";
    
    // Log for analytics purposes
    console.log("404 error page served", window.location.pathname);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col justify-center items-center p-4">
      <Helmet>
        <title>404 - Page Not Found | DamiTV - Free Live Football Streaming</title>
        <link rel="canonical" href="https://damitv.pro/404" />
        <meta name="description" content="The page you're looking for doesn't exist or has been moved. Return to DamiTV homepage for live sports streaming including Premier League, Champions League and more." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      
      <div className="text-center max-w-md">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-[#fa2d04] to-[#ff6347] bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-xl sm:text-2xl font-semibold mt-3 sm:mt-4 mb-1 sm:mb-2 text-black dark:text-white">Page Not Found</h2>
          <p className="text-black/60 dark:text-white/60 text-sm sm:text-base">
            The page you're looking for doesn't exist or has been removed.
          </p>
        </div>
        
        <Button className="bg-[#fa2d04] hover:bg-[#e02703] text-white" asChild>
          <Link to="/" className="flex items-center">
            Back to Home <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        
        <div className="mt-8 text-sm text-black/60 dark:text-white/60">
          <p>Popular pages:</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Link to="/live" className="text-[#ff6347] hover:underline">Live Streams</Link>
            <Link to="/channels" className="text-[#ff6347] hover:underline">TV Channels</Link>
            <Link to="/schedule" className="text-[#ff6347] hover:underline">Schedule</Link>
            <Link to="/news" className="text-[#ff6347] hover:underline">Sports News</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
