import { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Link } from 'react-router-dom';
import { Match } from '@/types/sports';
import { fetchLiveMatches } from '@/api/sportsApi';
import coverPhoto from '@/assets/damitv-cover.jpeg';

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
  
  // Fetch live matches with posters
  useEffect(() => {
    const loadMatches = async () => {
      try {
        const liveMatches = await fetchLiveMatches();
        
        // Only show popular/important matches with posters
        const featuredMatches = liveMatches.filter(
          match => match.popular === true && match.poster && match.poster.trim() !== ''
        );
        
        console.log(`⭐ Found ${featuredMatches.length} popular/featured matches with posters out of ${liveMatches.length} total`);
        setMatchesWithPosters(featuredMatches.slice(0, 8)); // Limit to 8 featured matches
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
              <div className="relative min-h-[350px] flex items-center overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${posterUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/20" />
                
                {/* SEO-optimized header text */}
                <div className="relative z-10 p-8 max-w-2xl">
                  <h2 className="text-xl md:text-2xl font-semibold text-white/90 mb-2 drop-shadow-lg">
                    Watch Live Sports Streaming Free - Champions League, Premier League, La Liga & More
                  </h2>
                  <p className="text-sm md:text-base text-white/80 drop-shadow-md">
                    Free HD sports streaming for football, basketball, tennis and all major leagues worldwide
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Match slides - clickable
            <Link
              key={slide.id}
              to={`/match/${slide.category}/${slide.id}`}
              className="relative flex-[0_0_100%] min-w-0 cursor-pointer group"
            >
              <div className="relative min-h-[350px] flex items-center overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${posterUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 via-40% to-black/20" />
                <div className="relative z-10 p-8 max-w-xl">
                  <div className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-bold rounded mb-3">
                    LIVE NOW
                  </div>
                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-primary transition-colors drop-shadow-2xl">
                    {slide.title}
                  </h2>
                  <p className="text-base md:text-lg text-white drop-shadow-xl">
                    {slide.category && (
                      <span className="uppercase font-semibold">{slide.category}</span>
                    )}
                    {slide.teams?.home?.name && slide.teams?.away?.name && (
                      <span className="block mt-2 text-sm opacity-95">
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
        <div className="absolute bottom-4 left-8 flex gap-2 z-20">
          {allSlides.map((_, index) => (
            <button
              key={index}
              className={`h-1 rounded-full transition-all ${
                index === selectedIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75 w-8'
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
