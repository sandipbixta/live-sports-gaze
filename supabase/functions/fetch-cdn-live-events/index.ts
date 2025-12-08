import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_BASE = 'https://api.cdn-live.tv/api/v1/events';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sport } = await req.json();
    console.log(`Fetching CDN-Live events for sport: ${sport || 'all'}`);

    // Determine endpoint based on sport
    let endpoint = `${API_BASE}/sports/`;
    if (sport) {
      const sportLower = sport.toLowerCase();
      if (sportLower === 'football' || sportLower === 'soccer') {
        endpoint = `${API_BASE}/football/`;
      } else if (sportLower === 'nba' || sportLower === 'basketball') {
        endpoint = `${API_BASE}/nba/`;
      } else if (sportLower === 'nhl' || sportLower === 'hockey') {
        endpoint = `${API_BASE}/nhl/`;
      } else if (sportLower === 'nfl' || sportLower === 'american-football') {
        endpoint = `${API_BASE}/nfl/`;
      }
    }

    console.log(`Calling endpoint: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DAMITV/1.0'
      }
    });

    if (!response.ok) {
      console.error(`CDN-Live API error: ${response.status}`);
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    const cdnData = data['cdn-live-tv'];
    
    if (!cdnData) {
      console.log('No cdn-live-tv data in response');
      return new Response(
        JSON.stringify({ success: true, matches: [], total: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform events to match our format
    const matches: any[] = [];
    const sportCategories = ['Soccer', 'NFL', 'NBA', 'NHL'];

    for (const category of sportCategories) {
      const events = cdnData[category];
      if (!events || !Array.isArray(events)) continue;

      for (const event of events) {
        // Parse start time to unix timestamp
        let timestamp = Date.now();
        if (event.start) {
          const parsed = new Date(event.start.replace(' ', 'T') + ':00Z');
          if (!isNaN(parsed.getTime())) {
            timestamp = parsed.getTime();
          }
        }

        // Map category to our sport IDs
        let sportId = 'football';
        if (category === 'NBA') sportId = 'basketball';
        else if (category === 'NHL') sportId = 'hockey';
        else if (category === 'NFL') sportId = 'american-football';

        // Extract viewer count from first channel
        let viewerCount = 0;
        if (event.channels && event.channels.length > 0) {
          viewerCount = parseInt(event.channels[0].viewers) || 0;
        }

        // Create sources from channels
        const sources = (event.channels || []).map((ch: any, idx: number) => ({
          source: 'cdn-live',
          id: `${event.gameID}-${idx}`,
          channelName: ch.channel_name,
          channelUrl: ch.url,
          channelImage: ch.image
        }));

        matches.push({
          id: event.gameID,
          title: `${event.homeTeam} vs ${event.awayTeam}`,
          category: sportId,
          sportId: sportId,
          date: timestamp,
          poster: event.homeTeamIMG || event.awayTeamIMG,
          popular: viewerCount > 1000,
          teams: {
            home: {
              name: event.homeTeam,
              badge: event.homeTeamIMG,
              logo: event.homeTeamIMG
            },
            away: {
              name: event.awayTeam,
              badge: event.awayTeamIMG,
              logo: event.awayTeamIMG
            }
          },
          sources: sources,
          viewerCount: viewerCount,
          tournament: event.tournament,
          country: event.country,
          countryImg: event.countryIMG,
          status: event.status,
          apiSource: 'cdn-live'
        });
      }
    }

    console.log(`Successfully fetched ${matches.length} events from CDN-Live`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        matches,
        total: cdnData.total_events || matches.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-cdn-live-events:', error);
    return new Response(
      JSON.stringify({ error: error.message, matches: [] }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
