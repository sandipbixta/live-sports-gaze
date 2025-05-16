
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
  if (!sources || sources.length === 0) {
    return null;
  }

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
    </div>
  );
};

export default StreamSources;
