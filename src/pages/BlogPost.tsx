import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '@/components/PageLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Tag, Eye, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import SocialShare from '@/components/SocialShare';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  featured_image: string;
  author: string;
  published_at: string;
  views: number;
  meta_title: string;
  meta_description: string;
}

const BlogPost = () => {
  const { slug } = useParams();
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
      // Fetch post
      const { data, error } = await supabase
        .from('blog_posts' as any)
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      setPost(data as any);

      // Increment view count
      await supabase.rpc('increment_blog_views' as any, { post_slug: slug });

      // Fetch related posts
      if (data) {
        const { data: related } = await supabase
          .from('blog_posts' as any)
          .select('*')
          .eq('category', (data as any).category)
          .neq('slug', slug)
          .eq('is_published', true)
          .limit(3);
        
        setRelatedPosts((related as any) || []);
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-96 w-full mb-8" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </PageLayout>
    );
  }

  if (!post) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Blog post not found</h1>
          <Link to="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.featured_image,
    "datePublished": post.published_at,
    "author": {
      "@type": "Organization",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "DamiTV",
      "logo": {
        "@type": "ImageObject",
        "url": "https://damitv.pro/logo.png"
      }
    }
  };

  return (
    <PageLayout>
      <Helmet>
        <title>{post.meta_title || post.title} - DamiTV Blog</title>
        <meta name="description" content={post.meta_description || post.excerpt} />
        <meta name="keywords" content={post.tags?.join(', ') || ''} />
        <link rel="canonical" href={`https://damitv.pro/blog/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://damitv.pro/blog/${post.slug}`} />
        {post.featured_image && <meta property="og:image" content={post.featured_image} />}
        <meta property="article:published_time" content={post.published_at} />
        <meta property="article:author" content={post.author} />
        <meta property="article:section" content={post.category} />
        {post.tags?.map((tag, idx) => (
          <meta key={idx} property="article:tag" content={tag} />
        ))}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/blog">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">{post.category}</Badge>
            <div className="flex items-center text-sm text-muted-foreground gap-1">
              <Eye className="w-4 h-4" />
              {post.views} views
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center justify-between text-muted-foreground mb-6">
            <div className="flex items-center gap-4">
              <span>{post.author}</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(post.published_at), 'MMMM d, yyyy')}
              </div>
            </div>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, idx) => (
                <span key={idx} className="text-sm text-muted-foreground flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {post.featured_image && (
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg mb-8"
            />
          )}
        </header>

        <div 
          className="prose prose-lg max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <SocialShare 
          url={`https://damitv.pro/blog/${post.slug}`}
          title={post.title}
        />

        {relatedPosts.length > 0 && (
          <section className="mt-12 pt-8 border-t">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedPosts.map(related => (
                <Link key={related.id} to={`/blog/${related.slug}`}>
                  <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    {related.featured_image && (
                      <img
                        src={related.featured_image}
                        alt={related.title}
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <Badge variant="secondary" className="mb-2">{related.category}</Badge>
                      <h3 className="font-semibold line-clamp-2">{related.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </PageLayout>
  );
};

export default BlogPost;
