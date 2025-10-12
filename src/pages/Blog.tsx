import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '@/components/PageLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Tag, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  featured_image: string;
  author: string;
  published_at: string;
  views: number;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts' as any)
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts((data as any) || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts' as any)
        .select('category')
        .eq('is_published', true);

      if (error) throw error;
      const uniqueCategories = [...new Set((data as any)?.map((p: any) => p.category) || [])] as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredPosts = selectedCategory === 'all'
    ? posts
    : posts.filter(post => post.category === selectedCategory);

  return (
    <PageLayout>
      <Helmet>
        <title>Blog - DamiTV | Sports News, Analysis & Live Streaming Updates</title>
        <meta name="description" content="Read the latest sports news, match analysis, streaming guides, and live football updates from DamiTV. Your source for sports content and live streaming insights." />
        <meta name="keywords" content="sports blog, football news, live streaming, match analysis, sports updates, DamiTV blog" />
        <link rel="canonical" href="https://damitv.pro/blog" />
        <meta property="og:title" content="DamiTV Blog - Sports News & Streaming Updates" />
        <meta property="og:description" content="Latest sports news, match analysis, and live streaming guides from DamiTV" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://damitv.pro/blog" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">DamiTV Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your source for sports news, match analysis, and live streaming insights
          </p>
        </header>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
          >
            All Posts
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No blog posts found.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <Link key={post.id} to={`/blog/${post.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  {post.featured_image && (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">{post.category}</Badge>
                      <div className="flex items-center text-xs text-muted-foreground gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views}
                      </div>
                    </div>
                    <h2 className="text-xl font-bold mb-2 line-clamp-2">{post.title}</h2>
                    <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(post.published_at), 'MMM d, yyyy')}
                      </div>
                      <span>{post.author}</span>
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {post.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Blog;
