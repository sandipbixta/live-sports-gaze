
import React, { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';

const PopupAd = () => {
  const [isOpen, setIsOpen] = useState(false);
  const adContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Show popup after a short delay
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!adContainerRef.current || !isOpen) return;
    
    // Clear any previous content
    adContainerRef.current.innerHTML = '';
    
    // Create script element with the popup ad code
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//monkeyhundredsarmed.com/ae/f7/eb/aef7eba12c46ca91518228f813db6ce5.js';
    adContainerRef.current.appendChild(script);
    
    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 bg-[#151922] border-[#343a4d]">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute right-2 top-2 rounded-full bg-[#242836] p-1.5 text-gray-400 hover:text-white z-10"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div 
          ref={adContainerRef} 
          className="ad-container w-full min-h-[250px] flex items-center justify-center"
          data-ad-type="popup"
        />
      </DialogContent>
    </Dialog>
  );
};

export default PopupAd;
