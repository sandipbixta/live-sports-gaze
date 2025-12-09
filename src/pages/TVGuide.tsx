import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import PageLayout from '@/components/PageLayout';
import { fetchSports, fetchMatches } from '@/api/sportsApi';
import { Match, MatchChannel } from '@/types/sports';
import { Tv, Clock, Play, Users, ChevronRight, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { isMatchLive } from '@/utils/matchUtils';

interface ChannelWithMatches {
  name: string;
  code: string;
  image?: string;
  url?: string;
  matches: Match[];
  totalViewers: number;
}

const TVGuide = () => {
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      try {
        const sports = await fetchSports();
        const matchPromises = sports.slice(0, 5).map(sport => fetchMatches(sport.id));
        const matchResults = await Promise.all(matchPromises);
        const combined = matchResults.flat();
        setAllMatches(combined);
      } catch (error) {
        console.error('Error loading matches for TV guide:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  // Build channel-to-matches mapping
  const channelsWithMatches = useMemo(() => {
    const channelMap = new Map<string, ChannelWithMatches>();

    allMatches.forEach(match => {
      if (match.channels && match.channels.length > 0) {
        match.channels.forEach(channel => {
          const key = `${channel.name}-${channel.code}`;
          if (!channelMap.has(key)) {
            channelMap.set(key, {
              name: channel.name,
              code: channel.code,
              image: channel.image,
              url: channel.url,
              matches: [],
              totalViewers: 0
            });
          }
          const existing = channelMap.get(key)!;
          existing.matches.push(match);
          existing.totalViewers += channel.viewers || 0;
        });
      }
    });

    // Sort by live matches first, then by total viewers
    return Array.from(channelMap.values())
      .sort((a, b) => {
        const aLive = a.matches.filter(m => isMatchLive(m)).length;
        const bLive = b.matches.filter(m => isMatchLive(m)).length;
        if (bLive !== aLive) return bLive - aLive;
        return b.totalViewers - a.totalViewers;
      });
  }, [allMatches]);

  // Get unique countries
  const countries = useMemo(() => {
    const countrySet = new Set<string>();
    channelsWithMatches.forEach(ch => {
      if (ch.code) countrySet.add(ch.code.toUpperCase());
    });
    return Array.from(countrySet).sort();
  }, [channelsWithMatches]);

  // Filter by country
  const filteredChannels = useMemo(() => {
    if (!selectedCountry) return channelsWithMatches;
    return channelsWithMatches.filter(ch => ch.code?.toUpperCase() === selectedCountry);
  }, [channelsWithMatches, selectedCountry]);

  const formatMatchTime = (timestamp: number) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  return (
    <>
      <Helmet>
        <title>Live TV Guide - What's On Now | DamiTV</title>
        <link rel="canonical" href="https://damitv.pro/tv-guide" />
        <meta name="description" content="Live TV guide showing what's playing now on sports channels. See current and upcoming matches with broadcast schedules." />
      </Helmet>

      <PageLayout>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-sports-primary/20 rounded-lg">
              <Radio className="w-6 h-6 text-sports-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Live TV Guide</h1>
              <p className="text-muted-foreground text-sm">What's playing now on sports channels</p>
            </div>
          </div>
        </div>

        {/* Country Filter */}
        <div className="mb-6">
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              <Button
                variant={selectedCountry === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCountry(null)}
                className="whitespace-nowrap"
              >
                All Countries
              </Button>
              {countries.slice(0, 15).map(country => (
                <Button
                  key={country}
                  variant={selectedCountry === country ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCountry(country)}
                  className="whitespace-nowrap flex items-center gap-1.5"
                >
                  <img 
                    src={`https://flagcdn.com/w20/${country.toLowerCase()}.png`}
                    alt={country}
                    className="w-4 h-3 object-cover rounded-sm"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                  {country}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="w-12 h-12 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full rounded" />
                  <Skeleton className="h-16 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="text-center py-12">
            <Tv className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No channels with scheduled matches found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredChannels.map((channel, idx) => {
              const liveMatches = channel.matches.filter(m => isMatchLive(m));
              const upcomingMatches = channel.matches.filter(m => !isMatchLive(m)).slice(0, 3);

              return (
                <div 
                  key={`${channel.name}-${channel.code}-${idx}`}
                  className="bg-card border border-border rounded-lg overflow-hidden hover:border-sports-primary/50 transition-colors"
                >
                  {/* Channel Header */}
                  <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/30">
                    <div className="w-12 h-12 rounded bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center overflow-hidden">
                      {channel.image ? (
                        <img 
                          src={channel.image} 
                          alt={channel.name}
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            (e.currentTarget.parentElement as HTMLElement).innerHTML = `<span class="text-xs font-bold text-muted-foreground">${channel.name.slice(0, 2).toUpperCase()}</span>`;
                          }}
                        />
                      ) : (
                        <Tv className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{channel.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <img 
                          src={`https://flagcdn.com/w20/${channel.code}.png`}
                          alt={channel.code.toUpperCase()}
                          className="w-4 h-3 object-cover rounded-sm"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                        <span>{channel.code.toUpperCase()}</span>
                        {channel.totalViewers > 0 && (
                          <>
                            <span>•</span>
                            <Users className="w-3 h-3" />
                            <span>{channel.totalViewers.toLocaleString()} watching</span>
                          </>
                        )}
                      </div>
                    </div>
                    {liveMatches.length > 0 && (
                      <Badge className="bg-red-500 text-white animate-pulse">
                        LIVE NOW
                      </Badge>
                    )}
                  </div>

                  {/* Matches Timeline */}
                  <div className="p-3 space-y-2">
                    {/* Live Matches */}
                    {liveMatches.map(match => (
                      <Link
                        key={match.id}
                        to={`/match/${match.sportId || 'football'}/${match.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors group"
                      >
                        <div className="flex-shrink-0 text-center w-14">
                          <div className="text-xs font-bold text-red-500 animate-pulse">● LIVE</div>
                          <div className="text-[10px] text-muted-foreground">
                            {match.date ? formatMatchTime(match.date) : ''}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {match.teams?.home?.badge && (
                              <img src={match.teams.home.badge} alt="" className="w-5 h-5 object-contain" />
                            )}
                            <span className="font-medium text-foreground text-sm truncate">
                              {match.teams?.home?.name || ''} vs {match.teams?.away?.name || match.title}
                            </span>
                            {match.teams?.away?.badge && (
                              <img src={match.teams.away.badge} alt="" className="w-5 h-5 object-contain" />
                            )}
                          </div>
                          {match.tournament && (
                            <div className="text-[10px] text-muted-foreground truncate">{match.tournament}</div>
                          )}
                        </div>
                        <Play className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                      </Link>
                    ))}

                    {/* Upcoming Matches */}
                    {upcomingMatches.map(match => (
                      <Link
                        key={match.id}
                        to={`/match/${match.sportId || 'football'}/${match.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                      >
                        <div className="flex-shrink-0 text-center w-14">
                          <div className="text-xs font-medium text-muted-foreground flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" />
                            {match.date ? formatMatchTime(match.date) : 'TBD'}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {match.teams?.home?.badge && (
                              <img src={match.teams.home.badge} alt="" className="w-4 h-4 object-contain opacity-70" />
                            )}
                            <span className="text-sm text-muted-foreground truncate group-hover:text-foreground transition-colors">
                              {match.teams?.home?.name || ''} vs {match.teams?.away?.name || match.title}
                            </span>
                            {match.teams?.away?.badge && (
                              <img src={match.teams.away.badge} alt="" className="w-4 h-4 object-contain opacity-70" />
                            )}
                          </div>
                          {match.tournament && (
                            <div className="text-[10px] text-muted-foreground/70 truncate">{match.tournament}</div>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </Link>
                    ))}

                    {channel.matches.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        No scheduled matches
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats */}
        {!loading && (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-sports-primary">{filteredChannels.length}</div>
              <div className="text-xs text-muted-foreground">Active Channels</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-500">
                {filteredChannels.reduce((acc, ch) => acc + ch.matches.filter(m => isMatchLive(m)).length, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Live Now</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {filteredChannels.reduce((acc, ch) => acc + ch.matches.length, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Total Matches</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{countries.length}</div>
              <div className="text-xs text-muted-foreground">Countries</div>
            </div>
          </div>
        )}
      </PageLayout>
    </>
  );
};

export default TVGuide;
