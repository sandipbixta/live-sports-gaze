import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageLayout from '@/components/PageLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  author: string;
  category: string;
  tags: string[] | null;
  published_at: string;
  views: number;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
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
      toast({
        title: 'Error',
        description: 'Failed to load blog posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <Helmet>
        <title>Blog - DamiTV Sports News & Analysis</title>
        <meta name="description" content="Read the latest sports analysis, match previews, and football insights from DamiTV experts." />
      </Helmet>

      <div className="py-8">
        <h1 className="text-4xl font-bold text-black dark:text-white mb-4">Our Blog</h1>
        <p className="text-lg text-black dark:text-white mb-8">
          Expert analysis, match previews, and sports insights
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-12 w-12 border-4 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-black border border-black dark:border-white rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">No blog posts yet</h2>
            <p className="text-muted-foreground mb-6">
              Want to create your first blog post? Follow these steps:
            </p>
            <div className="text-left max-w-md mx-auto space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                <p className="text-black dark:text-white">Make sure you're logged in and have admin privileges</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                <p className="text-black dark:text-white">Go to the admin panel at <code className="bg-muted px-2 py-1 rounded">/admin/blog</code></p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                <p className="text-black dark:text-white">Click "New Post" and start writing!</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
                <p className="text-black dark:text-white">Upload images, add content, and publish</p>
              </div>
            </div>
            <Link to="/admin/blog">
              <Button size="lg">
                Go to Admin Panel
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-black border-black dark:border-white">
                  {post.featured_image && (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <CardHeader>
                    <div className="flex gap-2 mb-2">
                      <Badge variant="secondary">{post.category}</Badge>
                    </div>
                    <CardTitle className="text-black dark:text-white line-clamp-2">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.published_at).toLocaleDateString()}
                      </span>
                      <span>{post.author}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-black dark:text-white line-clamp-3">
                      {post.excerpt}
                    </p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-2 mt-4 flex-wrap">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
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
