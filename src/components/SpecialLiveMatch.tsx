
import React from 'react';
import { Link } from 'react-router-dom';
import { AspectRatio } from './ui/aspect-ratio';
import { Eye, Tv } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';

const SpecialLiveMatch = () => {
  const isMobile = useIsMobile();
  
  // Check if we should show this (for 1 hour from when it was added)
  const showUntil = new Date();
  showUntil.setHours(showUntil.getHours() + 1); // Show for 1 hour
  
  const currentTime = new Date();
  const shouldShow = currentTime < showUntil;
  
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="inline-block h-3 w-3 bg-[#ff5a36] rounded-full animate-pulse"></span>
          Live Now - Featured Match
        </h2>
        <span className="text-sm bg-[#ff5a36] text-white rounded-lg px-2 py-1 font-medium">
          LIVE
        </span>
      </div>
      
      <Link 
        to="/channels?channel=sky-sport-4-nz"
        className="block group"
      >
        <div className="relative rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-[1.02]">
          <AspectRatio ratio={21/9} className="bg-gradient-to-r from-[#1a365d] to-[#2d3748]">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 z-10"></div>
            
            {/* Live Badge */}
            <div className="absolute top-4 right-4 z-30">
              <div className="flex items-center gap-2 bg-[#ff5a36] text-white px-3 py-2 rounded-lg shadow-lg">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-bold">LIVE NOW</span>
              </div>
            </div>
            
            {/* Channel Badge */}
            <div className="absolute top-4 left-4 z-30">
              <div className="flex items-center gap-2 bg-black/70 text-white px-3 py-2 rounded-lg">
                <Tv className="w-4 h-4" />
                <span className="text-sm font-medium">Sky Sport 4 NZ</span>
              </div>
            </div>
            
            {/* Match Info - Centered */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6">
              <div className="text-center">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  UEFA Nations League
                </h3>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mb-2 mx-auto">
                      <img 
                        src="https://streamed.su/api/images/badge/portugal.webp" 
                        alt="Portugal" 
                        className="w-12 h-12 md:w-16 md:h-16 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full bg-[#ff0000] rounded-full flex items-center justify-center"><span class="font-bold text-white text-lg">POR</span></div>';
                        }}
                      />
                    </div>
                    <span className="text-white font-bold text-lg">Portugal</span>
                  </div>
                  
                  <div className="text-white text-2xl md:text-3xl font-bold mx-4">VS</div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mb-2 mx-auto">
                      <img 
                        src="https://streamed.su/api/images/badge/spain.webp" 
                        alt="Spain" 
                        className="w-12 h-12 md:w-16 md:h-16 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full bg-[#ffcc00] rounded-full flex items-center justify-center"><span class="font-bold text-red-600 text-lg">ESP</span></div>';
                        }}
                      />
                    </div>
                    <span className="text-white font-bold text-lg">Spain</span>
                  </div>
                </div>
                
                <div className="bg-[#ff5a36] text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg group-hover:bg-[#e64d2e] transition-colors">
                  🔴 WATCH LIVE NOW
                </div>
              </div>
            </div>
          </AspectRatio>
        </div>
      </Link>
    </div>
  );
};

export default SpecialLiveMatch;
