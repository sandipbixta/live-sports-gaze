import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageLayout from '@/components/PageLayout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Star, Play } from 'lucide-react';
import { getTrending, getPopularMovies, getPopularTVShows, getTopRatedMovies, searchContent, Movie, getPosterUrl } from '@/services/tmdbService';
import { Badge } from '@/components/ui/badge';
import LoadingGrid from '@/components/LoadingGrid';

const Netflix = () => {
  const navigate = useNavigate();
  const [trending, setTrending] = useState<Movie[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTVShows] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const [trendingData, moviesData, tvData, topRatedData] = await Promise.all([
        getTrending('all', 'week'),
        getPopularMovies(),
        getPopularTVShows(),
        getTopRatedMovies()
      ]);
      setTrending(trendingData.slice(0, 20));
      setMovies(moviesData.slice(0, 20));
      setTVShows(tvData.slice(0, 20));
      setTopRated(topRatedData.slice(0, 20));
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 2) {
      try {
        const results = await searchContent(query);
        setSearchResults(results.slice(0, 20));
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleContentClick = (item: Movie) => {
    const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
    navigate(`/netflix/play/${mediaType}/${item.id}`);
  };

  const ContentCard = ({ item }: { item: Movie }) => {
    const title = item.title || item.name || 'Unknown';
    const year = item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || '';
    const mediaType = item.media_type || (item.title ? 'movie' : 'tv');

    return (
      <Card 
        className="group relative overflow-hidden cursor-pointer transition-all hover:scale-105 hover:shadow-xl bg-card border-border"
        onClick={() => handleContentClick(item)}
      >
        <div className="aspect-[2/3] relative">
          <img 
            src={getPosterUrl(item.poster_path, 'w500')} 
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center justify-center mb-2">
                <Play className="w-12 h-12 text-white" />
              </div>
              <h3 className="font-bold text-white text-sm line-clamp-2">{title}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-300">{year}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs text-white">{item.vote_average.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
          <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
            {mediaType === 'movie' ? 'Movie' : 'TV'}
          </Badge>
        </div>
      </Card>
    );
  };

  const ContentSection = ({ title, items }: { title: string; items: Movie[] }) => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-foreground">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <ContentCard key={`${item.id}-${item.media_type}`} item={item} />
        ))}
      </div>
    </div>
  );

  return (
    <PageLayout>
      <Helmet>
        <title>Netflix - Watch Movies & TV Shows Online | DamiTV</title>
        <meta name="description" content="Stream unlimited movies and TV shows online. Watch the latest releases, popular series, and trending content for free in HD quality." />
        <meta name="keywords" content="netflix, movies online, tv shows, streaming, watch free, HD movies, series online" />
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        {/* Netflix-style Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4" style={{ color: '#E50914' }}>
            NETFLIX
          </h1>
          <p className="text-muted-foreground text-lg">
            Unlimited movies, TV shows, and more
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder="Search movies and TV shows..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-background border-border h-12 text-lg"
          />
        </div>

        {loading ? (
          <LoadingGrid />
        ) : searchResults.length > 0 ? (
          <ContentSection title="Search Results" items={searchResults} />
        ) : (
          <Tabs defaultValue="trending" className="w-full">
            <TabsList className="mb-6 bg-muted">
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="movies">Movies</TabsTrigger>
              <TabsTrigger value="tv">TV Shows</TabsTrigger>
              <TabsTrigger value="top">Top Rated</TabsTrigger>
            </TabsList>

            <TabsContent value="trending">
              <ContentSection title="Trending Now" items={trending} />
            </TabsContent>

            <TabsContent value="movies">
              <ContentSection title="Popular Movies" items={movies} />
            </TabsContent>

            <TabsContent value="tv">
              <ContentSection title="Popular TV Shows" items={tvShows} />
            </TabsContent>

            <TabsContent value="top">
              <ContentSection title="Top Rated Movies" items={topRated} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageLayout>
  );
};

export default Netflix;
