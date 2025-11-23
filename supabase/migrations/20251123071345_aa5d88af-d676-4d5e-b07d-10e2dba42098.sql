-- Create leagues table
CREATE TABLE IF NOT EXISTS public.leagues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id TEXT NOT NULL UNIQUE,
  league_name TEXT NOT NULL,
  sport TEXT NOT NULL,
  country TEXT,
  logo_url TEXT,
  description TEXT,
  website TEXT,
  year_founded INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create league_teams table
CREATE TABLE IF NOT EXISTS public.league_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id TEXT NOT NULL UNIQUE,
  team_name TEXT NOT NULL,
  league_name TEXT NOT NULL,
  sport TEXT NOT NULL,
  logo_url TEXT,
  stadium TEXT,
  description TEXT,
  year_founded INTEGER,
  country TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_teams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for leagues (public read access)
CREATE POLICY "Anyone can view leagues"
ON public.leagues
FOR SELECT
USING (true);

CREATE POLICY "Service role can insert leagues"
ON public.leagues
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update leagues"
ON public.leagues
FOR UPDATE
USING (true);

-- Create RLS policies for league_teams (public read access)
CREATE POLICY "Anyone can view league teams"
ON public.league_teams
FOR SELECT
USING (true);

CREATE POLICY "Service role can insert league teams"
ON public.league_teams
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update league teams"
ON public.league_teams
FOR UPDATE
USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_leagues_updated_at
BEFORE UPDATE ON public.leagues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_league_teams_updated_at
BEFORE UPDATE ON public.league_teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_leagues_sport ON public.leagues(sport);
CREATE INDEX idx_leagues_country ON public.leagues(country);
CREATE INDEX idx_league_teams_league_name ON public.league_teams(league_name);
CREATE INDEX idx_league_teams_sport ON public.league_teams(sport);