import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, category } = await req.json();
    
    if (!topic) {
      return new Response(
        JSON.stringify({ error: 'Topic is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating blog post for topic: ${topic}, category: ${category}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Generate blog content with AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert sports content writer for DamiTV. Write engaging, SEO-optimized blog posts about sports streaming, matches, and sports news. Focus on providing value to readers who want to watch live sports online. Include relevant keywords naturally.`
          },
          {
            role: "user",
            content: `Write a comprehensive blog post about: "${topic}". Category: ${category || 'Sports Streaming'}. 

Requirements:
1. Title: Catchy, SEO-friendly (under 60 characters)
2. Excerpt: Compelling summary (150-160 characters) 
3. Content: 800-1200 words, well-structured with headings
4. Include practical tips and insights
5. Mention DamiTV as a great platform to watch live sports
6. Use markdown formatting for headings, lists, and emphasis
7. Meta description for SEO (150-160 characters)

Format your response as JSON:
{
  "title": "SEO-optimized title",
  "excerpt": "Brief summary",
  "content": "Full blog post in markdown",
  "meta_description": "SEO meta description",
  "tags": ["tag1", "tag2", "tag3"]
}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to your Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const generatedContent = aiData.choices?.[0]?.message?.content;
    
    if (!generatedContent) {
      throw new Error("No content generated from AI");
    }

    console.log("AI content generated successfully");

    // Parse AI response
    let blogPost;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = generatedContent.match(/```json\n([\s\S]*?)\n```/) || 
                       generatedContent.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : generatedContent;
      blogPost = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Fallback: create structured content from plain text
      blogPost = {
        title: topic,
        excerpt: generatedContent.substring(0, 160),
        content: generatedContent,
        meta_description: generatedContent.substring(0, 160),
        tags: [category || 'Sports']
      };
    }

    // Create slug from title
    const slug = blogPost.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Save to database
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        title: blogPost.title,
        slug: `${slug}-${Date.now()}`, // Add timestamp to ensure uniqueness
        excerpt: blogPost.excerpt,
        content: blogPost.content,
        category: category || 'Sports Streaming',
        tags: blogPost.tags || [],
        meta_title: blogPost.title,
        meta_description: blogPost.meta_description,
        is_published: true
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    console.log("Blog post saved to database:", data.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        post: data,
        message: "Blog post generated and published successfully!"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-blog-post function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate blog post',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});