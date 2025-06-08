
import { Button } from '@/components/ui/button';
import { Video, Film } from 'lucide-react';

interface TabsNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsNavigation = ({ activeTab, setActiveTab }: TabsNavigationProps) => {
  return (
    <div className="bg-sports-card sticky top-0 z-50 border-b border-sports shadow-md">
      <div className="container mx-auto">
        <div className="flex overflow-x-auto scrollbar-none">
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab('stream')}
            className={`py-4 px-6 rounded-none flex-shrink-0 ${activeTab === 'stream' ? 'border-b-2 border-[#ff5a36] text-white' : 'text-gray-400'}`}
          >
            <Video className="h-4 w-4 mr-2" /> Stream
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab('highlights')}
            className={`py-4 px-6 rounded-none flex-shrink-0 ${activeTab === 'highlights' ? 'border-b-2 border-[#ff5a36] text-white' : 'text-gray-400'}`}
          >
            <Film className="h-4 w-4 mr-2" /> Highlights
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TabsNavigation;
