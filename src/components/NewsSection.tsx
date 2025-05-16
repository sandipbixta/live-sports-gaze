
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
}

const NewsSection = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Use a CORS proxy to fetch the RSS feed
        const response = await fetch(
          'https://api.allorigins.win/raw?url=https://www.espn.com/espn/rss/news'
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        
        const data = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, 'application/xml');
        const items = xml.querySelectorAll('item');
        
        const parsedItems: NewsItem[] = [];
        
        // Get only the first 5 items
        items.forEach((item, index) => {
          if (index < 5) {
            const title = item.querySelector('title')?.textContent || '';
            const description = item.querySelector('description')?.textContent || '';
            const link = item.querySelector('link')?.textContent || '';
            const pubDate = item.querySelector('pubDate')?.textContent || '';
            
            parsedItems.push({
              title,
              description,
              link,
              pubDate
            });
          }
        });
        
        setNewsItems(parsedItems);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNews();
    
    // Set up auto-refresh every 30 minutes (lightweight approach)
    const refreshInterval = setInterval(fetchNews, 30 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Strip HTML tags from description
  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="bg-[#242836] rounded-xl p-6 border border-[#343a4d]">
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        Sports News
      </h2>
      
      {loading && (
        <div className="flex justify-center my-8">
          <div className="h-8 w-8 border-4 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
      
      {error && (
        <div className="text-red-500 text-center py-4">{error}</div>
      )}
      
      <div className="space-y-4">
        {newsItems.map((item, index) => (
          <Card key={index} className="bg-[#1A1F2C] border-[#343a4d]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-white">{item.title}</CardTitle>
              <CardDescription className="text-xs text-gray-400">
                {new Date(item.pubDate).toLocaleDateString(undefined, { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-300 pb-2">
              {stripHtml(item.description).slice(0, 150)}
              {stripHtml(item.description).length > 150 ? '...' : ''}
            </CardContent>
            <CardFooter>
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                <Button variant="link" className="px-0 text-[#9b87f5]" size="sm">
                  Read More <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NewsSection;
