
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from "@/components/ui/toaster"

import Index from './pages/Index';
import Live from './pages/Live';
import Schedule from './pages/Schedule';
import Channels from './pages/Channels';
import Movies from './pages/Movies';
import News from './pages/News';
import DMCANotice from './pages/DMCANotice';
import SpecialOffer from './pages/SpecialOffer';
import Match from './pages/Match';
import ManualMatchPlayer from './pages/ManualMatchPlayer';
import ChannelPlayer from './pages/ChannelPlayer';
import MoviePlayer from './pages/MoviePlayer';
import NotFound from './pages/NotFound';
import Football from './pages/Football';
import Basketball from './pages/Basketball';

const queryClient = new QueryClient();

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="min-h-screen bg-black text-white">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/live" element={<Live />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/channels" element={<Channels />} />
              <Route path="/football" element={<Football />} />
              <Route path="/basketball" element={<Basketball />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/news" element={<News />} />
              <Route path="/dmca" element={<DMCANotice />} />
              <Route path="/special-offer" element={<SpecialOffer />} />
              <Route path="/match/:matchId" element={<Match />} />
              <Route path="/manual-match/:matchId" element={<ManualMatchPlayer />} />
              <Route path="/channel/:channelId" element={<ChannelPlayer />} />
              <Route path="/movie/:movieId" element={<MoviePlayer />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
