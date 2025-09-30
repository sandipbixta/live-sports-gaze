// TMDB API Service for fetching movies and TV shows
const TMDB_API_KEY = '8d6d91941230817f7807d643736e8a49'; // Public read-only key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export interface Movie {
  id: number;
  title: string;
  original_title?: string;
  name?: string; // For TV shows
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string; // For TV shows
  vote_average: number;
  media_type?: 'movie' | 'tv';
}

export interface TVShow extends Movie {
  number_of_seasons?: number;
  seasons?: Array<{
    season_number: number;
    episode_count: number;
  }>;
}

export const getPosterUrl = (path: string | null, size: 'w200' | 'w500' | 'original' = 'w500') => {
  if (!path) return '/placeholder.svg';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280') => {
  if (!path) return '/placeholder.svg';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

const fetchTMDB = async (endpoint: string) => {
  const response = await fetch(`${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}`);
  if (!response.ok) throw new Error('Failed to fetch from TMDB');
  return response.json();
};

export const getTrending = async (mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week') => {
  const data = await fetchTMDB(`/trending/${mediaType}/${timeWindow}`);
  return data.results as Movie[];
};

export const getPopularMovies = async () => {
  const data = await fetchTMDB('/movie/popular');
  return data.results as Movie[];
};

export const getPopularTVShows = async () => {
  const data = await fetchTMDB('/tv/popular');
  return data.results as TVShow[];
};

export const getTopRatedMovies = async () => {
  const data = await fetchTMDB('/movie/top_rated');
  return data.results as Movie[];
};

export const getTopRatedTVShows = async () => {
  const data = await fetchTMDB('/tv/top_rated');
  return data.results as TVShow[];
};

export const searchContent = async (query: string) => {
  const data = await fetchTMDB(`/search/multi&query=${encodeURIComponent(query)}`);
  return data.results.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv') as Movie[];
};

export const getMovieDetails = async (movieId: number) => {
  return await fetchTMDB(`/movie/${movieId}`) as Movie;
};

export const getTVShowDetails = async (tvId: number) => {
  return await fetchTMDB(`/tv/${tvId}`) as TVShow;
};

export const getTVShowSeasons = async (tvId: number) => {
  const show = await getTVShowDetails(tvId);
  return show.seasons || [];
};
