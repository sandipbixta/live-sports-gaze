import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageLayout from '../components/PageLayout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Loader, Play, Calendar, Star } from 'lucide-react';

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  original_language: string;
  original_title: string;
  popularity: number;
  adult: boolean;
  runtime?: number;
}

interface TMDBResponse {
  results: Movie[];
  total_pages: number;
  page: number;
}

interface Genre {
  id: number;
  name: string;
}

interface GenresResponse {
  genres: Genre[];
}

const TMDB_API_KEY = '80d3df1c267378db32e702c5c3132e49';
const TMDB_READ_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4MGQzZGYxYzI2NzM3OGRiMzJlNzAyYzVjMzEzMmU0OSIsIm5iZiI6MTc1MDU5MDkzNS42OTYsInN1YiI6IjY4NTdlNWQ3OTE4YzY5YzNkNGNiNGRjNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.zYkLeTXUcByVeMAcfzHFFTi3Q8fH4YblR-X2u7PItDI';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const Movies = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const navigate = useNavigate();

  // Fetch movie genres
  const { data: genresData } = useQuery({
    queryKey: ['movie-genres'],
    queryFn: async (): Promise<GenresResponse> => {
      const response = await fetch(`${TMDB_BASE_URL}/genre/movie/list`, {
        headers: {
          'Authorization': `Bearer ${TMDB_READ_ACCESS_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch genres');
      }
      return response.json();
    },
  });

  // Fetch popular movies from TMDB
  const { data: moviesData, isLoading, error } = useQuery({
    queryKey: ['movies', currentPage, searchTerm, selectedGenre],
    queryFn: async (): Promise<TMDBResponse> => {
      let endpoint;
      
      if (searchTerm) {
        endpoint = `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(searchTerm)}&page=${currentPage}`;
      } else if (selectedGenre && selectedGenre !== 'all') {
        endpoint = `${TMDB_BASE_URL}/discover/movie?with_genres=${selectedGenre}&page=${currentPage}&sort_by=popularity.desc`;
      } else {
        endpoint = `${TMDB_BASE_URL}/movie/popular?page=${currentPage}`;
      }
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${TMDB_READ_ACCESS_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      return response.json();
    },
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSelectedGenre('all'); // Clear genre filter when searching
    setCurrentPage(1);
  };

  const handleGenreChange = (genreId: string) => {
    setSelectedGenre(genreId);
    setSearchTerm(''); // Clear search when filtering by genre
    setCurrentPage(1);
  };

  const handleMovieClick = (movie: Movie) => {
    navigate(`/movie/${movie.id}`);
  };

  const getSelectedGenreName = () => {
    if (!selectedGenre || selectedGenre === 'all' || !genresData) return '';
    const genre = genresData.genres.find(g => g.id.toString() === selectedGenre);
    return genre ? genre.name : '';
  };

  const pageTitle = searchTerm 
    ? `Search Results for "${searchTerm}" - Movies | DAMITV`
    : selectedGenre && selectedGenre !== 'all'
    ? `${getSelectedGenreName()} Movies | DAMITV`
    : `Movies - Stream Latest Movies Online Free | DAMITV`;
  
  const pageDescription = searchTerm
    ? `Search results for "${searchTerm}" movies. Watch free movies online in HD quality on DAMITV.`
    : selectedGenre && selectedGenre !== 'all'
    ? `Watch ${getSelectedGenreName()} movies online for free in HD quality on DAMITV.`
    : 'Watch the latest movies online for free in HD quality. Stream popular movies, new releases, and classics on DAMITV - your premium destination for movie streaming.';
  
  const currentUrl = `https://damitv.pro/movies${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : selectedGenre && selectedGenre !== 'all' ? `?genre=${selectedGenre}` : ''}${currentPage > 1 ? `${searchTerm || (selectedGenre && selectedGenre !== 'all') ? '&' : '?'}page=${currentPage}` : ''}`;

  if (error) {
    return (
      <>
        <Helmet>
          <title>Error Loading Movies | DAMITV</title>
          <meta name="description" content="Error loading movies. Please try again later." />
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <PageLayout searchTerm={searchTerm} onSearch={handleSearch}>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Error Loading Movies</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Failed to fetch movies. Please try again later.
              </p>
            </div>
          </div>
        </PageLayout>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="free movies online, watch movies, movie streaming, HD movies, latest movies, popular movies, movie player, cinema online, DAMITV movies" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content="https://damitv.pro/placeholder.svg" />
        <meta property="og:site_name" content="DAMITV" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={currentUrl} />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={pageDescription} />
        <meta property="twitter:image" content="https://damitv.pro/placeholder.svg" />
        
        {/* Additional SEO */}
        <meta name="author" content="DAMITV" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" content={currentUrl} />
        
        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": pageTitle,
            "description": pageDescription,
            "url": currentUrl,
            "isPartOf": {
              "@type": "WebSite",
              "name": "DAMITV",
              "url": "https://damitv.pro"
            },
            "provider": {
              "@type": "Organization",
              "name": "DAMITV",
              "url": "https://damitv.pro"
            }
          })}
        </script>
      </Helmet>

      <PageLayout searchTerm={searchTerm} onSearch={handleSearch}>
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Movies</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Watch the latest and greatest movies
            </p>
          </div>

          {/* Genre Filter */}
          <div className="flex justify-center">
            <div className="w-full max-w-xs">
              <Select value={selectedGenre} onValueChange={handleGenreChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {genresData?.genres.map((genre) => (
                    <SelectItem key={genre.id} value={genre.id.toString()}>
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="text-center">
                <Loader className="h-12 w-12 animate-spin mx-auto mb-4 text-[#ff5a36]" />
                <p className="text-lg">Loading movies...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Movie grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {moviesData?.results.map((movie) => (
                  <Card 
                    key={movie.id} 
                    className="cursor-pointer hover:scale-105 transition-transform duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    onClick={() => handleMovieClick(movie)}
                  >
                    <CardContent className="p-0">
                      <div className="relative">
                        <img
                          src={movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : '/placeholder.svg'}
                          alt={movie.title}
                          className="w-full h-60 sm:h-72 object-cover rounded-t-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-t-lg flex items-center justify-center">
                          <Play className="h-12 w-12 text-white" />
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                          {movie.title}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{movie.vote_average?.toFixed(1) || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {moviesData && moviesData.total_pages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {moviesData.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(moviesData.total_pages, prev + 1))}
                    disabled={currentPage === moviesData.total_pages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </PageLayout>
    </>
  );
};

export default Movies;
