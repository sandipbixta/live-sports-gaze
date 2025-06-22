import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import PageLayout from '../components/PageLayout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Loader, Play, Calendar, Star, Clock, Globe, Users, Award } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { AspectRatio } from '../components/ui/aspect-ratio';

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

interface MovieDetails extends Movie {
  genres: { id: number; name: string; }[];
  production_countries: { iso_3166_1: string; name: string; }[];
  spoken_languages: { iso_639_1: string; name: string; }[];
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
}

interface TMDBResponse {
  results: Movie[];
  total_pages: number;
  page: number;
}

const TMDB_API_KEY = '80d3df1c267378db32e702c5c3132e49';
const TMDB_READ_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4MGQzZGYxYzI2NzM3OGRiMzJlNzAyYzVjMzEzMmU0OSIsIm5iZiI6MTc1MDU5MDkzNS42OTYsInN1YiI6IjY4NTdlNWQ3OTE4YzY5YzNkNGNiNGRjNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.zYkLeTXUcByVeMAcfzHFFTi3Q8fH4YblR-X2u7PItDI';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const Movies = () => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch popular movies from TMDB
  const { data: moviesData, isLoading, error } = useQuery({
    queryKey: ['movies', currentPage, searchTerm],
    queryFn: async (): Promise<TMDBResponse> => {
      const endpoint = searchTerm 
        ? `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(searchTerm)}&page=${currentPage}`
        : `${TMDB_BASE_URL}/movie/popular?page=${currentPage}`;
      
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

  // Fetch detailed movie information when a movie is selected
  const { data: movieDetails } = useQuery({
    queryKey: ['movie-details', selectedMovie?.id],
    queryFn: async (): Promise<MovieDetails> => {
      if (!selectedMovie) throw new Error('No movie selected');
      
      const response = await fetch(`${TMDB_BASE_URL}/movie/${selectedMovie.id}`, {
        headers: {
          'Authorization': `Bearer ${TMDB_READ_ACCESS_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch movie details');
      }
      return response.json();
    },
    enabled: !!selectedMovie,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const handleClosePlayer = () => {
    setSelectedMovie(null);
  };

  const pageTitle = searchTerm 
    ? `Search Results for "${searchTerm}" - Movies | DAMITV`
    : `Movies - Stream Latest Movies Online Free | DAMITV`;
  
  const pageDescription = searchTerm
    ? `Search results for "${searchTerm}" movies. Watch free movies online in HD quality on DAMITV.`
    : 'Watch the latest movies online for free in HD quality. Stream popular movies, new releases, and classics on DAMITV - your premium destination for movie streaming.';

  const currentUrl = `https://damitv.pro/movies${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}${currentPage > 1 ? `${searchTerm ? '&' : '?'}page=${currentPage}` : ''}`;

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
        
        {selectedMovie && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Movie",
              "name": selectedMovie.title,
              "description": selectedMovie.overview,
              "datePublished": selectedMovie.release_date,
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": selectedMovie.vote_average,
                "ratingCount": selectedMovie.vote_count?.toString() || "1000",
                "bestRating": "10",
                "worstRating": "1"
              },
              "image": selectedMovie.poster_path ? `${TMDB_IMAGE_BASE_URL}${selectedMovie.poster_path}` : null
            })}
          </script>
        )}
      </Helmet>

      <PageLayout searchTerm={searchTerm} onSearch={handleSearch}>
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Movies</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Watch the latest and greatest movies
            </p>
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

          {/* Enhanced Movie Player Dialog with Detailed Information */}
          <Dialog open={!!selectedMovie} onOpenChange={handleClosePlayer}>
            <DialogContent className="max-w-6xl max-h-[90vh] p-0">
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className="text-xl font-bold">
                  {selectedMovie?.title}
                </DialogTitle>
                {movieDetails?.tagline && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    "{movieDetails.tagline}"
                  </p>
                )}
              </DialogHeader>
              <div className="p-6">
                {selectedMovie && (
                  <div className="space-y-6">
                    <AspectRatio ratio={16 / 9}>
                      <iframe
                        src={`https://rivestream.org/embed?type=movie&id=${selectedMovie.id}`}
                        className="w-full h-full rounded-lg"
                        allowFullScreen
                        title={selectedMovie.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      />
                    </AspectRatio>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Overview</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                            {selectedMovie.overview || 'No overview available.'}
                          </p>
                        </div>

                        {movieDetails?.genres && movieDetails.genres.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Genres</h4>
                            <div className="flex flex-wrap gap-2">
                              {movieDetails.genres.map((genre) => (
                                <span 
                                  key={genre.id}
                                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs"
                                >
                                  {genre.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {movieDetails?.spoken_languages && movieDetails.spoken_languages.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Languages</h4>
                            <div className="flex flex-wrap gap-2">
                              {movieDetails.spoken_languages.map((lang) => (
                                <span 
                                  key={lang.iso_639_1}
                                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-xs"
                                >
                                  {lang.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="h-4 w-4" />
                              <span className="font-semibold">Release Date</span>
                            </div>
                            <span>{selectedMovie.release_date || 'N/A'}</span>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">Rating</span>
                            </div>
                            <span>{selectedMovie.vote_average?.toFixed(1) || 'N/A'}/10</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Users className="h-4 w-4" />
                              <span className="font-semibold">Votes</span>
                            </div>
                            <span>{selectedMovie.vote_count?.toLocaleString() || 'N/A'}</span>
                          </div>
                          
                          {movieDetails?.runtime && (
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Clock className="h-4 w-4" />
                                <span className="font-semibold">Runtime</span>
                              </div>
                              <span>{movieDetails.runtime} min</span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Globe className="h-4 w-4" />
                              <span className="font-semibold">Language</span>
                            </div>
                            <span>{selectedMovie.original_language?.toUpperCase() || 'N/A'}</span>
                          </div>
                          
                          {movieDetails?.status && (
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Award className="h-4 w-4" />
                                <span className="font-semibold">Status</span>
                              </div>
                              <span>{movieDetails.status}</span>
                            </div>
                          )}
                        </div>

                        {selectedMovie.original_title !== selectedMovie.title && (
                          <div>
                            <span className="font-semibold">Original Title:</span>
                            <p className="text-gray-600 dark:text-gray-400">
                              {selectedMovie.original_title}
                            </p>
                          </div>
                        )}

                        {movieDetails?.production_countries && movieDetails.production_countries.length > 0 && (
                          <div>
                            <span className="font-semibold">Countries:</span>
                            <p className="text-gray-600 dark:text-gray-400">
                              {movieDetails.production_countries.map(country => country.name).join(', ')}
                            </p>
                          </div>
                        )}

                        {movieDetails?.budget && movieDetails.budget > 0 && (
                          <div>
                            <span className="font-semibold">Budget:</span>
                            <p className="text-gray-600 dark:text-gray-400">
                              ${movieDetails.budget.toLocaleString()}
                            </p>
                          </div>
                        )}

                        {movieDetails?.revenue && movieDetails.revenue > 0 && (
                          <div>
                            <span className="font-semibold">Revenue:</span>
                            <p className="text-gray-600 dark:text-gray-400">
                              ${movieDetails.revenue.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PageLayout>
    </>
  );
};

export default Movies;
