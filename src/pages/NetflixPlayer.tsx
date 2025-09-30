import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Star, Calendar, Tv, Film } from 'lucide-react';
import { getMovieDetails, getTVShowDetails, getTVShowSeasons, Movie, TVShow, getPosterUrl, getBackdropUrl } from '@/services/tmdbService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LoadingGrid from '@/components/LoadingGrid';

const NetflixPlayer = () => {
  const { mediaType, id } = useParams<{ mediaType: string; id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<Movie | TVShow | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState('1');
  const [selectedEpisode, setSelectedEpisode] = useState('1');
  const [seasons, setSeasons] = useState<any[]>([]);

  useEffect(() => {
    loadContent();
  }, [mediaType, id]);

  const loadContent = async () => {
    if (!id || !mediaType) return;
    
    try {
      setLoading(true);
      if (mediaType === 'movie') {
        const data = await getMovieDetails(parseInt(id));
        setContent(data);
      } else {
        const data = await getTVShowDetails(parseInt(id));
        setContent(data);
        const seasonsData = await getTVShowSeasons(parseInt(id));
        setSeasons(seasonsData.filter(s => s.season_number > 0));
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <LoadingGrid />
      </PageLayout>
    );
  }

  if (!content) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Content not found</h2>
          <Button onClick={() => navigate('/netflix')}>Back to Netflix</Button>
        </div>
      </PageLayout>
    );
  }

  const title = content.title || content.name || 'Unknown';
  const year = content.release_date?.split('-')[0] || content.first_air_date?.split('-')[0] || '';
  
  // Generate Vidking embed URL
  const getEmbedUrl = () => {
    if (mediaType === 'movie') {
      return `https://www.vidking.net/embed/movie/${id}?color=e50914&autoPlay=true`;
    } else {
      return `https://www.vidking.net/embed/tv/${id}/${selectedSeason}/${selectedEpisode}?color=e50914&autoPlay=true&nextEpisode=true&episodeSelector=true`;
    }
  };

  return (
    <PageLayout>
      <Helmet>
        <title>{title} - Watch Online | Netflix - DamiTV</title>
        <meta name="description" content={`Watch ${title} online for free in HD quality. ${content.overview?.slice(0, 150) || 'Stream now on DamiTV.'}`} />
        <meta name="keywords" content={`${title}, watch online, stream free, ${mediaType === 'movie' ? 'movie' : 'tv show'}, netflix`} />
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/netflix')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Netflix
        </Button>

        {/* Player Section */}
        <div className="mb-8">
          <Card className="overflow-hidden bg-black border-0">
            <div className="aspect-video w-full">
              <iframe
                src={getEmbedUrl()}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title={title}
              />
            </div>
          </Card>
        </div>

        {/* TV Show Controls */}
        {mediaType === 'tv' && seasons.length > 0 && (
          <Card className="p-4 mb-6 bg-card border-border">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Season</label>
                <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((season) => (
                      <SelectItem key={season.season_number} value={season.season_number.toString()}>
                        Season {season.season_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Episode</label>
                <Select value={selectedEpisode} onValueChange={setSelectedEpisode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: seasons.find(s => s.season_number === parseInt(selectedSeason))?.episode_count || 10 }, (_, i) => i + 1).map((ep) => (
                      <SelectItem key={ep} value={ep.toString()}>
                        Episode {ep}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}

        {/* Content Details */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <img 
              src={getPosterUrl(content.poster_path, 'w500')}
              alt={title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
          
          <div className="md:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">{title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-lg font-semibold">{content.vote_average.toFixed(1)}</span>
              </div>
              
              {year && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{year}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                {mediaType === 'movie' ? (
                  <><Film className="w-4 h-4" /><span>Movie</span></>
                ) : (
                  <><Tv className="w-4 h-4" /><span>TV Series</span></>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Overview</h2>
              <p className="text-muted-foreground leading-relaxed">{content.overview || 'No overview available.'}</p>
            </div>

            {mediaType === 'tv' && (content as TVShow).number_of_seasons && (
              <div className="mb-4">
                <span className="font-semibold">Seasons: </span>
                <span className="text-muted-foreground">{(content as TVShow).number_of_seasons}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default NetflixPlayer;
