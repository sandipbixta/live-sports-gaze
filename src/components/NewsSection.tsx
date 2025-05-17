
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  category?: string;
}

const NewsSection = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const sportCategories = [
    { name: "All", value: null },
    { name: "Football", value: "football" },
    { name: "Basketball", value: "basketball" },
    { name: "Baseball", value: "baseball" },
    { name: "Tennis", value: "tennis" }
  ];

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
        
        // Process all items and categorize them
        items.forEach((item) => {
          const title = item.querySelector('title')?.textContent || '';
          const description = item.querySelector('description')?.textContent || '';
          const link = item.querySelector('link')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || '';
          
          // Categorize the news item based on keywords in the title or description
          let category = "other";
          const lowerTitle = title.toLowerCase();
          const lowerDesc = description.toLowerCase();
          
          if (lowerTitle.includes('football') || 
              lowerTitle.includes('soccer') || 
              lowerTitle.includes('premier league') || 
              lowerDesc.includes('football') || 
              lowerDesc.includes('soccer')) {
            category = "football";
          } else if (lowerTitle.includes('basketball') || 
                     lowerTitle.includes('nba') || 
                     lowerTitle.includes('ncaa') || 
                     lowerDesc.includes('basketball')) {
            category = "basketball";
          } else if (lowerTitle.includes('baseball') || 
                     lowerTitle.includes('mlb') || 
                     lowerDesc.includes('baseball')) {
            category = "baseball";
          } else if (lowerTitle.includes('tennis') || 
                     lowerDesc.includes('tennis')) {
            category = "tennis";
          }
          
          parsedItems.push({
            title,
            description,
            link,
            pubDate,
            category
          });
        });
        
        // Ensure we have a diverse set of categories when possible
        const diverseItems = getDiverseNewsSet(parsedItems);
        setNewsItems(diverseItems);
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

  // Function to get a diverse set of news items across categories
  const getDiverseNewsSet = (items: NewsItem[]): NewsItem[] => {
    // Create a map of category -> news items
    const categoryMap: Record<string, NewsItem[]> = {};
    items.forEach(item => {
      if (!categoryMap[item.category || 'other']) {
        categoryMap[item.category || 'other'] = [];
      }
      categoryMap[item.category || 'other'].push(item);
    });
    
    // Try to select at least one item from each main category, then fill with other items
    const result: NewsItem[] = [];
    
    // First add one from each main category if available
    const mainCategories = ['football', 'basketball', 'baseball', 'tennis'];
    mainCategories.forEach(category => {
      if (categoryMap[category] && categoryMap[category].length > 0) {
        result.push(categoryMap[category].shift()!);
      }
    });
    
    // Then add remaining items up to a maximum of 5
    const remainingItems = Object.values(categoryMap).flat();
    while (result.length < 5 && remainingItems.length > 0) {
      result.push(remainingItems.shift()!);
    }
    
    return result;
  };

  // Filter news by active category
  const filteredNews = activeCategory 
    ? newsItems.filter(item => item.category === activeCategory) 
    : newsItems;

  // Strip HTML tags from description
  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Get category badge color
  const getCategoryColor = (category?: string) => {
    switch(category) {
      case 'football': return 'bg-green-600';
      case 'basketball': return 'bg-orange-600';
      case 'baseball': return 'bg-blue-600';
      case 'tennis': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="bg-[#242836] rounded-xl p-6 border border-[#343a4d]">
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        Sports News
        <Link to="/news" className="text-sm text-[#9b87f5] font-normal ml-2 hover:underline">
          View All →
        </Link>
      </h2>
      
      {/* Category filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {sportCategories.map(category => (
          <button
            key={category.name}
            onClick={() => setActiveCategory(category.value)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              activeCategory === category.value 
                ? 'bg-[#9b87f5] text-white' 
                : 'bg-[#1A1F2C] text-gray-300 hover:bg-[#343a4d]'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {loading && (
        <div className="flex justify-center my-8">
          <div className="h-8 w-8 border-4 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
      
      {error && (
        <div className="text-red-500 text-center py-4">{error}</div>
      )}
      
      <div className="space-y-4">
        {filteredNews.length === 0 && !loading && (
          <div className="text-center py-4 text-gray-400">
            No news available for this category. Try another category or check back later.
          </div>
        )}
        
        {filteredNews.map((item, index) => (
          <Card key={index} className="bg-[#1A1F2C] border-[#343a4d]">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold text-white">{item.title}</CardTitle>
                {item.category && (
                  <span className={`text-xs text-white px-2 py-1 rounded-full ${getCategoryColor(item.category)}`}>
                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </span>
                )}
              </div>
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
