import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Eye, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface BlogPostForm {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  author_name: string;
  tags: string;
  meta_title: string;
  meta_description: string;
  is_published: boolean;
}

const defaultForm: BlogPostForm = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  featured_image: '',
  author_name: 'DamiTV Team',
  tags: '',
  meta_title: '',
  meta_description: '',
  is_published: false,
};

const AdminBlogEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [form, setForm] = useState<BlogPostForm>(defaultForm);

  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent', 'align',
    'blockquote', 'code-block', 'link', 'image', 'video',
  ];

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post-edit', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (post) {
      setForm({
        title: post.title || '',
        slug: post.slug || '',
        content: post.content || '',
        excerpt: post.excerpt || '',
        featured_image: post.featured_image || '',
        author_name: post.author_name || 'DamiTV Team',
        tags: post.tags?.join(', ') || '',
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        is_published: post.is_published || false,
      });
    }
  }, [post]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setForm(prev => ({
      ...prev,
      title,
      slug: !isEditing || !prev.slug ? generateSlug(title) : prev.slug,
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async (publish: boolean) => {
      // Preflight: make the RLS failure understandable
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session?.user) {
        throw new Error('You must sign in as an admin to publish blog posts.');
      }

      const { data: isAdmin, error: roleError } = await supabase.rpc('has_role', {
        _user_id: sessionData.session.user.id,
        _role: 'admin',
      });

      if (roleError) throw roleError;
      if (!isAdmin) {
        throw new Error('Your account is not an admin, so publishing is blocked. Add your user to user_roles as admin.');
      }

      const tagsArray = form.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const postData = {
        title: form.title,
        slug: form.slug,
        content: form.content,
        excerpt: form.excerpt || null,
        featured_image: form.featured_image || null,
        author_name: form.author_name || 'DamiTV Team',
        tags: tagsArray,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
        is_published: publish,
        published_at: publish ? new Date().toISOString() : null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert(postData);
        if (error) throw error;
      }
    },
    onSuccess: (_, publish) => {
      toast.success(publish ? 'Post published!' : 'Post saved as draft');
      navigate('/admin/blog');
    },
    onError: (error: any) => {
      const msg = error?.message || 'Failed to save post';
      toast.error(msg);
      if (typeof msg === 'string' && msg.toLowerCase().includes('sign in')) {
        navigate('/auth');
      }
    },
  });

  if (isEditing && isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PageLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Edit Post' : 'New Post'} | DamiTV Blog Admin</title>
      </Helmet>

      <PageLayout>
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={() => navigate('/admin/blog')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Posts
            </Button>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => saveMutation.mutate(false)}
                disabled={saveMutation.isLoading || !form.title || !form.content}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={() => saveMutation.mutate(true)}
                disabled={saveMutation.isLoading || !form.title || !form.content}
              >
                <Eye className="w-4 h-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Editor */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={form.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Enter post title..."
                        className="text-xl font-semibold"
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug (URL)</Label>
                      <Input
                        id="slug"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        placeholder="post-url-slug"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[400px] blog-editor">
                    <ReactQuill
                      theme="snow"
                      value={form.content}
                      onChange={(content) => setForm({ ...form, content })}
                      modules={modules}
                      formats={formats}
                      placeholder="Write your blog post content here..."
                      className="h-[350px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Featured Image</CardTitle>
                </CardHeader>
                <CardContent>
                  {form.featured_image ? (
                    <div className="relative">
                      <img
                        src={form.featured_image}
                        alt="Featured"
                        className="w-full aspect-video object-cover rounded-lg mb-3"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setForm({ ...form, featured_image: '' })}
                        className="w-full"
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <ImagePlus className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-3">
                        Paste image URL below
                      </p>
                    </div>
                  )}
                  <Input
                    value={form.featured_image}
                    onChange={(e) => setForm({ ...form, featured_image: e.target.value })}
                    placeholder="https://... image URL"
                    className="mt-3"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Post Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={form.author_name}
                      onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={form.excerpt}
                      onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                      placeholder="Brief description..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={form.tags}
                      onChange={(e) => setForm({ ...form, tags: e.target.value })}
                      placeholder="football, premier league, news"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">SEO Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input
                      id="meta_title"
                      value={form.meta_title}
                      onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                      placeholder="Custom SEO title (optional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      value={form.meta_description}
                      onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                      placeholder="Custom SEO description (optional)"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageLayout>

      <style>{`
        .blog-editor .ql-container {
          min-height: 350px;
          font-size: 16px;
        }
        .blog-editor .ql-editor {
          min-height: 350px;
        }
        .blog-editor .ql-toolbar {
          border-radius: 8px 8px 0 0;
          background: hsl(var(--secondary));
        }
        .blog-editor .ql-container {
          border-radius: 0 0 8px 8px;
        }
      `}</style>
    </>
  );
};

export default AdminBlogEditor;
