import React from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface Stream {
  id: string;
  source: string;
  streamNo?: number;
  name?: string;      // Channel name from API
  language?: string;  // Language from API (English, Spanish, etc.)
  hd?: boolean;
}

interface StreamSourcesProps {
  streams: Stream[];
  activeSource: string | null;
  onSourceChange: (source: string, id: string, streamNo?: number) => void;
}

export const StreamSources: React.FC<StreamSourcesProps> = ({
  streams,
  activeSource,
  onSourceChange,
}) => {
  // Format streams in a consistent structure
  const allAvailableStreams = streams.map((stream, index) => ({
    stream,
    sourceKey: `${stream.source}/${stream.id}`,
    index,
  }));

  // No streams available
  if (!allAvailableStreams || allAvailableStreams.length === 0) {
    return (
      <div className="mt-6 text-center py-8">
        <p className="text-gray-400">No streams available for this match.</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-white mb-4">Stream Links</h3>

      {/* Stream buttons aligned slightly right with video */}
      <div className="flex flex-wrap gap-3 ml-4">
        {allAvailableStreams.map(({ stream, index }) => {
          const streamKey = `${stream.source}/${stream.id}/${stream.streamNo || index}`;
          const baseKey = `${stream.source}/${stream.id}`;
          const isActive = activeSource === streamKey || activeSource === baseKey;

          // Use API-provided names only
          const streamName = stream.name || stream.language || "Unknown Stream";

          return (
            <Button
              key={streamKey}
              variant="outline"
              className="min-w-[120px] bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-600"
              onClick={() =>
                onSourceChange(stream.source, stream.id, stream.streamNo || index)
              }
            >
              <Play className="w-4 h-4 mr-2" />
              {streamName}
              {stream.hd && (
                <span className="ml-2 text-xs bg-red-600 px-1 rounded">HD</span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
