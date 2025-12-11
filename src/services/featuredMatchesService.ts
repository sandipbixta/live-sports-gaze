const WESTREAM_API = 'https://westream.su';
const SPORTSDB_API_V1 = 'https://www.thesportsdb.com/api/v1/json/751945';

// ============================================
// WESTREAM IMAGE URL HELPERS
// ============================================

export const getTeamBadgeUrl = (badgeId: string): string => {
  if (!badgeId) return '';
  if (badgeId.startsWith('http')) return badgeId;
  return `${WESTREAM_API}/api/images/badge/${badgeId}.webp`;
};

export const getMatchPosterUrl = (posterId: string): string => {
  if (!posterId) return '';
  if (posterId.startsWith('http')) return posterId;
  return `${WESTREAM_API}/api/images/poster/${posterId}.webp`;
};

// ============================================
// FETCH FROM WESTREAM
// ============================================

const fetchFromWeStream = async <T>(endpoint: string): Promise<T | null> => {
  try {
    const response = await fetch(`${WESTREAM_API}${endpoint}`, {
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) {
      console.warn(`WeStream API error: ${response.status}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    return null;
  }
};

// ============================================
// WESTREAM POPULAR MATCHES ENDPOINTS
// ============================================

export const getPopularLiveMatches = async (): Promise<any[]> => {
  const data = await fetchFromWeStream<any[]>('/api/matches/live/popular');
  return data || [];
};

export const getPopularMatches = async (): Promise<any[]> => {
  const data = await fetchFromWeStream<any[]>('/api/matches/all/popular');
  return data || [];
};

export const getTodayPopularMatches = async (): Promise<any[]> => {
  const data = await fetchFromWeStream<any[]>('/api/matches/all-today/popular');
  return data || [];
};

export const getAllMatches = async (): Promise<any[]> => {
  const data = await fetchFromWeStream<any[]>('/api/matches');
  return data || [];
};

// ============================================
// CHECK IF MATCH IS LIVE
// ============================================

export const isMatchLive = (match: any): boolean => {
  const now = Date.now();
  const matchTime = match.date;
  const threeHoursMs = 3 * 60 * 60 * 1000;
  return matchTime <= now && matchTime > (now - threeHoursMs);
};

// ============================================
// FETCH THESPORTSDB IMAGES (FALLBACK)
// Try: thumb -> banner -> poster -> square -> fanart
// ============================================

const fetchSportsDBEventImages = async (homeTeam: string, awayTeam: string): Promise<{
  image: string | null;
  homeBadge: string | null;
  awayBadge: string | null;
}> => {
  try {
    const eventName = `${homeTeam}_vs_${awayTeam}`.replace(/ /g, '_');
    const response = await fetch(
      `${SPORTSDB_API_V1}/searchevents.php?e=${encodeURIComponent(eventName)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.event && data.event.length > 0) {
        const event = data.event[0];
        const image = event.strThumb || event.strBanner || event.strPoster || 
                      event.strSquare || event.strFanart || null;
        return {
          image,
          homeBadge: event.strHomeTeamBadge || null,
          awayBadge: event.strAwayTeamBadge || null,
        };
      }
    }
  } catch (e) {
    // Ignore
  }
  return { image: null, homeBadge: null, awayBadge: null };
};

const fetchSportsDBTeamInfo = async (teamName: string): Promise<{ 
  badge: string | null; 
  image: string | null;
}> => {
  if (!teamName || teamName === 'TBA') return { badge: null, image: null };
  
  try {
    const response = await fetch(
      `${SPORTSDB_API_V1}/searchteams.php?t=${encodeURIComponent(teamName)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.teams && data.teams.length > 0) {
        const team = data.teams[0];
        const image = team.strBanner || team.strFanart1 || team.strTeamFanart1 || 
                      team.strFanart2 || team.strFanart3 || team.strFanart4 || 
                      team.strStadiumThumb || null;
        return {
          badge: team.strBadge || team.strLogo || null,
          image,
        };
      }
    }
  } catch (e) {
    // Ignore
  }
  return { badge: null, image: null };
};

// ============================================
// MAIN: GET FEATURED MATCHES FOR CAROUSEL
// Uses WeStream popular endpoints + TheSportsDB images
// ============================================

export const getFeaturedMatches = async (limit: number = 8): Promise<any[]> => {
  try {
    // 1. Try to get popular live matches first
    let matches = await getPopularLiveMatches();
    console.log(`🔴 Live popular: ${matches.length} matches`);
    
    // 2. If not enough, add today's popular
    if (matches.length < limit) {
      const todayPopular = await getTodayPopularMatches();
      const existingIds = new Set(matches.map(m => m.id));
      const uniqueToday = todayPopular.filter(m => !existingIds.has(m.id));
      matches = [...matches, ...uniqueToday];
      console.log(`📅 + Today popular: ${matches.length} total`);
    }
    
    // 3. If still not enough, add all popular
    if (matches.length < limit) {
      const allPopular = await getPopularMatches();
      const existingIds = new Set(matches.map(m => m.id));
      const uniqueAll = allPopular.filter(m => !existingIds.has(m.id));
      matches = [...matches, ...uniqueAll];
      console.log(`🌟 + All popular: ${matches.length} total`);
    }
    
    // 4. Fallback: get all matches if no popular found
    if (matches.length === 0) {
      const allMatches = await getAllMatches();
      // Filter to matches with teams
      matches = allMatches.filter(m => 
        m.teams?.home?.name && 
        m.teams?.away?.name && 
        m.teams.home.name !== 'TBA'
      ).slice(0, limit * 2);
      console.log(`📋 Fallback all matches: ${matches.length}`);
    }
    
    // 5. Take top matches
    const topMatches = matches.slice(0, limit * 2);
    
    // 6. Enrich with images (WeStream posters + TheSportsDB fallback)
    const enrichedMatches: any[] = [];
    
    for (const match of topMatches) {
      if (enrichedMatches.length >= limit) break;
      
      const homeTeam = match.teams?.home?.name || '';
      const awayTeam = match.teams?.away?.name || '';
      
      // WeStream images
      let poster = match.poster ? getMatchPosterUrl(match.poster) : null;
      let homeBadge = match.teams?.home?.badge ? getTeamBadgeUrl(match.teams.home.badge) : null;
      let awayBadge = match.teams?.away?.badge ? getTeamBadgeUrl(match.teams.away.badge) : null;
      
      // If no poster, fetch from TheSportsDB
      if (!poster && homeTeam && awayTeam) {
        const [eventImages, homeInfo, awayInfo] = await Promise.all([
          fetchSportsDBEventImages(homeTeam, awayTeam),
          !homeBadge ? fetchSportsDBTeamInfo(homeTeam) : Promise.resolve({ badge: null, image: null }),
          !awayBadge ? fetchSportsDBTeamInfo(awayTeam) : Promise.resolve({ badge: null, image: null }),
        ]);
        
        poster = eventImages.image || homeInfo.image || awayInfo.image;
        homeBadge = homeBadge || eventImages.homeBadge || homeInfo.badge;
        awayBadge = awayBadge || eventImages.awayBadge || awayInfo.badge;
      }
      
      // Include match if it has poster OR both badges
      if (poster || (homeBadge && awayBadge)) {
        enrichedMatches.push({
          ...match,
          poster,
          banner: poster, // Alias for compatibility
          homeBadge,
          awayBadge,
          homeTeam,
          awayTeam,
          isLive: isMatchLive(match),
        });
      }
    }
    
    console.log(`🎬 Featured: ${enrichedMatches.length} matches with images`);
    return enrichedMatches;
  } catch (error) {
    console.error('Failed to get featured matches:', error);
    return [];
  }
};

// ============================================
// GET UPCOMING EVENTS FROM THESPORTSDB
// ============================================

export const getUpcomingEvents = async (leagueId: number): Promise<any[]> => {
  try {
    const response = await fetch(
      `${SPORTSDB_API_V1}/eventsnextleague.php?id=${leagueId}`,
      { signal: AbortSignal.timeout(5000) }
    );
    
    if (response.ok) {
      const data = await response.json();
      return data.events || [];
    }
  } catch (e) {
    console.warn('Failed to get upcoming events');
  }
  
  return [];
};
