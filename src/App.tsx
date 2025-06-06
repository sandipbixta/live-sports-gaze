
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Match from "./pages/Match";
import Schedule from "./pages/Schedule";
import Live from "./pages/Live";
import Channels from "./pages/Channels";
import ChannelPlayer from "./pages/ChannelPlayer";
import News from "./pages/News";
import DMCANotice from "./pages/DMCANotice";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/match/:sportId/:matchId" element={<Match />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/live" element={<Live />} />
            <Route path="/channels" element={<Channels />} />
            <Route path="/channel/:country/:channelId" element={<ChannelPlayer />} />
            <Route path="/news" element={<News />} />
            <Route path="/dmca" element={<DMCANotice />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
