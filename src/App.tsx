
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// Import pages directly instead of lazy loading to avoid module import errors
import Index from "./pages/Index";
import Match from "./pages/Match";
import Schedule from "./pages/Schedule";
import Live from "./pages/Live";
import Channels from "./pages/Channels";
import ChannelPlayer from "./pages/ChannelPlayer";
import ManualMatchPlayer from "./pages/ManualMatchPlayer";
import News from "./pages/News";
import DMCANotice from "./pages/DMCANotice";
import NotFound from "./pages/NotFound";

// Optimized query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    }
  }
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <BrowserRouter>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/match/:sportId/:matchId" element={<Match />} />
              <Route path="/manual-match/:matchId" element={<ManualMatchPlayer />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/live" element={<Live />} />
              <Route path="/channels" element={<Channels />} />
              <Route path="/channel/:country/:channelId" element={<ChannelPlayer />} />
              <Route path="/news" element={<News />} />
              <Route path="/dmca" element={<DMCANotice />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;
