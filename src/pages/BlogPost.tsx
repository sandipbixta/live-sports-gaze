import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import BlogAdUnit from "@/components/ads/BlogAdUnit";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Eye, ArrowLeft, Share2, Tag } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  featured_image: string | null;
  author: string;
  published_at: string;
  views: number;
  meta_title: string;
  meta_description: string;
}

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      // Fetch the post
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      
      setPost(data);

      // Increment view count
      await supabase
        .from('blog_posts')
        .update({ views: data.views + 1 })
        .eq('id', data.id);

      // Fetch related posts
      const { data: related } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('category', data.category)
        .eq('is_published', true)
        .neq('id', data.id)
        .limit(3)
        .order('published_at', { ascending: false });

      setRelatedPosts(related || []);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      toast.error('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-96 w-full mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageLayout>
    );
  }

  if (!post) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The blog post you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/blog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Helmet>
        <title>{post.meta_title || post.title} | DamiTV Blog</title>
        <meta name="description" content={post.meta_description || post.excerpt} />
        <meta name="keywords" content={post.tags.join(', ')} />
        <link rel="canonical" href={`${window.location.origin}/blog/${post.slug}`} />
        
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${window.location.origin}/blog/${post.slug}`} />
        {post.featured_image && <meta property="og:image" content={post.featured_image} />}
        <meta property="article:published_time" content={post.published_at} />
        <meta property="article:author" content={post.author} />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.excerpt,
            "image": post.featured_image,
            "datePublished": post.published_at,
            "author": {
              "@type": "Person",
              "name": post.author
            },
            "publisher": {
              "@type": "Organization",
              "name": "DamiTV",
              "url": window.location.origin
            }
          })}
        </script>
      </Helmet>

      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate('/blog')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Button>

        {/* Article Header */}
        <header className="mb-8">
          <Badge className="mb-4">{post.category}</Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(new Date(post.published_at), 'MMMM d, yyyy')}
            </span>
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {post.views} views
            </span>
            <span>By {post.author}</span>
          </div>

          {post.featured_image && (
            <div className="aspect-video rounded-lg overflow-hidden mb-6">
              <img 
                src={post.featured_image} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex items-center gap-4 pb-6 border-b">
            <Button onClick={handleShare} variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </header>

        {/* Top Ad */}
        <BlogAdUnit position="top" />

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-8">
          {/* Split content and insert mid-article ad */}
          {(() => {
            const paragraphs = post.content.split('\n\n');
            const midPoint = Math.floor(paragraphs.length / 2);
            const firstHalf = paragraphs.slice(0, midPoint).join('\n\n');
            const secondHalf = paragraphs.slice(midPoint).join('\n\n');
            
            return (
              <>
                <ReactMarkdown>{firstHalf}</ReactMarkdown>
                <div className="not-prose my-8">
                  <BlogAdUnit position="middle" />
                </div>
                <ReactMarkdown>{secondHalf}</ReactMarkdown>
              </>
            );
          })()}
        </div>

        {/* Bottom Ad */}
        <BlogAdUnit position="bottom" />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mb-12 pb-8 border-b">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Tags:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedPosts.map((related) => (
                <Card 
                  key={related.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/blog/${related.slug}`)}
                >
                  {related.featured_image && (
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={related.featured_image} 
                        alt={related.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <Badge className="mb-2 text-xs">{related.category}</Badge>
                    <h3 className="font-bold line-clamp-2 mb-2">{related.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {related.excerpt}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </article>
    </PageLayout>
  );
};

export default BlogPost;