
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// Lazy load all pages for better performance
const Index = React.lazy(() => import("./pages/Index"));
const Match = React.lazy(() => import("./pages/Match"));
const Schedule = React.lazy(() => import("./pages/Schedule"));
const Live = React.lazy(() => import("./pages/Live"));
const Channels = React.lazy(() => import("./pages/Channels"));
const ChannelPlayer = React.lazy(() => import("./pages/ChannelPlayer"));
const News = React.lazy(() => import("./pages/News"));
const DMCANotice = React.lazy(() => import("./pages/DMCANotice"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Optimized query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  }
});

// Loading fallback component
const PageLoadingFallback = () => (
  <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9b87f5]"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <React.Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/match/:sportId/:matchId" element={<Match />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/live" element={<Live />} />
              <Route path="/channels" element={<Channels />} />
              <Route path="/channel/:country/:channelId" element={<ChannelPlayer />} />
              <Route path="/news" element={<News />} />
              <Route path="/dmca" element={<DMCANotice />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </React.Suspense>
        </TooltipProvider>
      </BrowserRouter>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
