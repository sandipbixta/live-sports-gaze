import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Eye, ChevronRight, Filter } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  featured_image: string | null;
  author: string;
  published_at: string;
  views: number;
}

const CATEGORIES = [
  'All',
  'Sports Streaming',
  'Match Previews',
  'Sports News',
  'Tutorials',
  'League Guides',
  'Device Setup'
];

const Blog = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = selectedCategory === 'All' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Sports Streaming': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'Match Previews': 'bg-green-500/10 text-green-500 border-green-500/20',
      'Sports News': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'Tutorials': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      'League Guides': 'bg-pink-500/10 text-pink-500 border-pink-500/20',
      'Device Setup': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    };
    return colors[category] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  return (
    <PageLayout>
      <Helmet>
        <title>Sports Blog - Live Streaming Guides & News | DamiTV</title>
        <meta name="description" content="Expert guides, match previews, and sports streaming tips. Learn how to watch your favorite sports live with DamiTV's comprehensive blog." />
        <meta name="keywords" content="sports blog, streaming guides, match previews, sports news, live sports tips, DamiTV blog" />
        <link rel="canonical" href={`${window.location.origin}/blog`} />
        
        <meta property="og:title" content="Sports Blog - Live Streaming Guides & News | DamiTV" />
        <meta property="og:description" content="Expert guides, match previews, and sports streaming tips from DamiTV." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/blog`} />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "DamiTV Sports Blog",
            "description": "Expert sports streaming guides and news",
            "url": `${window.location.origin}/blog`,
            "publisher": {
              "@type": "Organization",
              "name": "DamiTV",
              "url": window.location.origin
            }
          })}
        </script>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 text-foreground">Sports Blog</h1>
          <p className="text-muted-foreground text-lg">
            Expert guides, match previews, and everything you need to know about watching live sports
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter by category:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">
              {selectedCategory === 'All' 
                ? 'No blog posts yet. Check back soon for expert sports streaming guides!' 
                : `No posts in "${selectedCategory}" category yet.`}
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <Card 
                key={post.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                {post.featured_image && (
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={post.featured_image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <Badge className={`mb-3 ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </Badge>
                  
                  <h2 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(post.published_at), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.views}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Blog;