import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  'Sports Streaming',
  'Match Previews',
  'Sports News',
  'Tutorials',
  'League Guides',
  'Device Setup'
];

interface BlogGeneratorProps {
  onSuccess?: () => void;
}

const BlogGenerator = ({ onSuccess }: BlogGeneratorProps) => {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('Sports Streaming');
  const [loading, setLoading] = useState(false);

  const generateBlogPost = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-post', {
        body: { topic, category }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success('Blog post generated and published!');
      setTopic('');
      onSuccess?.();
    } catch (error: any) {
      console.error('Error generating blog post:', error);
      
      if (error.message?.includes('Rate limit')) {
        toast.error('Rate limit exceeded. Please try again in a moment.');
      } else if (error.message?.includes('credits')) {
        toast.error('AI credits exhausted. Please add funds to your workspace.');
      } else {
        toast.error(error.message || 'Failed to generate blog post');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Blog Post Generator
          </h3>
          <p className="text-sm text-muted-foreground">
            Generate SEO-optimized blog posts about sports streaming topics using AI
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="topic">Topic</Label>
            <Textarea
              id="topic"
              placeholder="E.g., 'How to watch Premier League matches online' or 'Best VPNs for sports streaming'"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={generateBlogPost} 
            disabled={loading || !topic.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Blog Post
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-3">
          <p>💡 <strong>Tips:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Be specific with your topic for better results</li>
            <li>The AI will generate a complete SEO-optimized article</li>
            <li>Generated posts are automatically published</li>
            <li>Free during promotional period (until Oct 13, 2025)</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default BlogGenerator;