
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { useDirectLinkAd } from "./hooks/useDirectLinkAd";
import { usePopunderAd } from "./hooks/usePopunderAd";
import SEOPageTracker from "./components/SEOPageTracker";
import MonetizationTracker from "./components/MonetizationTracker";
import { AdBlockerWarning } from "./components/AdBlockerWarning";
import { useAdBlockerDetection } from "./hooks/useAdBlockerDetection";

// Import pages directly instead of lazy loading to avoid module import errors
import Index from "./pages/Index";
import Match from "./pages/Match";
import Schedule from "./pages/Schedule";
import Live from "./pages/Live";
import Channels from "./pages/Channels";
import ChannelPlayer from "./pages/ChannelPlayer";
import ManualMatchPlayer from "./pages/ManualMatchPlayer";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogAdmin from "./pages/BlogAdmin";
import DMCANotice from "./pages/DMCANotice";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

// Optimized query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes (v4 uses cacheTime, not gcTime)
    }
  }
});

const App: React.FC = () => {
  // Initialize ad hooks
  useDirectLinkAd();
  usePopunderAd();

  // Detect ad blocker
  const { isAdBlockerDetected, isChecking } = useAdBlockerDetection();

  // Show ad blocker warning if detected
  if (isAdBlockerDetected && !isChecking) {
    return <AdBlockerWarning />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <BrowserRouter>
          <MonetizationTracker>
            <TooltipProvider>
              <Toaster />
              <Sonner />
            <Routes>
              <Route path="/" element={
                <SEOPageTracker pageTitle="DamiTV - Free Live Football Streaming" contentType="home">
                  <Index />
                </SEOPageTracker>
              } />
              <Route path="/match/:sportId/:matchId" element={
                <SEOPageTracker contentType="match">
                  <Match />
                </SEOPageTracker>
              } />
              <Route path="/manual-match/:matchId" element={
                <SEOPageTracker contentType="match">
                  <ManualMatchPlayer />
                </SEOPageTracker>
              } />
              <Route path="/schedule" element={
                <SEOPageTracker pageTitle="Sports Schedule - Live Matches Today" contentType="schedule">
                  <Schedule />
                </SEOPageTracker>
              } />
              <Route path="/live" element={
                <SEOPageTracker pageTitle="Live Sports Streaming Now" contentType="live">
                  <Live />
                </SEOPageTracker>
              } />
              <Route path="/channels" element={
                <SEOPageTracker pageTitle="Free Sports TV Channels" contentType="channels">
                  <Channels />
                </SEOPageTracker>
              } />
              <Route path="/channel/:country/:channelId" element={
                <SEOPageTracker contentType="channels">
                  <ChannelPlayer />
                </SEOPageTracker>
              } />
              <Route path="/blog" element={
                <SEOPageTracker pageTitle="DamiTV Blog - Sports News & Updates" contentType="blog">
                  <Blog />
                </SEOPageTracker>
              } />
              <Route path="/blog/:slug" element={
                <SEOPageTracker contentType="blog">
                  <BlogPost />
                </SEOPageTracker>
              } />
              <Route path="/blog-admin" element={<BlogAdmin />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/dmca" element={<DMCANotice />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </MonetizationTracker>
      </BrowserRouter>
    </HelmetProvider>
  </QueryClientProvider>
);
};

export default App;
