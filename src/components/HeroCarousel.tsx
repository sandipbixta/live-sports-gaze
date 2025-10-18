import { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Link } from 'react-router-dom';
import { Match } from '@/types/sports';
import { ManualMatch } from '@/types/manualMatch';
import { fetchAllMatches } from '@/api/sportsApi';
import { getFeaturedMatches } from '@/utils/featuredMatchFilter';
import { filterMatchesWithImages } from '@/utils/matchImageFilter';
import { isMatchLive } from '@/utils/matchUtils';
import { ViewerCount } from './ViewerCount';
import { Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import coverPhoto from '@/assets/damitv-cover.jpeg';
import { manualMatches } from '@/data/manualMatches';
import { isPopularMatch } from '@/utils/popularTeamsFilter';

const POSTER_BASE_URL = 'https://streamed.pk';

export const HeroCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      duration: 30
    },
    [Autoplay({ delay: 6000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [matchesWithPosters, setMatchesWithPosters] = useState<Match[]>([]);
  
  // Static cover photo slide
  const coverSlide = {
    id: 'damitv-cover',
    title: 'DamiTV - Your Home for Live Sports',
    category: 'Featured',
    poster: coverPhoto,
    isCover: true
  };
  
  // Helper to convert relative poster URL to absolute
  const getAbsolutePosterUrl = (posterPath: string) => {
    if (!posterPath) return '';
    if (posterPath.startsWith('http')) return posterPath;
    return `${POSTER_BASE_URL}${posterPath}`;
  };
  
  // Fetch featured matches from all sports categories (UFC, Wrestling, Cricket, AFL, etc.)
  useEffect(() => {
    const loadMatches = async () => {
      try {
        const allMatches = await fetchAllMatches();
        
        // Get featured matches from all sports (major competitions, popular teams)
        const featuredMatches = getFeaturedMatches(allMatches, 10);
        
        // Only show matches with images on home page
        const matchesWithImages = filterMatchesWithImages(featuredMatches);
        
        // Get popular manual matches with images that are LIVE
        const popularManualMatches = manualMatches
          .filter(match => match.visible && match.image && isPopularMatch(match.title))
          .filter(match => Date.now() >= new Date(match.date).getTime()) // Only LIVE matches
          .map((match): Match => ({
            id: match.id,
            title: match.title,
            category: match.seo?.category || 'Sports',
            date: new Date(match.date).getTime(),
            poster: match.image,
            popular: true,
            teams: {
              home: { name: match.teams?.home || '' },
              away: { name: match.teams?.away || '' }
            },
            sources: []
          }));
        
        // Combine API matches with popular manual matches
        const allFeaturedMatches = [...matchesWithImages, ...popularManualMatches];
        
        console.log(`⭐ Found ${allFeaturedMatches.length} featured matches with images (${matchesWithImages.length} from API, ${popularManualMatches.length} manual)`);
        setMatchesWithPosters(allFeaturedMatches);
      } catch (error) {
        console.error('Error loading matches for carousel:', error);
      }
    };
    
    loadMatches();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  // Combine cover slide with match slides
  const allSlides = [coverSlide as any, ...matchesWithPosters];

  if (allSlides.length === 0) return null;

  return (
    <div className="relative mb-6 rounded-xl overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {allSlides.map((slide) => {
          const isCover = (slide as any).isCover;
          const posterUrl = isCover ? slide.poster : getAbsolutePosterUrl(slide.poster || '');
          
          return isCover ? (
            // Cover photo slide - not clickable
            <div
              key={slide.id}
              className="relative flex-[0_0_100%] min-w-0"
            >
              <div className="relative min-h-[200px] sm:min-h-[280px] md:min-h-[350px] flex items-center overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${posterUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/20" />
                
                {/* SEO-optimized header text - positioned at bottom */}
                <div className="absolute bottom-0 left-0 right-0 z-10 p-3 sm:p-4 md:p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <h2 className="text-[10px] sm:text-xs md:text-sm font-medium text-white/95 mb-0.5 sm:mb-1 drop-shadow-lg leading-tight">
                    Watch Live Sports Streaming Free - Champions League, Premier League, La Liga & More
                  </h2>
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-white/75 drop-shadow-md leading-tight">
                    Free HD sports streaming for football, basketball, tennis and all major leagues worldwide
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Match slides - clickable
            <Link
              key={slide.id}
              to={manualMatches.some(m => m.id === slide.id) ? `/manual-match/${slide.id}` : `/match/${slide.category}/${slide.id}`}
              className="relative flex-[0_0_100%] min-w-0 cursor-pointer group"
            >
              <div className="relative min-h-[200px] sm:min-h-[280px] md:min-h-[350px] flex items-center overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${posterUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 via-40% to-black/20" />
                <div className="relative z-10 p-3 sm:p-5 md:p-8 max-w-xl">
                  <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 mb-2 sm:mb-3">
                    <div className="inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1 bg-red-600 text-white text-[10px] sm:text-xs font-bold rounded-full">
                      {isMatchLive(slide) ? 'LIVE NOW' : 'UPCOMING'}
                    </div>
                    {isMatchLive(slide) && (
                      <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-[10px] sm:text-xs font-semibold">
                        <ViewerCount matchId={slide.id} enableRealtime={true} size="sm" />
                      </div>
                    )}
                  </div>
                  <h2 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight group-hover:text-primary transition-colors drop-shadow-2xl">
                    {slide.title}
                  </h2>
                  <div className="space-y-1 sm:space-y-1.5 md:space-y-2 mb-2 sm:mb-3 md:mb-4">
                    {slide.date && (
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 text-white/90">
                        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1.5">
                          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                          <span className="text-[10px] sm:text-xs md:text-sm font-medium">
                            {format(new Date(slide.date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1.5">
                          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                          <span className="text-[10px] sm:text-xs md:text-sm font-medium">
                            {format(new Date(slide.date), 'h:mm a')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs md:text-sm lg:text-base text-white drop-shadow-xl">
                    {slide.category && (
                      <span className="uppercase font-semibold">{slide.category}</span>
                    )}
                    {slide.teams?.home?.name && slide.teams?.away?.name && (
                      <span className="block mt-1 sm:mt-1.5 md:mt-2 text-[9px] sm:text-[10px] md:text-xs opacity-95">
                        {slide.teams.home.name} vs {slide.teams.away.name}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Dots Navigation */}
      {allSlides.length > 1 && (
        <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-3 sm:left-5 md:left-8 flex gap-1 sm:gap-1.5 md:gap-2 z-20">
          {allSlides.map((_, index) => (
            <button
              key={index}
              className={`h-0.5 sm:h-1 rounded-full transition-all ${
                index === selectedIndex
                  ? 'bg-white w-6 sm:w-7 md:w-8'
                  : 'bg-white/50 hover:bg-white/75 w-6 sm:w-7 md:w-8'
              }`}
              onClick={(e) => {
                e.preventDefault();
                emblaApi?.scrollTo(index);
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
