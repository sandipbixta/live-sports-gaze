
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import AccessibilityProvider from "./providers/AccessibilityProvider";
import LoadingFallback from "./components/LoadingFallback";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Match = lazy(() => import("./pages/Match"));
const Schedule = lazy(() => import("./pages/Schedule"));
const Live = lazy(() => import("./pages/Live"));
const Channels = lazy(() => import("./pages/Channels"));
const DMCANotice = lazy(() => import("./pages/DMCANotice"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Configure React Query with retries for network resilience
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attempt => Math.min(attempt > 1 ? 2000 : 1000, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AccessibilityProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ErrorBoundary>
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/match/:sportId/:matchId" element={<Match />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/live" element={<Live />} />
                <Route path="/channels" element={<Channels />} />
                <Route path="/dmca" element={<DMCANotice />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </AccessibilityProvider>
  </QueryClientProvider>
);

export default App;
