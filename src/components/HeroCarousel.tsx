import { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { manualMatches } from '@/data/manualMatches';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

export const HeroCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      duration: 30
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Get matches with images
  const matchesWithImages = manualMatches.filter(
    match => match.image && match.image.trim() !== ''
  );

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

  if (matchesWithImages.length === 0) return null;

  return (
    <div className="relative mb-6 rounded-xl overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {matchesWithImages.map((match) => (
          <div
            key={match.id}
            className="relative flex-[0_0_100%] min-w-0"
          >
            <div className="relative min-h-[350px] flex items-center">
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${match.image})` }}
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
              
              {/* Content */}
              <div className="relative z-10 p-8 max-w-2xl">
                <div className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full mb-3">
                  LIVE
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg">
                  {match.title}
                </h2>
                <p className="text-base md:text-lg text-gray-100 drop-shadow-md mb-4">
                  {match.seo.description}
                </p>
                <Link to={`/manual-match/${match.id}`}>
                  <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg">
                    <Play className="h-5 w-5" />
                    Watch Now
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots Navigation */}
      {matchesWithImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {matchesWithImages.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === selectedIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
