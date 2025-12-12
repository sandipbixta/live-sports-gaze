-- Create chat_messages table for live chat functionality
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_chat_messages_match_id ON public.chat_messages(match_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat messages
CREATE POLICY "Anyone can view chat messages" 
ON public.chat_messages 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert chat messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (true);

-- Create head_to_head_stats table for team vs team statistics
CREATE TABLE public.head_to_head_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_a_name TEXT NOT NULL,
  team_b_name TEXT NOT NULL,
  sport TEXT NOT NULL,
  total_matches INTEGER DEFAULT 0,
  team_a_wins INTEGER DEFAULT 0,
  team_b_wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  last_5_results TEXT[] DEFAULT '{}',
  last_match_date TIMESTAMP WITH TIME ZONE,
  last_match_score TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_h2h_teams ON public.head_to_head_stats(team_a_name, team_b_name);
CREATE INDEX idx_h2h_sport ON public.head_to_head_stats(sport);

-- Enable Row Level Security
ALTER TABLE public.head_to_head_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for head_to_head_stats
CREATE POLICY "Anyone can view head to head stats" 
ON public.head_to_head_stats 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can insert head to head stats" 
ON public.head_to_head_stats 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service role can update head to head stats" 
ON public.head_to_head_stats 
FOR UPDATE 
USING (true);