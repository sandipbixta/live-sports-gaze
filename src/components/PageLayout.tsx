
import React from 'react';
import { Link } from 'react-router-dom';
import MainNav from './MainNav';
import MobileBottomNav from './MobileBottomNav';
import { Input } from './ui/input';
import { Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAccessibility } from '@/providers/AccessibilityProvider';
import { Button } from './ui/button';
import { Globe, Wifi, WifiOff } from 'lucide-react';

interface PageLayoutProps {
  children: React.ReactNode;
  searchTerm?: string;
  onSearch?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children,
  searchTerm,
  onSearch
}) => {
  const isMobile = useIsMobile();
  const { connectionQuality, isUsingAlternateServer, toggleServer } = useAccessibility();
  
  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white">
      <header className="bg-[#151922] shadow-md">
        <div className="container mx-auto py-2 px-2">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
            <MainNav />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {onSearch && (
                <div className="relative flex items-center w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type="text" 
                    placeholder="Search events..." 
                    className="bg-[#242836] border border-[#343a4d] rounded-full py-1 sm:py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#fa2d04] w-full sm:w-64 text-white"
                    value={searchTerm}
                    onChange={onSearch}
                  />
                </div>
              )}
              
              {/* Connection quality indicator */}
              <div 
                className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border" 
                title={`Using ${isUsingAlternateServer ? 'alternate' : 'primary'} server`}
              >
                <Globe size={12} />
                <span className="hidden md:inline">
                  {isUsingAlternateServer ? 'Alternate' : 'Primary'} Server
                </span>
                {connectionQuality === 'good' && <Wifi className="text-green-400" size={12} />}
                {connectionQuality === 'fair' && <Wifi className="text-amber-400" size={12} />}
                {connectionQuality === 'poor' && <WifiOff className="text-red-400" size={12} />}
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                title="Switch servers if you're having trouble accessing content"
                onClick={toggleServer}
                className="hidden sm:flex text-xs border border-[#343a4d] bg-[#242836] hover:bg-[#2a2f3f]"
              >
                Switch Server
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-4 px-2 pb-16 md:pb-4">
        {children}
      </main>
      
      <footer className="bg-[#151922] text-gray-300 py-6 mt-10 pb-20 md:pb-6">
        <div className="container mx-auto px-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold text-white mb-2">DAMITV</h4>
              <p className="text-xs">Your premium destination for live sports streaming.</p>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-2">Sports</h5>
              <ul className="space-y-1 text-xs">
                <li>
                  <Link to="/" className="flex items-center gap-1 hover:text-white">
                    <span className="i-lucide-football w-3 h-3"></span>
                    Football
                  </Link>
                </li>
                <li>
                  <Link to="/" className="flex items-center gap-1 hover:text-white">
                    <span className="i-lucide-basketball w-3 h-3"></span>
                    Basketball
                  </Link>
                </li>
                <li>
                  <Link to="/">Tennis</Link>
                </li>
                <li>
                  <Link to="/">Racing</Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-2">Help</h5>
              <ul className="space-y-1 text-xs">
                <li>
                  <Link to="/">FAQ</Link>
                </li>
                <li>
                  <Link to="/">Contact Us</Link>
                </li>
                <li>
                  <Link to="/">Terms of Service</Link>
                </li>
                <li>
                  <Link to="/">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/dmca">DMCA Notice</Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-2">Follow Us</h5>
              <div className="flex space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#343a4d] flex items-center justify-center">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                </div>
                <div className="w-6 h-6 rounded-full bg-[#343a4d] flex items-center justify-center">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path></svg>
                </div>
                <div className="w-6 h-6 rounded-full bg-[#343a4d] flex items-center justify-center">
                  <span className="sr-only">YouTube</span>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd"></path></svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Disclaimer Section */}
          <div className="border-t border-[#343a4d] mt-4 pt-4">
            <h6 className="text-xs font-semibold text-white mb-1">Disclaimer:</h6>
            <p className="text-[11px] leading-tight text-gray-400">
              Our platform merely displays links to audiovisual content located on servers of third parties and provided and/or transmitted by third parties. We DO NOT host nor transmit any audiovisual content itself and DO NOT control nor influence such content. We cannot accept any liability for the content transmitted by others. Any responsibility for this content lies with those who host or transmit it. We are not affiliated nor claim to be affiliated with any of the owners of streams and/or videos. All content is copyright of their respective owner.
            </p>
          </div>
          
          <div className="border-t border-[#343a4d] mt-4 pt-4 text-center text-xs">
            <p>© 2025 DAMITV - All rights reserved</p>
            {/* Add connection control in footer for mobile */}
            {isMobile && (
              <div className="mt-2 flex justify-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleServer}
                  className="text-xs border border-[#343a4d] bg-[#242836] hover:bg-[#2a2f3f]"
                >
                  <Globe size={12} className="mr-1" />
                  Switch to {isUsingAlternateServer ? 'Primary' : 'Alternate'} Server
                </Button>
              </div>
            )}
          </div>
        </div>
      </footer>
      
      <MobileBottomNav />
    </div>
  );
};

export default PageLayout;
