import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageLayout from '@/components/PageLayout';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Tag, ArrowLeft, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SocialShare from '@/components/SocialShare';

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
  meta_title: string | null;
  meta_description: string | null;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      fetchPost();
      incrementViews();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts' as any)
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      setPost(data as any);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blog post',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      const { error } = await supabase.rpc('increment_blog_views', { post_slug: slug });
      if (error) console.error('Error incrementing views:', error);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center py-12">
          <div className="h-12 w-12 border-4 border-t-primary rounded-full animate-spin"></div>
        </div>
      </PageLayout>
    );
  }

  if (!post) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
          <Link to="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Helmet>
        <title>{post.meta_title || post.title} - DamiTV</title>
        <meta name="description" content={post.meta_description || post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        {post.featured_image && <meta property="og:image" content={post.featured_image} />}
        <meta property="og:type" content="article" />
      </Helmet>

      <article className="py-8 max-w-4xl mx-auto">
        <Link to="/blog">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>

        {post.featured_image && (
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-96 object-cover rounded-lg mb-6"
          />
        )}

        <div className="flex gap-2 mb-4">
          <Badge variant="secondary">{post.category}</Badge>
        </div>

        <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
          {post.title}
        </h1>

        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6 flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(post.published_at).toLocaleDateString()}
          </span>
          <span>By {post.author}</span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {post.views} views
          </span>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div 
          className="prose prose-lg dark:prose-invert max-w-none mb-8 text-black dark:text-white"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="border-t border-black dark:border-white pt-6">
          <h3 className="text-lg font-semibold mb-4">Share this post</h3>
          <SocialShare title={post.title} />
        </div>
      </article>
    </PageLayout>
  );
};

export default BlogPost;
