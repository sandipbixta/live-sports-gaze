import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Sports topics to rotate through for daily content
const dailyTopics = [
  "Top 5 Most Anticipated Football Matches This Week",
  "Basketball Stars to Watch: Rising Talents in 2025",
  "Cricket World Cup Preview: Teams and Predictions",
  "UFC Fight Night Recap: Biggest Knockouts and Upsets",
  "Tennis Grand Slam Season: What to Expect",
  "Formula 1 Championship Update: Driver Standings",
  "NFL Playoff Race: Teams Fighting for Position",
  "Premier League Analysis: Title Race Breakdown",
  "NBA All-Star Game Preview: Players and Matchups",
  "Champions League Knockout Stage: Key Fixtures",
  "Boxing Heavyweight Division: Upcoming Fights",
  "NHL Stanley Cup Favorites: Season Analysis",
  "Rugby World Cup Qualifying: Teams to Watch",
  "Golf Masters Tournament Preview",
  "Wimbledon Championship Predictions"
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting daily blog generation...');
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Select a random topic for today
    const topic = dailyTopics[Math.floor(Math.random() * dailyTopics.length)];
    console.log('Selected topic:', topic);

    // Generate the blog post content using AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a professional sports content writer for DamiTV, a live sports streaming platform. Write engaging, informative, and SEO-optimized blog posts about sports events, matches, and analysis."
          },
          {
            role: "user",
            content: `Write a comprehensive blog post about: "${topic}". 

Include:
- An engaging introduction
- Detailed analysis with 3-5 main sections
- Player/team statistics and insights
- Expert predictions or recommendations
- A compelling conclusion

Make it informative, entertaining, and around 1000-1500 words. Use markdown formatting for better readability.`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI generation failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    console.log('Content generated successfully');

    // Generate slug from topic
    const slug = topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Extract first paragraph for excerpt
    const excerpt = content.split('\n\n')[0].replace(/^#+\s+/, '').substring(0, 200) + '...';

    // Determine category based on topic keywords
    let category = 'Sports News';
    if (topic.toLowerCase().includes('football') || topic.toLowerCase().includes('premier league')) {
      category = 'Football';
    } else if (topic.toLowerCase().includes('basketball') || topic.toLowerCase().includes('nba')) {
      category = 'Basketball';
    } else if (topic.toLowerCase().includes('cricket')) {
      category = 'Cricket';
    } else if (topic.toLowerCase().includes('ufc') || topic.toLowerCase().includes('boxing')) {
      category = 'Combat Sports';
    }

    // Generate meta description
    const metaDescription = `${excerpt.substring(0, 160)}`;

    // Insert into database
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        title: topic,
        slug: `${slug}-${Date.now()}`, // Add timestamp to ensure uniqueness
        content,
        excerpt,
        category,
        tags: [category, 'Live Sports', 'DamiTV', 'Streaming'],
        meta_title: `${topic} | DamiTV Sports Blog`,
        meta_description: metaDescription,
        is_published: true,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Blog post created successfully:', data.slug);

    return new Response(
      JSON.stringify({ 
        success: true, 
        slug: data.slug,
        title: data.title,
        message: 'Daily blog post generated successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in generate-daily-blog:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
