
import { Badge } from '@/components/ui/badge';
import { Source } from '@/types/sports';

interface StreamSourcesProps {
  sources: Source[];
  activeSource: string | null;
  onSourceChange: (source: string, id: string) => void;
  streamId: string;
}

const StreamSources = ({ 
  sources, 
  activeSource, 
  onSourceChange, 
  streamId 
}: StreamSourcesProps) => {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4 text-white">Stream Sources</h3>
      <div className="flex flex-wrap gap-3">
        {sources.map(({ source, id }) => (
          <Badge
            key={`${source}-${id}`}
            variant="source"
            className={`cursor-pointer text-sm py-2 px-4 ${
              activeSource === `${source}/${id}` 
                ? 'bg-[#343a4d] border-[#9b87f5]' 
                : ''
            }`}
            onClick={() => onSourceChange(source, id)}
          >
            {source.charAt(0).toUpperCase() + source.slice(1)}
          </Badge>
        ))}
      </div>
      
      {/* Additional Stream Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mt-4">
        {['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot'].map((source) => (
          <Badge 
            key={source}
            variant="source" 
            className="cursor-pointer text-sm py-2 px-4"
            onClick={() => onSourceChange(source, streamId)}
          >
            {source.charAt(0).toUpperCase() + source.slice(1)}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default StreamSources;
