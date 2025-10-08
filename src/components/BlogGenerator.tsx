import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('Sports Streaming');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!checkingAuth && !isAdmin) {
      const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
        }
      };
      checkSession();
    }
  }, [checkingAuth, isAdmin, navigate]);

  const checkAdminStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAdmin(false);
        setCheckingAuth(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data);
      }
    } catch (error) {
      console.error('Error:', error);
      setIsAdmin(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!image) return null;

    const fileExt = image.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, image);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      toast.error('Failed to upload image');
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const generateBlogPost = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;
      
      if (image) {
        imageUrl = await uploadImage();
      }

      // Get the current session to pass the auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to generate blog posts');
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-blog-post', {
        body: { topic, category, featured_image: imageUrl },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success('Blog post generated and published!');
      setTopic('');
      setImage(null);
      setImagePreview('');
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

  if (checkingAuth) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="text-muted-foreground">
            <p className="text-lg font-semibold">Admin Access Required</p>
            <p className="text-sm mt-2">You need admin privileges to generate blog posts.</p>
          </div>
          <Button onClick={() => navigate('/auth')} variant="default">
            Sign In
          </Button>
        </div>
      </Card>
    );
  }

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

          <div>
            <Label htmlFor="image">Featured Image (Optional)</Label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImage(null);
                      setImagePreview('');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload image</p>
                    <p className="text-xs text-muted-foreground mt-1">Max 5MB</p>
                  </div>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={loading}
                  />
                </label>
              )}
            </div>
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