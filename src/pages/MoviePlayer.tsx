
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/button';
import { AspectRatio } from '../components/ui/aspect-ratio';
import { ArrowLeft, Calendar, Star, Clock, Globe, Users, Award } from 'lucide-react';

interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  original_language: string;
  original_title: string;
  runtime?: number;
  genres: { id: number; name: string; }[];
  production_countries: { iso_3166_1: string; name: string; }[];
  spoken_languages: { iso_639_1: string; name: string; }[];
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
}

const TMDB_READ_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4MGQzZGYxYzI2NzM3OGRiMzJlNzAyYzVjMzEzMmU0OSIsIm5iZiI6MTc1MDU5MDkzNS42OTYsInN1YiI6IjY4NTdlNWQ3OTE4YzY5YzNkNGNiNGRjNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.zYkLeTXUcByVeMAcfzHFFTi3Q8fH4YblR-X2u7PItDI';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const MoviePlayer = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const { data: movieDetails, isLoading, error } = useQuery({
    queryKey: ['movie-details', movieId],
    queryFn: async (): Promise<MovieDetails> => {
      if (!movieId) throw new Error('No movie ID provided');
      
      const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}`, {
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
    enabled: !!movieId,
  });

  if (error) {
    return (
      <>
        <Helmet>
          <title>Movie Not Found | DAMITV</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Movie Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Could not load movie details. Please try again later.
            </p>
            <Button onClick={() => navigate('/movies')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Movies
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Loading Movie... | DAMITV</title>
        </Helmet>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff5a36] mx-auto mb-4"></div>
            <p className="text-lg">Loading movie...</p>
          </div>
        </div>
      </>
    );
  }

  const pageTitle = `${movieDetails?.title} - Watch Free Online | DAMITV`;
  const pageDescription = `Watch ${movieDetails?.title} online for free in HD quality. ${movieDetails?.overview?.substring(0, 150)}...`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`${movieDetails?.title}, watch movie online, free movie streaming, HD movie, ${movieDetails?.genres.map(g => g.name).join(', ')}`} />
        
        <meta property="og:type" content="video.movie" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={movieDetails?.poster_path ? `${TMDB_IMAGE_BASE_URL}${movieDetails.poster_path}` : '/placeholder.svg'} />
        
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={pageDescription} />
        <meta property="twitter:image" content={movieDetails?.poster_path ? `${TMDB_IMAGE_BASE_URL}${movieDetails.poster_path}` : '/placeholder.svg'} />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Movie",
            "name": movieDetails?.title,
            "description": movieDetails?.overview,
            "datePublished": movieDetails?.release_date,
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": movieDetails?.vote_average,
              "ratingCount": movieDetails?.vote_count?.toString() || "1000",
              "bestRating": "10",
              "worstRating": "1"
            },
            "image": movieDetails?.poster_path ? `${TMDB_IMAGE_BASE_URL}${movieDetails.poster_path}` : null
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-2 sm:px-4 py-6">
          {/* Back Button */}
          <Button 
            variant="outline" 
            onClick={() => navigate('/movies')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Movies
          </Button>

          {movieDetails && (
            <div className="space-y-8">
              {/* Movie Title and Tagline */}
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{movieDetails.title}</h1>
                {movieDetails.tagline && (
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 italic">
                    "{movieDetails.tagline}"
                  </p>
                )}
              </div>

              {/* Video Player - Made larger for mobile */}
              <div className="w-full">
                <AspectRatio ratio={16 / 9}>
                  <div className="relative w-full h-full">
                    <iframe
                      src={`https://rivestream.org/embed?type=movie&id=${movieDetails.id}`}
                      className="w-full h-full rounded-lg shadow-lg border-0"
                      allowFullScreen
                      title={movieDetails.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      style={{ minHeight: '250px' }}
                    />
                    {/* Custom fullscreen button overlay */}
                    <button
                      onClick={() => {
                        const iframe = document.querySelector('iframe');
                        if (iframe?.requestFullscreen) {
                          iframe.requestFullscreen();
                        }
                      }}
                      className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-md transition-colors z-10"
                      title="Fullscreen"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>
                  </div>
                </AspectRatio>
              </div>

              {/* Movie Information */}
              <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold mb-3">Overview</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {movieDetails.overview || 'No overview available.'}
                    </p>
                  </div>

                  {movieDetails.genres && movieDetails.genres.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Genres</h3>
                      <div className="flex flex-wrap gap-2">
                        {movieDetails.genres.map((genre) => (
                          <span 
                            key={genre.id}
                            className="px-3 py-1 bg-[#ff5a36] text-white rounded-full text-sm font-medium"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {movieDetails.spoken_languages && movieDetails.spoken_languages.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {movieDetails.spoken_languages.map((lang) => (
                          <span 
                            key={lang.iso_639_1}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                          >
                            {lang.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Side Info */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                    <h3 className="text-xl font-semibold mb-4">Movie Details</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <div>
                          <span className="font-medium">Release Date</span>
                          <p className="text-gray-600 dark:text-gray-400">
                            {movieDetails.release_date || 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <div>
                          <span className="font-medium">Rating</span>
                          <p className="text-gray-600 dark:text-gray-400">
                            {movieDetails.vote_average?.toFixed(1) || 'N/A'}/10
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-gray-500" />
                        <div>
                          <span className="font-medium">Votes</span>
                          <p className="text-gray-600 dark:text-gray-400">
                            {movieDetails.vote_count?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      {movieDetails.runtime && (
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-gray-500" />
                          <div>
                            <span className="font-medium">Runtime</span>
                            <p className="text-gray-600 dark:text-gray-400">
                              {movieDetails.runtime} minutes
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-gray-500" />
                        <div>
                          <span className="font-medium">Language</span>
                          <p className="text-gray-600 dark:text-gray-400">
                            {movieDetails.original_language?.toUpperCase() || 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      {movieDetails.status && (
                        <div className="flex items-center gap-3">
                          <Award className="h-5 w-5 text-gray-500" />
                          <div>
                            <span className="font-medium">Status</span>
                            <p className="text-gray-600 dark:text-gray-400">
                              {movieDetails.status}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                    <h3 className="text-xl font-semibold mb-4">Additional Info</h3>
                    <div className="space-y-3">
                      {movieDetails.original_title !== movieDetails.title && (
                        <div>
                          <span className="font-medium">Original Title:</span>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {movieDetails.original_title}
                          </p>
                        </div>
                      )}

                      {movieDetails.production_countries && movieDetails.production_countries.length > 0 && (
                        <div>
                          <span className="font-medium">Countries:</span>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {movieDetails.production_countries.map(country => country.name).join(', ')}
                          </p>
                        </div>
                      )}

                      {movieDetails.budget && movieDetails.budget > 0 && (
                        <div>
                          <span className="font-medium">Budget:</span>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            ${movieDetails.budget.toLocaleString()}
                          </p>
                        </div>
                      )}

                      {movieDetails.revenue && movieDetails.revenue > 0 && (
                        <div>
                          <span className="font-medium">Revenue:</span>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            ${movieDetails.revenue.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MoviePlayer;
