import { useEffect, useRef } from 'react';
import { trackAdEvent } from '@/utils/adTracking';

interface NativeAdInlineProps {
  placement: string;
}

export const NativeAdInline = ({ placement }: NativeAdInlineProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current || !adRef.current) return;

    try {
      // Adsterra native ad code
      const atOptions = {
        'key': 'a873bc1d3d203f2f13c32a99592441b8',
        'format': 'iframe',
        'height': 90,
        'width': 728,
        'params': {}
      };

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `//www.topcreativeformat.com/a873bc1d3d203f2f13c32a99592441b8/invoke.js`;
      
      script.onload = () => {
        console.log(`✅ Native inline ad loaded: ${placement}`);
        trackAdEvent('impression', 'native', placement);
      };

      adRef.current.appendChild(script);
      hasLoaded.current = true;
    } catch (error) {
      console.error('Error loading native inline ad:', error);
    }
  }, [placement]);

  return (
    <div className="w-full flex justify-center my-4">
      <div 
        ref={adRef}
        className="min-h-[90px] flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden"
      />
    </div>
  );
};
