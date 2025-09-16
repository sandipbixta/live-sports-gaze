import React from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface Stream {
  id: string;
  source: string;
  streamNo?: number;
  name?: string;
  language?: string;
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
  // Format all streams in a consistent structure
  const allAvailableStreams = streams.map((stream, index) => ({
    stream,
    sourceKey: `${stream.source}/${stream.id}`,
    index,
  }));

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-white mb-4">Stream Links</h3>

      {/* Stream buttons */}
<div className="flex flex-wrap gap-3 ml-4">
  {allAvailableStreams.slice(0, 3).map(({ stream, sourceKey, index }) => {
    const streamKey = `${stream.source}/${stream.id}/${stream.streamNo || index}`;
    const baseKey = `${stream.source}/${stream.id}`;
    const isActive = activeSource === streamKey || activeSource === baseKey;

    const streamName =
      stream.name ||
      (stream.language && stream.language !== "Original"
        ? stream.language
        : null) ||
      (stream.source && stream.source !== "intel"
        ? stream.source.toUpperCase()
        : null) ||
      `Stream ${stream.streamNo || index + 1}`;

    return (
      <Button
        key={streamKey}
        variant={isActive ? "default" : "outline"}
        className={`min-w-[120px] ${
          isActive
            ? "bg-gray-600 hover:bg-gray-700 text-white"
            : "bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-600"
        }`}
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
