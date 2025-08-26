import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: string;
  disable_web_page_preview?: boolean;
}

interface Match {
  title: string;
  sportId: string;
  date: number;
  sources?: { source: string }[];
  teams?: {
    home?: { name: string };
    away?: { name: string };
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');

    console.log('Environment check:', {
      bot_token_exists: !!TELEGRAM_BOT_TOKEN,
      chat_id_exists: !!TELEGRAM_CHAT_ID,
      chat_id_value: TELEGRAM_CHAT_ID ? 'set' : 'not set'
    });

    if (!TELEGRAM_BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN is missing from environment');
      throw new Error('TELEGRAM_BOT_TOKEN is not configured');
    }

    if (!TELEGRAM_CHAT_ID) {
      console.error('TELEGRAM_CHAT_ID is missing from environment');
      throw new Error('TELEGRAM_CHAT_ID is not configured');
    }

    const { action, message, matches, chatId } = await req.json();

    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

    switch (action) {
      case 'send_message':
        const messageData: TelegramMessage = {
          chat_id: chatId || TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        };

        const response = await fetch(`${telegramApiUrl}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData),
        });

        const result = await response.json();
        
        if (!response.ok) {
          console.error('Telegram API error:', result);
          throw new Error(result.description || 'Failed to send message');
        }

        return new Response(JSON.stringify({ success: true, result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'post_live_matches':
        if (!matches || !Array.isArray(matches)) {
          throw new Error('Matches array is required for posting live matches');
        }

        const liveMatchesMessage = formatLiveMatchesMessage(matches);
        
        const liveResponse = await fetch(`${telegramApiUrl}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId || TELEGRAM_CHAT_ID,
            text: liveMatchesMessage,
            parse_mode: 'HTML',
            disable_web_page_preview: true
          }),
        });

        const liveResult = await liveResponse.json();
        
        if (!liveResponse.ok) {
          console.error('Telegram API error:', liveResult);
          throw new Error(liveResult.description || 'Failed to post live matches');
        }

        return new Response(JSON.stringify({ success: true, result: liveResult }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_chat_info':
        const chatResponse = await fetch(`${telegramApiUrl}/getChat?chat_id=${TELEGRAM_CHAT_ID}`, {
          method: 'GET',
        });

        const chatResult = await chatResponse.json();
        
        return new Response(JSON.stringify({ success: chatResponse.ok, result: chatResult }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'test_connection':
        const testResponse = await fetch(`${telegramApiUrl}/getMe`, {
          method: 'GET',
        });

        const testResult = await testResponse.json();
        
        return new Response(JSON.stringify({ 
          success: testResponse.ok, 
          bot: testResult.ok ? testResult.result : null,
          error: testResult.description || null
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error('Invalid action specified');
    }

  } catch (error) {
    console.error('Error in telegram-bot function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function formatLiveMatchesMessage(matches: Match[]): string {
  const now = new Date();
  const header = `🔴 <b>LIVE SPORTS MATCHES</b> 🔴\n\n📅 ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}\n\n`;
  
  if (matches.length === 0) {
    return header + "⚠️ No live matches available at the moment.\n\nStay tuned for upcoming games! 🏆";
  }

  let message = header;
  
  // Group matches by sport
  const matchesBySport: { [key: string]: Match[] } = {};
  matches.forEach(match => {
    const sport = getSportEmoji(match.sportId);
    if (!matchesBySport[sport]) {
      matchesBySport[sport] = [];
    }
    matchesBySport[sport].push(match);
  });

  // Format each sport section
  Object.entries(matchesBySport).forEach(([sportEmoji, sportMatches]) => {
    message += `${sportEmoji}\n`;
    
    sportMatches.slice(0, 5).forEach((match, index) => {
      const matchTime = new Date(match.date);
      const timeStr = matchTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      let matchTitle = match.title;
      
      // Format team names if available
      if (match.teams?.home?.name && match.teams?.away?.name) {
        matchTitle = `${match.teams.home.name} vs ${match.teams.away.name}`;
      }
      
      // Add stream count
      const streamCount = match.sources?.length || 0;
      const streamEmoji = streamCount > 0 ? ` 📺×${streamCount}` : '';
      
      message += `▸ <b>${matchTitle}</b>\n`;
      message += `  🕒 ${timeStr}${streamEmoji}\n\n`;
    });
  });

  message += `🌐 Watch all matches live at your sports streaming website!\n`;
  message += `\n#LiveSports #Streaming #Football #Basketball #Tennis`;
  
  return message;
}

function getSportEmoji(sportId: string): string {
  const sportEmojis: { [key: string]: string } = {
    'football': '⚽ FOOTBALL',
    'basketball': '🏀 BASKETBALL', 
    'tennis': '🎾 TENNIS',
    'american-football': '🏈 NFL',
    'baseball': '⚾ BASEBALL',
    'cricket': '🏏 CRICKET',
    'rugby': '🏉 RUGBY',
    'fight': '🥊 FIGHTING',
    'motor-sports': '🏎️ RACING',
    'afl': '🏈 AFL',
    'other': '🏆 OTHER SPORTS'
  };
  
  return sportEmojis[sportId] || '🏆 SPORTS';
}