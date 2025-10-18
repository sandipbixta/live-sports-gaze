import { supabase } from "@/integrations/supabase/client";
import { Match } from '../types/sports';

// Generate a stable but random-looking fake viewer count for a match
const generateFakeViewerBase = (matchId: string): number => {
  // Use match ID to generate a stable seed
  let hash = 0;
  for (let i = 0; i < matchId.length; i++) {
    hash = ((hash << 5) - hash) + matchId.charCodeAt(i);
    hash = hash & hash;
  }
  
  // Generate base viewers between 500-2000
  const base = 500 + (Math.abs(hash) % 1500);
  return base;
};

// Generate realistic fluctuation based on time
const generateFluctuation = (matchId: string): number => {
  const now = Date.now();
  // Create a pseudo-random but consistent fluctuation based on time and match ID
  const timeComponent = Math.floor(now / 10000); // Changes every 10 seconds
  let seed = 0;
  for (let i = 0; i < matchId.length; i++) {
    seed += matchId.charCodeAt(i);
  }
  seed += timeComponent;
  
  // Random-looking variation between -100 and +200
  const variation = ((seed * 9301 + 49297) % 233280) / 777.6 - 150;
  return Math.floor(variation);
};

export const fetchMatchViewerCounts = async (matchIds: string[]): Promise<Map<string, number>> => {
  const viewerCounts = new Map<string, number>();
  
  try {
    // Fetch real viewer counts
    const promises = matchIds.map(async (matchId) => {
      try {
        const { data: realCount, error: countError } = await supabase
          .rpc('get_viewer_count', { match_id_param: matchId });
        
        // Generate fake base + fluctuation
        const fakeBase = generateFakeViewerBase(matchId);
        const fluctuation = generateFluctuation(matchId);
        
        // Add real viewers to fake count
        const realViewers = (!countError && realCount !== null) ? realCount : 0;
        const totalCount = fakeBase + fluctuation + realViewers;
        
        // Ensure minimum of 500 viewers
        const finalCount = Math.max(500, totalCount);
        
        if (realViewers > 0) {
          console.log(`👁️ Match ${matchId}: ${finalCount} viewers (${realViewers} real + ${fakeBase + fluctuation} fake)`);
        }
        
        viewerCounts.set(matchId, finalCount);
      } catch (err) {
        console.error(`Error fetching viewer count for match ${matchId}:`, err);
        // Even on error, show fake viewers
        const fakeBase = generateFakeViewerBase(matchId);
        const fluctuation = generateFluctuation(matchId);
        viewerCounts.set(matchId, Math.max(500, fakeBase + fluctuation));
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Error in fetchMatchViewerCounts:', error);
  }

  return viewerCounts;
};

export const enrichMatchesWithViewerCounts = async (matches: Match[]): Promise<Match[]> => {
  if (matches.length === 0) return matches;

  const matchIds = matches.map(match => match.id);
  const viewerCounts = await fetchMatchViewerCounts(matchIds);

  return matches.map(match => ({
    ...match,
    viewerCount: viewerCounts.get(match.id) || 0
  }));
};