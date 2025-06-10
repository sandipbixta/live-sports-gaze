
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, X } from 'lucide-react';

interface ManualStream {
  id: string;
  title: string;
  streamUrl: string;
  date: string;
}

interface ManualStreamInputProps {
  onAddStream: (stream: ManualStream) => void;
  streams: ManualStream[];
  onRemoveStream: (id: string) => void;
}

const ManualStreamInput: React.FC<ManualStreamInputProps> = ({ 
  onAddStream, 
  streams, 
  onRemoveStream 
}) => {
  const [title, setTitle] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !streamUrl.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and stream URL",
        variant: "destructive",
      });
      return;
    }

    if (!streamUrl.startsWith('http')) {
      toast({
        title: "Error", 
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }

    const newStream: ManualStream = {
      id: `manual-${Date.now()}`,
      title: title.trim(),
      streamUrl: streamUrl.trim(),
      date: new Date().toISOString(),
    };

    onAddStream(newStream);
    setTitle('');
    setStreamUrl('');
    setIsExpanded(false);
    
    toast({
      title: "Stream Added",
      description: `"${title}" has been added to your custom streams`,
    });
  };

  return (
    <Card className="bg-[#242836] border-[#343a4d] mb-6">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          Add Your Own Stream
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white"
          >
            {isExpanded ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="stream-title" className="text-white">Stream Title</Label>
              <Input
                id="stream-title"
                type="text"
                placeholder="e.g., Premier League Live"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-[#1a1f2e] border-[#343a4d] text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="stream-url" className="text-white">Stream URL</Label>
              <Input
                id="stream-url"
                type="url"
                placeholder="https://example.com/stream"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                className="bg-[#1a1f2e] border-[#343a4d] text-white"
              />
            </div>
            
            <Button type="submit" className="w-full">
              Add Stream
            </Button>
          </form>
          
          {streams.length > 0 && (
            <div className="mt-6">
              <h4 className="text-white font-medium mb-3">Your Custom Streams:</h4>
              <div className="space-y-2">
                {streams.map((stream) => (
                  <div key={stream.id} className="flex items-center justify-between bg-[#1a1f2e] p-3 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{stream.title}</p>
                      <p className="text-gray-400 text-sm truncate max-w-[200px]">{stream.streamUrl}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveStream(stream.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ManualStreamInput;
