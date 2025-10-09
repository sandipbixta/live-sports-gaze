-- Create a function to increment blog post views
CREATE OR REPLACE FUNCTION public.increment_blog_views(post_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.blog_posts
  SET views = views + 1
  WHERE slug = post_slug AND is_published = true;
END;
$$;