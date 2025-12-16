import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const path = url.pathname.replace('/pwa-api', '');
    
    console.log(`📡 PWA API request: ${req.method} ${path}`);

    // Route handling
    switch (true) {
      // ============ VIEWER TRACKING ============
      
      // POST /viewer/heartbeat - Track viewer presence
      case path === '/viewer/heartbeat' && req.method === 'POST': {
        const { match_id, session_id } = await req.json();
        
        if (!match_id || !session_id) {
          return new Response(
            JSON.stringify({ error: 'match_id and session_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabase.rpc('heartbeat_viewer', {
          match_id_param: match_id,
          session_id_param: session_id
        });

        if (error) {
          console.error('❌ Heartbeat error:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`✅ Heartbeat: match=${match_id}, session=${session_id}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // GET /viewer/count?match_id=xxx - Get viewer count
      case path === '/viewer/count' && req.method === 'GET': {
        const matchId = url.searchParams.get('match_id');
        
        if (!matchId) {
          return new Response(
            JSON.stringify({ error: 'match_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data, error } = await supabase.rpc('get_viewer_count', {
          match_id_param: matchId
        });

        if (error) {
          console.error('❌ Get count error:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`📊 Viewer count for ${matchId}: ${data}`);
        return new Response(
          JSON.stringify({ match_id: matchId, count: data || 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ============ ANALYTICS TRACKING ============
      
      // POST /analytics/pageview - Track page view
      case path === '/analytics/pageview' && req.method === 'POST': {
        const { page_path, page_title, session_id, referrer, user_agent } = await req.json();
        
        if (!page_path || !session_id) {
          return new Response(
            JSON.stringify({ error: 'page_path and session_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabase.from('page_views').insert({
          page_path,
          page_title: page_title || null,
          session_id,
          referrer: referrer || null,
          user_agent: user_agent || null
        });

        if (error) {
          console.error('❌ Page view error:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`📈 Page view: ${page_path}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // GET /analytics/stats - Get analytics stats
      case path === '/analytics/stats' && req.method === 'GET': {
        const { data, error } = await supabase.rpc('get_page_views_stats');

        if (error) {
          console.error('❌ Stats error:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify(data?.[0] || { total_views: 0, unique_sessions: 0, top_pages: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ============ WATCH HISTORY ============
      
      // POST /watch/history - Track watch history
      case path === '/watch/history' && req.method === 'POST': {
        const { session_id, match_id, match_title, sport_id, watch_duration } = await req.json();
        
        if (!session_id || !match_id || !match_title || !sport_id) {
          return new Response(
            JSON.stringify({ error: 'session_id, match_id, match_title, and sport_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabase
          .from('watch_history')
          .upsert({
            session_id,
            match_id,
            match_title,
            sport_id,
            watch_duration: watch_duration || 0,
            last_watched_at: new Date().toISOString()
          }, {
            onConflict: 'session_id,match_id'
          });

        if (error) {
          console.error('❌ Watch history error:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`📺 Watch history: ${match_title}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // GET /watch/history?session_id=xxx - Get watch history
      case path === '/watch/history' && req.method === 'GET': {
        const sessionId = url.searchParams.get('session_id');
        
        if (!sessionId) {
          return new Response(
            JSON.stringify({ error: 'session_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data, error } = await supabase
          .from('watch_history')
          .select('*')
          .eq('session_id', sessionId)
          .order('last_watched_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error('❌ Get history error:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ history: data || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ============ FAVORITES ============
      
      // POST /favorites - Add favorite
      case path === '/favorites' && req.method === 'POST': {
        const { session_id, favorite_id, favorite_name, favorite_type } = await req.json();
        
        if (!session_id || !favorite_id || !favorite_name || !favorite_type) {
          return new Response(
            JSON.stringify({ error: 'session_id, favorite_id, favorite_name, and favorite_type required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabase
          .from('user_favorites')
          .insert({ session_id, favorite_id, favorite_name, favorite_type });

        if (error) {
          // Check if it's a duplicate
          if (error.code === '23505') {
            return new Response(
              JSON.stringify({ success: true, message: 'Already favorited' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          console.error('❌ Add favorite error:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // DELETE /favorites - Remove favorite
      case path === '/favorites' && req.method === 'DELETE': {
        const { session_id, favorite_id } = await req.json();
        
        if (!session_id || !favorite_id) {
          return new Response(
            JSON.stringify({ error: 'session_id and favorite_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('session_id', session_id)
          .eq('favorite_id', favorite_id);

        if (error) {
          console.error('❌ Remove favorite error:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // GET /favorites?session_id=xxx - Get favorites
      case path === '/favorites' && req.method === 'GET': {
        const sessionId = url.searchParams.get('session_id');
        
        if (!sessionId) {
          return new Response(
            JSON.stringify({ error: 'session_id required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data, error } = await supabase
          .from('user_favorites')
          .select('*')
          .eq('session_id', sessionId);

        if (error) {
          console.error('❌ Get favorites error:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ favorites: data || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ============ HEALTH CHECK ============
      case path === '/health' || path === '/': {
        return new Response(
          JSON.stringify({ 
            status: 'ok', 
            version: '1.0.0',
            endpoints: [
              'POST /viewer/heartbeat',
              'GET /viewer/count?match_id=xxx',
              'POST /analytics/pageview',
              'GET /analytics/stats',
              'POST /watch/history',
              'GET /watch/history?session_id=xxx',
              'POST /favorites',
              'DELETE /favorites',
              'GET /favorites?session_id=xxx'
            ]
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Not found', path }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('❌ API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
