import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import PageLayout from '../components/PageLayout';
import { Helmet } from 'react-helmet-async';
import TelegramBanner from '../components/TelegramBanner';
import { HeroCarousel } from '../components/HeroCarousel';
import BlogPostsList from '../components/BlogPostsList';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TrendingUp } from 'lucide-react';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await (supabase as any)
        .from('blog_posts')
        .select('category')
        .eq('is_published', true);
      
      if (data) {
        const uniqueCategories = [...new Set(data.map((post: any) => post.category))] as string[];
        setCategories(uniqueCategories);
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <PageLayout searchTerm={searchTerm} onSearch={handleSearch}>
      <Helmet>
        <title>DamiTV Blog - Sports News, Analysis & Insights</title>
        <meta name="description" content="Read the latest sports news, match analysis, and insights on DamiTV Blog. Expert coverage of football, basketball, tennis and more." />
        <meta name="keywords" content="sports blog, football news, basketball analysis, sports insights, match previews, sports articles" />
        <link rel="canonical" href="https://www.damitv.pro/" />
      </Helmet>
      
      <main className="py-4">
        <div className="mb-4">
          <TelegramBanner />
        </div>

        <HeroCarousel />

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            <BookOpen className="inline-block mr-2 h-8 w-8" />
            DamiTV Blog
          </h1>
          <p className="text-muted-foreground text-lg">
            Your source for sports news, analysis, and expert insights
          </p>
        </header>

        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Categories</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === '' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory('')}
              >
                All Posts
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <BlogPostsList searchTerm={searchTerm} category={selectedCategory} />
      </main>
    </PageLayout>
  );
};

export default Index;
