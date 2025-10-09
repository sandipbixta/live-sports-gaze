import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageLayout from '@/components/PageLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, ImagePlus } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import ImageUploader from '@/components/ImageUploader';

const AdminBlogEditor = () => {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Football');
  const [tags, setTags] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [author, setAuthor] = useState('DamiTV Team');
  const [isPublished, setIsPublished] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate('/auth');
      } else {
        checkAdminRole(session.user.id);
      }
    });
  }, [navigate]);

  useEffect(() => {
    if (id && id !== 'new') {
      loadPost();
    }
  }, [id]);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles' as any)
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (error || !data) {
        toast({
          title: 'Access Denied',
          description: 'You need admin privileges to access this page',
          variant: 'destructive',
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking admin role:', error);
      navigate('/');
    }
  };

  const loadPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts' as any)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return;

      const postData = data as any;
      setTitle(postData.title);
      setSlug(postData.slug);
      setExcerpt(postData.excerpt || '');
      setContent(postData.content);
      setCategory(postData.category);
      setTags(postData.tags?.join(', ') || '');
      setFeaturedImage(postData.featured_image || '');
      setAuthor(postData.author || 'DamiTV Team');
      setIsPublished(postData.is_published);
    } catch (error) {
      console.error('Error loading post:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blog post',
        variant: 'destructive',
      });
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (id === 'new' && !slug) {
      setSlug(generateSlug(value));
    }
  };

  const savePost = async () => {
    if (!title || !slug || !content) {
      toast({
        title: 'Validation Error',
        description: 'Title, slug, and content are required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const postData = {
        title,
        slug,
        excerpt,
        content,
        category,
        tags: tagsArray,
        featured_image: featuredImage || null,
        author,
        is_published: isPublished,
      };

      if (id === 'new') {
        const { error } = await supabase
          .from('blog_posts' as any)
          .insert(postData);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Blog post created successfully',
        });
      } else {
        const { error } = await supabase
          .from('blog_posts' as any)
          .update(postData)
          .eq('id', id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Blog post updated successfully',
        });
      }

      navigate('/admin/blog');
    } catch (error: any) {
      console.error('Error saving post:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save blog post',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <Helmet>
        <title>{id === 'new' ? 'Create' : 'Edit'} Blog Post - Admin</title>
      </Helmet>

      <div className="py-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/admin/blog')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-black dark:text-white">
            {id === 'new' ? 'Create New Post' : 'Edit Post'}
          </h1>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter post title"
              className="bg-white dark:bg-black"
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="post-url-slug"
              className="bg-white dark:bg-black"
            />
          </div>

          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of the post"
              rows={3}
              className="bg-white dark:bg-black"
            />
          </div>

          <div>
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog post content (HTML supported)"
              rows={15}
              className="bg-white dark:bg-black font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Football, Basketball, etc."
                className="bg-white dark:bg-black"
              />
            </div>

            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author name"
                className="bg-white dark:bg-black"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="football, premier league, analysis"
              className="bg-white dark:bg-black"
            />
          </div>

          <div>
            <ImageUploader
              label="Featured Image"
              currentImage={featuredImage}
              onImageUploaded={(url) => setFeaturedImage(url)}
            />
          </div>

          <div>
            <Label htmlFor="contentImages">Insert Images in Content</Label>
            <div className="border border-black dark:border-white rounded-lg p-4">
              <ImageUploader
                label="Upload image for content"
                onImageUploaded={(url) => {
                  // Insert image markdown at cursor position
                  const imageMarkdown = `\n<img src="${url}" alt="Blog image" class="w-full rounded-lg my-4" />\n`;
                  setContent(content + imageMarkdown);
                }}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Upload an image and it will be automatically inserted into your content
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
            <Label htmlFor="published">Publish immediately</Label>
          </div>

          <div className="flex gap-4">
            <Button onClick={savePost} disabled={loading} className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Saving...' : 'Save Post'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/blog')}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AdminBlogEditor;
