import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Twitter, Calendar, Send } from "lucide-react";

const AutomatedPosting = () => {
  const [customText, setCustomText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const { toast } = useToast();

  const handlePostNow = async () => {
    setIsPosting(true);
    try {
      const { data, error } = await supabase.functions.invoke('twitter-post', {
        body: { text: customText }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success!",
          description: "Your post has been shared on X (Twitter)!",
        });
        setCustomText("");
      } else {
        throw new Error(data.error || "Failed to post");
      }
    } catch (error: any) {
      console.error("Posting error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to post to X. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const samplePosts = [
    "🔥 Live Sports Action! Don't miss today's biggest matches! Stream all games free at your-site.com",
    "⚽ Premier League heating up! Every goal, every save - streaming live now!",
    "🏀 NBA action tonight! Catch every dunk and buzzer beater live!",
    "🏈 Game day is here! Stream all the action without missing a beat!",
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Automated Social Media Posting</h1>
        <p className="text-muted-foreground">
          Boost your traffic with automated sports content posting
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Manual Posting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Twitter className="h-5 w-5 text-blue-500" />
              Post to X (Twitter) Now
            </CardTitle>
            <CardDescription>
              Create and post custom content immediately
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Write your custom post or leave empty for auto-generated sports content..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={4}
            />
            <Button 
              onClick={handlePostNow} 
              disabled={isPosting}
              className="w-full"
            >
              <Send className="mr-2 h-4 w-4" />
              {isPosting ? "Posting..." : "Post Now"}
            </Button>
          </CardContent>
        </Card>

        {/* Content Ideas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              Content Ideas
            </CardTitle>
            <CardDescription>
              Sample posts that work well for sports streaming sites
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {samplePosts.map((post, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg text-sm">
                  {post}
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setCustomText(samplePosts[Math.floor(Math.random() * samplePosts.length)])}
            >
              Use Random Sample
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for Better Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Best Posting Times:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 1-2 hours before major matches</li>
                <li>• Weekend evenings (7-9 PM)</li>
                <li>• During halftime of popular games</li>
                <li>• Monday morning sports recaps</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Content That Works:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Live match updates</li>
                <li>• "Where to watch" posts</li>
                <li>• Sports news commentary</li>
                <li>• Match predictions & polls</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomatedPosting;