// Popular teams and competitions that should show viewer counts

// Premier League Teams
const PREMIER_LEAGUE_TEAMS = [
  'arsenal', 'aston villa', 'bournemouth', 'brentford', 'brighton', 
  'burnley', 'chelsea', 'crystal palace', 'everton', 'fulham',
  'leeds united', 'liverpool', 'manchester city', 'manchester united',
  'newcastle united', 'nottingham forest', 'sunderland', 
  'tottenham', 'west ham', 'wolverhampton', 'wolves'
];

// La Liga Teams
const LA_LIGA_TEAMS = [
  'athletic club', 'atletico madrid', 'atletico', 'celta vigo', 'alaves',
  'elche', 'getafe', 'girona', 'levante', 'mallorca',
  'rayo vallecano', 'espanyol', 'real betis', 'real madrid',
  'real oviedo', 'real sociedad', 'sevilla', 'valencia',
  'villarreal', 'osasuna', 'barcelona', 'barca'
];

// Serie A Teams
const SERIE_A_TEAMS = [
  'atalanta', 'bologna', 'cagliari', 'como', 'cremonese',
  'fiorentina', 'genoa', 'hellas verona', 'verona', 'inter milan', 'inter',
  'juventus', 'juve', 'lazio', 'lecce', 'milan', 'ac milan',
  'napoli', 'parma', 'pisa', 'roma', 'sassuolo', 'torino', 'udinese'
];

// Ligue 1 Teams
const LIGUE_1_TEAMS = [
  'auxerre', 'angers', 'monaco', 'lorient', 'metz', 'nantes',
  'le havre', 'nice', 'marseille', 'lyon', 'lille', 'paris fc',
  'psg', 'paris saint-germain', 'strasbourg', 'lens', 
  'brest', 'rennes', 'toulouse'
];

// WWE Events
const WWE_EVENTS = ['wwe', 'raw', 'smackdown', 'wrestlemania', 'summerslam'];

// Combat Sports
const COMBAT_SPORTS = ['ufc', 'mma', 'boxing'];

// Cricket Teams/Countries
const CRICKET_TEAMS = [
  'india', 'australia', 'new zealand', 'newzealand', 'pakistan', 
  'nepal', 'cricket', 'ipl', 'bbl', 'psl'
];

// Popular Football Clubs
const POPULAR_CLUBS = [
  'inter miami', 'miami', 'al nassr', 'al-nassr', 'alnassr',
  'al ittihad', 'al-ittihad', 'alittihad', 'al ithihad'
];

// Major Competitions
const MAJOR_COMPETITIONS = [
  'europa league', 'champions league', 'ucl', 'uel',
  'world cup', 'euro', 'copa america'
];

// Popular Other Sports
const OTHER_SPORTS = [
  'afl', 'nba', 'nfl', 'nhl', 'rugby', 'super rugby',
  'six nations', 'world cup'
];

/**
 * Check if a match title contains popular teams/competitions
 */
export const isPopularMatch = (title: string): boolean => {
  const lowerTitle = title.toLowerCase();
  
  // Check all categories
  const allKeywords = [
    ...PREMIER_LEAGUE_TEAMS,
    ...LA_LIGA_TEAMS,
    ...SERIE_A_TEAMS,
    ...LIGUE_1_TEAMS,
    ...WWE_EVENTS,
    ...COMBAT_SPORTS,
    ...CRICKET_TEAMS,
    ...POPULAR_CLUBS,
    ...MAJOR_COMPETITIONS,
    ...OTHER_SPORTS
  ];
  
  return allKeywords.some(keyword => lowerTitle.includes(keyword));
};

/**
 * Check if a match should show viewer count (popular + live)
 */
export const shouldShowViewerCount = (title: string, isLive: boolean): boolean => {
  return isLive && isPopularMatch(title);
};
