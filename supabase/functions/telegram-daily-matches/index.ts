import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Match {
  id: string;
  title: string;
  category: string;
  date: number;
  teams?: {
    home?: { name: string; };
    away?: { name: string; };
  };
}

const formatMatches = (matches: Match[]): string => {
  if (matches.length === 0) {
    return "🔍 No matches scheduled for today.";
  }

  // Group matches by sport category
  const groupedMatches = matches.reduce((acc, match) => {
    const sport = match.category || 'Other';
    if (!acc[sport]) acc[sport] = [];
    acc[sport].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  let message = "🏆 **Today's Sports Matches** 🏆\n\n";

  Object.entries(groupedMatches).forEach(([sport, sportMatches]) => {
    const sportIcon = getSportIcon(sport);
    message += `${sportIcon} **${sport.toUpperCase()}**\n`;
    
    sportMatches.slice(0, 5).forEach(match => { // Limit to 5 matches per sport
      const time = new Date(match.date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      if (match.teams?.home && match.teams?.away) {
        message += `⚽ ${time} - ${match.teams.home.name} vs ${match.teams.away.name}\n`;
      } else {
        message += `⚽ ${time} - ${match.title}\n`;
      }
    });
    
    if (sportMatches.length > 5) {
      message += `📋 ...and ${sportMatches.length - 5} more matches\n`;
    }
    message += '\n';
  });

  message += "📱 Watch live at our platform!\n";
  message += "🔔 Daily updates delivered automatically";
  
  return message;
};

const getSportIcon = (sport: string): string => {
  const icons: Record<string, string> = {
    'football': '⚽',
    'basketball': '🏀',
    'tennis': '🎾',
    'hockey': '🏒',
    'baseball': '⚾',
    'american-football': '🏈',
    'motor-sports': '🏎️',
    'fight': '🥊',
    'rugby': '🏉',
    'golf': '⛳',
    'cricket': '🏏',
    'darts': '🎯',
    'billiards': '🎱',
    'afl': '🏉',
    'other': '🏆'
  };
  return icons[sport.toLowerCase()] || '🏆';
};

const fetchTodayMatches = async (): Promise<Match[]> => {
  try {
    console.log('Fetching today\'s matches...');
    const response = await fetch('https://streamed.pk/api/matches/all', {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const allMatches = await response.json();
    console.log(`Fetched ${allMatches.length} total matches`);

    // Filter matches for today
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const endOfDay = startOfDay + (24 * 60 * 60 * 1000);

    const todayMatches = allMatches.filter((match: Match) => {
      const matchDate = match.date;
      return matchDate >= startOfDay && matchDate < endOfDay;
    });

    console.log(`Filtered to ${todayMatches.length} matches for today`);
    return todayMatches;
  } catch (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }
};

const sendTelegramMessage = async (message: string): Promise<void> => {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

  if (!botToken || !chatId) {
    throw new Error('Missing Telegram bot token or chat ID');
  }

  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: 'Markdown'
  };

  console.log('Sending message to Telegram...');
  
  const response = await fetch(telegramUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('Message sent successfully:', result.message_id);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting daily matches job...');
    
    // Fetch today's matches
    const matches = await fetchTodayMatches();
    
    // Format message
    const message = formatMatches(matches);
    console.log('Formatted message:', message.substring(0, 200) + '...');
    
    // Send to Telegram
    await sendTelegramMessage(message);
    
    // Group matches by sport for the response
    const matchesBySport = matches.reduce((acc, match) => {
      const sport = match.category || 'Other';
      if (!acc[sport]) acc[sport] = [];
      acc[sport].push({
        title: match.title,
        time: new Date(match.date).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        teams: match.teams
      });
      return acc;
    }, {} as Record<string, any[]>);

    return new Response(
      JSON.stringify({ 
        success: true, 
        matchesFound: matches.length,
        matchesBySport,
        message: `Successfully sent ${matches.length} matches to Telegram`,
        sentAt: new Date().toISOString(),
        telegramMessage: message.substring(0, 500) + (message.length > 500 ? '...' : '')
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in telegram-daily-matches function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});