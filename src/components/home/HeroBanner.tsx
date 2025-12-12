import { Link } from 'react-router-dom';
import { Play, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroBanner = () => {
  return (
    <div className="relative w-full h-[280px] md:h-[360px] rounded-2xl overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background to-orange-500/20" />
      
      {/* Animated Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-1/3 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl" />
      
      {/* Sport Icons Decoration */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 opacity-60">
        <div className="text-5xl animate-bounce" style={{ animationDelay: '0s' }}>⚽</div>
        <div className="text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>🏀</div>
        <div className="text-5xl animate-bounce" style={{ animationDelay: '0.4s' }}>🏈</div>
        <div className="text-5xl animate-bounce" style={{ animationDelay: '0.6s' }}>🎾</div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-10 lg:px-14">
        <p className="text-muted-foreground text-sm md:text-base mb-2 font-medium">
          Your Gateway to Live Sports
        </p>
        <h1 className="text-foreground text-3xl md:text-4xl lg:text-5xl font-bold mb-1">
          Watch Your Favourite
        </h1>
        <h2 className="text-primary text-4xl md:text-5xl lg:text-6xl font-black mb-4">
          Sports <span className="text-destructive">LIVE!</span>
        </h2>
        <p className="text-muted-foreground text-sm md:text-base mb-6 max-w-md">
          Stream football, basketball, tennis, and more — all in HD quality, completely free.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/live">
            <Button size="lg" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold gap-2">
              <Play className="w-5 h-5 fill-current" />
              Watch Now
            </Button>
          </Link>
          <Link to="/channels">
            <Button size="lg" variant="outline" className="border-border hover:bg-secondary gap-2">
              <Tv className="w-5 h-5" />
              Browse Channels
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
