
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

  // Group sources by source name (Alpha, Bravo, Charlie, etc.)
  const groupedSources = sources.reduce((groups: Record<string, Source[]>, source) => {
    const groupName = source.source;
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(source);
    return groups;
  }, {});

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4 text-white">Stream Sources</h3>
      
      {/* Display grouped sources */}
      {Object.entries(groupedSources).map(([groupName, groupSources]) => (
        <div key={groupName} className="mb-4">
          <h4 className="text-md font-semibold mb-2 text-gray-300 capitalize">{groupName}</h4>
          <div className="flex flex-wrap gap-3">
            {groupSources.map((source) => (
              <Badge
                key={`${source.source}-${source.id}`}
                variant="source"
                className={`cursor-pointer text-sm py-2 px-4 ${
                  activeSource === `${source.source}/${source.id}` 
                    ? 'bg-[#343a4d] border-[#9b87f5]' 
                    : ''
                }`}
                onClick={() => onSourceChange(source.source, source.id)}
              >
                {source.id}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StreamSources;
