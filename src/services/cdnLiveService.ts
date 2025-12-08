import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/types/sports";

export interface CdnLiveMatch extends Match {
  tournament?: string;
  country?: string;
  countryImg?: string;
  status?: string;
  apiSource?: string;
}

export async function fetchCdnLiveEvents(sport?: string): Promise<CdnLiveMatch[]> {
  try {
    console.log(`[CDN-Live] Fetching events for sport: ${sport || 'all'}`);
    
    const { data, error } = await supabase.functions.invoke('fetch-cdn-live-events', {
      body: { sport }
    });

    if (error) {
      console.error('[CDN-Live] Function error:', error);
      return [];
    }

    if (!data?.success || !data?.matches) {
      console.log('[CDN-Live] No matches in response');
      return [];
    }

    console.log(`[CDN-Live] Fetched ${data.matches.length} events`);
    return data.matches as CdnLiveMatch[];
  } catch (error) {
    console.error('[CDN-Live] Service error:', error);
    return [];
  }
}

export async function fetchAllCdnLiveEvents(): Promise<CdnLiveMatch[]> {
  return fetchCdnLiveEvents();
}

export async function fetchCdnLiveLiveEvents(): Promise<CdnLiveMatch[]> {
  const events = await fetchCdnLiveEvents();
  return events.filter(event => event.status === 'live');
}

export async function fetchCdnLiveUpcomingEvents(): Promise<CdnLiveMatch[]> {
  const events = await fetchCdnLiveEvents();
  return events.filter(event => event.status === 'upcoming' || event.status !== 'finished');
}
