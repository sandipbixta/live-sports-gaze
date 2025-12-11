// ============================================
// MULTI-SPORT LOGO SERVICE
// Free sources for all sports logos
// ============================================

// ESPN CDN - FREE, no API key needed, direct image URLs
const ESPN_CDN = 'https://a.espncdn.com/i/teamlogos';

// TheSportsDB - Fallback (rate limited but comprehensive)
const SPORTSDB_API = 'https://www.thesportsdb.com/api/v1/json/123';

// Football-Data.org crests
const FOOTBALL_DATA_CDN = 'https://crests.football-data.org';

// ============================================
// ESPN DIRECT LOGO URLS (No API call needed!)
// ============================================

// NBA Teams
const NBA_TEAMS: Record<string, string> = {
  'lakers': 'lal', 'los angeles lakers': 'lal',
  'celtics': 'bos', 'boston celtics': 'bos',
  'warriors': 'gs', 'golden state warriors': 'gs',
  'bulls': 'chi', 'chicago bulls': 'chi',
  'heat': 'mia', 'miami heat': 'mia',
  'knicks': 'ny', 'new york knicks': 'ny',
  'nets': 'bkn', 'brooklyn nets': 'bkn',
  'sixers': 'phi', '76ers': 'phi', 'philadelphia 76ers': 'phi',
  'raptors': 'tor', 'toronto raptors': 'tor',
  'bucks': 'mil', 'milwaukee bucks': 'mil',
  'mavericks': 'dal', 'dallas mavericks': 'dal',
  'spurs': 'sa', 'san antonio spurs': 'sa',
  'rockets': 'hou', 'houston rockets': 'hou',
  'suns': 'phx', 'phoenix suns': 'phx',
  'nuggets': 'den', 'denver nuggets': 'den',
  'jazz': 'utah', 'utah jazz': 'utah',
  'blazers': 'por', 'trail blazers': 'por', 'portland trail blazers': 'por',
  'thunder': 'okc', 'oklahoma city thunder': 'okc',
  'clippers': 'lac', 'la clippers': 'lac',
  'kings': 'sac', 'sacramento kings': 'sac',
  'hawks': 'atl', 'atlanta hawks': 'atl',
  'hornets': 'cha', 'charlotte hornets': 'cha',
  'magic': 'orl', 'orlando magic': 'orl',
  'wizards': 'wsh', 'washington wizards': 'wsh',
  'pacers': 'ind', 'indiana pacers': 'ind',
  'pistons': 'det', 'detroit pistons': 'det',
  'cavaliers': 'cle', 'cleveland cavaliers': 'cle',
  'timberwolves': 'min', 'minnesota timberwolves': 'min',
  'pelicans': 'no', 'new orleans pelicans': 'no',
  'grizzlies': 'mem', 'memphis grizzlies': 'mem',
};

// NFL Teams
const NFL_TEAMS: Record<string, string> = {
  'chiefs': 'kc', 'kansas city chiefs': 'kc',
  'eagles': 'phi', 'philadelphia eagles': 'phi',
  'bills': 'buf', 'buffalo bills': 'buf',
  'cowboys': 'dal', 'dallas cowboys': 'dal',
  '49ers': 'sf', 'san francisco 49ers': 'sf',
  'bengals': 'cin', 'cincinnati bengals': 'cin',
  'ravens': 'bal', 'baltimore ravens': 'bal',
  'lions': 'det', 'detroit lions': 'det',
  'dolphins': 'mia', 'miami dolphins': 'mia',
  'chargers': 'lac', 'los angeles chargers': 'lac',
  'jaguars': 'jax', 'jacksonville jaguars': 'jax',
  'vikings': 'min', 'minnesota vikings': 'min',
  'seahawks': 'sea', 'seattle seahawks': 'sea',
  'giants': 'nyg', 'new york giants': 'nyg',
  'jets': 'nyj', 'new york jets': 'nyj',
  'packers': 'gb', 'green bay packers': 'gb',
  'steelers': 'pit', 'pittsburgh steelers': 'pit',
  'broncos': 'den', 'denver broncos': 'den',
  'raiders': 'lv', 'las vegas raiders': 'lv',
  'patriots': 'ne', 'new england patriots': 'ne',
  'browns': 'cle', 'cleveland browns': 'cle',
  'commanders': 'wsh', 'washington commanders': 'wsh',
  'texans': 'hou', 'houston texans': 'hou',
  'colts': 'ind', 'indianapolis colts': 'ind',
  'titans': 'ten', 'tennessee titans': 'ten',
  'saints': 'no', 'new orleans saints': 'no',
  'falcons': 'atl', 'atlanta falcons': 'atl',
  'panthers': 'car', 'carolina panthers': 'car',
  'buccaneers': 'tb', 'tampa bay buccaneers': 'tb',
  'cardinals': 'ari', 'arizona cardinals': 'ari',
  'rams': 'lar', 'los angeles rams': 'lar',
  'bears': 'chi', 'chicago bears': 'chi',
};

// NHL Teams
const NHL_TEAMS: Record<string, string> = {
  'maple leafs': 'tor', 'toronto maple leafs': 'tor',
  'canadiens': 'mtl', 'montreal canadiens': 'mtl',
  'bruins': 'bos', 'boston bruins': 'bos',
  'rangers': 'nyr', 'new york rangers': 'nyr',
  'islanders': 'nyi', 'new york islanders': 'nyi',
  'penguins': 'pit', 'pittsburgh penguins': 'pit',
  'flyers': 'phi', 'philadelphia flyers': 'phi',
  'capitals': 'wsh', 'washington capitals': 'wsh',
  'red wings': 'det', 'detroit red wings': 'det',
  'blackhawks': 'chi', 'chicago blackhawks': 'chi',
  'avalanche': 'col', 'colorado avalanche': 'col',
  'lightning': 'tb', 'tampa bay lightning': 'tb',
  'panthers': 'fla', 'florida panthers': 'fla',
  'oilers': 'edm', 'edmonton oilers': 'edm',
  'flames': 'cgy', 'calgary flames': 'cgy',
  'canucks': 'van', 'vancouver canucks': 'van',
  'kraken': 'sea', 'seattle kraken': 'sea',
  'golden knights': 'vgk', 'vegas golden knights': 'vgk',
  'sharks': 'sj', 'san jose sharks': 'sj',
  'kings': 'la', 'la kings': 'la',
  'ducks': 'ana', 'anaheim ducks': 'ana',
  'coyotes': 'ari', 'arizona coyotes': 'ari',
  'stars': 'dal', 'dallas stars': 'dal',
  'blues': 'stl', 'st. louis blues': 'stl', 'st louis blues': 'stl',
  'wild': 'min', 'minnesota wild': 'min',
  'predators': 'nsh', 'nashville predators': 'nsh',
  'jets': 'wpg', 'winnipeg jets': 'wpg',
  'senators': 'ott', 'ottawa senators': 'ott',
  'hurricanes': 'car', 'carolina hurricanes': 'car',
  'devils': 'njd', 'new jersey devils': 'njd',
  'blue jackets': 'cbj', 'columbus blue jackets': 'cbj',
  'sabres': 'buf', 'buffalo sabres': 'buf',
};

// MLB Teams
const MLB_TEAMS: Record<string, string> = {
  'yankees': 'nyy', 'new york yankees': 'nyy',
  'red sox': 'bos', 'boston red sox': 'bos',
  'dodgers': 'lad', 'los angeles dodgers': 'lad',
  'cubs': 'chc', 'chicago cubs': 'chc',
  'white sox': 'chw', 'chicago white sox': 'chw',
  'giants': 'sf', 'san francisco giants': 'sf',
  'cardinals': 'stl', 'st. louis cardinals': 'stl', 'st louis cardinals': 'stl',
  'mets': 'nym', 'new york mets': 'nym',
  'braves': 'atl', 'atlanta braves': 'atl',
  'astros': 'hou', 'houston astros': 'hou',
  'phillies': 'phi', 'philadelphia phillies': 'phi',
  'padres': 'sd', 'san diego padres': 'sd',
  'rangers': 'tex', 'texas rangers': 'tex',
  'mariners': 'sea', 'seattle mariners': 'sea',
  'angels': 'laa', 'los angeles angels': 'laa',
  'athletics': 'oak', 'oakland athletics': 'oak',
  'twins': 'min', 'minnesota twins': 'min',
  'tigers': 'det', 'detroit tigers': 'det',
  'royals': 'kc', 'kansas city royals': 'kc',
  'guardians': 'cle', 'cleveland guardians': 'cle',
  'orioles': 'bal', 'baltimore orioles': 'bal',
  'rays': 'tb', 'tampa bay rays': 'tb',
  'blue jays': 'tor', 'toronto blue jays': 'tor',
  'nationals': 'wsh', 'washington nationals': 'wsh',
  'marlins': 'mia', 'miami marlins': 'mia',
  'brewers': 'mil', 'milwaukee brewers': 'mil',
  'reds': 'cin', 'cincinnati reds': 'cin',
  'pirates': 'pit', 'pittsburgh pirates': 'pit',
  'rockies': 'col', 'colorado rockies': 'col',
  'diamondbacks': 'ari', 'arizona diamondbacks': 'ari',
};

// F1 Teams
const F1_TEAMS: Record<string, string> = {
  'red bull': 'red-bull-racing',
  'red bull racing': 'red-bull-racing',
  'mercedes': 'mercedes',
  'ferrari': 'ferrari',
  'mclaren': 'mclaren',
  'aston martin': 'aston-martin',
  'alpine': 'alpine',
  'williams': 'williams',
  'alphatauri': 'alphatauri',
  'rb': 'rb',
  'alfa romeo': 'alfa-romeo',
  'haas': 'haas',
  'sauber': 'sauber',
};

// AFL Teams (Australian Football)
const AFL_TEAMS: Record<string, string> = {
  'collingwood': 'coll',
  'richmond': 'rich',
  'carlton': 'carl',
  'essendon': 'ess',
  'hawthorn': 'haw',
  'geelong': 'geel',
  'west coast': 'wce',
  'west coast eagles': 'wce',
  'sydney': 'syd',
  'sydney swans': 'syd',
  'brisbane': 'bris',
  'brisbane lions': 'bris',
  'adelaide': 'adel',
  'adelaide crows': 'adel',
  'port adelaide': 'port',
  'port adelaide power': 'port',
  'fremantle': 'fre',
  'fremantle dockers': 'fre',
  'melbourne': 'melb',
  'melbourne demons': 'melb',
  'western bulldogs': 'wb',
  'st kilda': 'stk',
  'st kilda saints': 'stk',
  'north melbourne': 'nmfc',
  'north melbourne kangaroos': 'nmfc',
  'gws': 'gws',
  'gws giants': 'gws',
  'gold coast': 'gcfc',
  'gold coast suns': 'gcfc',
};

// Football/Soccer Teams (using football-data.org IDs)
const FOOTBALL_TEAMS: Record<string, number> = {
  // Premier League
  'arsenal': 57, 'aston villa': 58, 'bournemouth': 1044, 'brentford': 402,
  'brighton': 397, 'brighton & hove albion': 397, 'chelsea': 61, 'crystal palace': 354, 
  'everton': 62, 'fulham': 63, 'ipswich': 349, 'ipswich town': 349, 'leicester': 338, 
  'leicester city': 338, 'liverpool': 64, 'manchester city': 65, 'man city': 65,
  'manchester united': 66, 'man united': 66, 'man utd': 66, 'newcastle': 67,
  'newcastle united': 67, 'nottingham forest': 351, "nott'm forest": 351,
  'southampton': 340, 'tottenham': 73, 'tottenham hotspur': 73, 'spurs': 73,
  'west ham': 563, 'west ham united': 563, 'wolves': 76, 'wolverhampton': 76,
  'wolverhampton wanderers': 76,
  
  // La Liga
  'real madrid': 86, 'barcelona': 81, 'fc barcelona': 81, 'atletico madrid': 78,
  'atletico de madrid': 78, 'sevilla': 559, 'real sociedad': 92, 'villarreal': 94,
  'athletic bilbao': 77, 'athletic club': 77, 'valencia': 95, 'real betis': 90,
  'girona': 298, 'celta vigo': 558, 'getafe': 82, 'osasuna': 79, 'mallorca': 89,
  'las palmas': 275, 'alaves': 263, 'rayo vallecano': 87,
  
  // Bundesliga
  'bayern munich': 5, 'bayern': 5, 'bayern munchen': 5, 'borussia dortmund': 4, 
  'dortmund': 4, 'bvb': 4, 'rb leipzig': 721, 'leipzig': 721, 'bayer leverkusen': 3,
  'leverkusen': 3, 'eintracht frankfurt': 19, 'frankfurt': 19, 'wolfsburg': 11,
  'hoffenheim': 2, 'union berlin': 28, 'freiburg': 17, 'gladbach': 18,
  'borussia monchengladbach': 18, 'werder bremen': 12, 'bremen': 12,
  'mainz': 28, 'augsburg': 16, 'bochum': 36, 'heidenheim': 44,
  'st pauli': 20, 'st. pauli': 20, 'stuttgart': 10, 'vfb stuttgart': 10,
  
  // Serie A  
  'juventus': 109, 'juve': 109, 'inter': 108, 'inter milan': 108, 'internazionale': 108,
  'ac milan': 98, 'milan': 98, 'napoli': 113, 'roma': 100, 'as roma': 100,
  'lazio': 110, 'atalanta': 102, 'fiorentina': 99, 'torino': 586, 'bologna': 103,
  'monza': 5935, 'genoa': 107, 'cagliari': 104, 'verona': 450, 'hellas verona': 450,
  'udinese': 115, 'empoli': 749, 'lecce': 5911, 'parma': 112, 'venezia': 454, 'como': 5890,
  
  // Ligue 1
  'psg': 524, 'paris saint-germain': 524, 'paris saint germain': 524, 'marseille': 516,
  'olympique marseille': 516, 'om': 516, 'monaco': 548, 'as monaco': 548, 'lyon': 523,
  'olympique lyon': 523, 'ol': 523, 'lille': 521, 'losc': 521, 'nice': 522,
  'ogc nice': 522, 'lens': 546, 'rc lens': 546, 'rennes': 529, 'stade rennais': 529,
  'strasbourg': 576, 'rc strasbourg': 576, 'nantes': 543, 'fc nantes': 543,
  'reims': 547, 'stade reims': 547, 'montpellier': 518, 'toulouse': 511,
  'brest': 512, 'stade brest': 512, 'le havre': 541, 'saint-etienne': 527,
  'auxerre': 519, 'angers': 532,
  
  // Champions League / Europa League popular teams
  'benfica': 1903, 'porto': 503, 'sporting': 498, 'sporting cp': 498,
  'ajax': 678, 'psv': 674, 'psv eindhoven': 674, 'feyenoord': 675,
  'celtic': 732, 'rangers': 739, 'galatasaray': 353, 'fenerbahce': 612,
  'besiktas': 114, 'olympiacos': 567, 'panathinaikos': 551,
  'red star': 560, 'crvena zvezda': 560, 'dinamo zagreb': 755, 
  'shakhtar': 660, 'shakhtar donetsk': 660, 'dynamo kyiv': 671,
  'salzburg': 368, 'red bull salzburg': 368, 'sturm graz': 5988,
  'brugge': 851, 'club brugge': 851, 'anderlecht': 266, 'gent': 309, 'genk': 670,
  'sparta prague': 575, 'slavia prague': 580, 'viktoria plzen': 728,
  'young boys': 1871, 'fc basel': 674, 'fc zurich': 1896,
  'copenhagen': 350, 'midtjylland': 315, 'fc midtjylland': 315,
  'malmo': 323, 'molde': 1434, 'bodo glimt': 1416, 'rosenborg': 1419,
  'legia warsaw': 737, 'lech poznan': 1126,
};

// Cricket Teams
const CRICKET_TEAMS: Record<string, string> = {
  'india': 'india',
  'australia': 'australia',
  'england': 'england',
  'pakistan': 'pakistan',
  'south africa': 'south-africa',
  'new zealand': 'new-zealand',
  'west indies': 'west-indies',
  'sri lanka': 'sri-lanka',
  'bangladesh': 'bangladesh',
  'afghanistan': 'afghanistan',
  'zimbabwe': 'zimbabwe',
  'ireland': 'ireland',
  'netherlands': 'netherlands',
  'scotland': 'scotland',
  'nepal': 'nepal',
  'uae': 'uae',
  'usa': 'usa',
};

// Rugby Teams
const RUGBY_TEAMS: Record<string, string> = {
  'all blacks': 'new-zealand',
  'new zealand': 'new-zealand',
  'springboks': 'south-africa',
  'south africa': 'south-africa',
  'wallabies': 'australia',
  'australia': 'australia',
  'england': 'england',
  'france': 'france',
  'ireland': 'ireland',
  'wales': 'wales',
  'scotland': 'scotland',
  'italy': 'italy',
  'argentina': 'argentina',
  'pumas': 'argentina',
  'fiji': 'fiji',
  'samoa': 'samoa',
  'tonga': 'tonga',
  'japan': 'japan',
};

// ============================================
// NORMALIZE FUNCTION
// ============================================
const normalize = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/fc$/i, '')
    .replace(/^fc /i, '')
    .replace(/ fc$/i, '')
    .replace(/\./g, '')
    .replace(/'/g, '')
    .replace(/é/g, 'e')
    .replace(/á/g, 'a')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ñ/g, 'n')
    .trim();
};

// ============================================
// GET LOGO BY SPORT
// ============================================

export const getLogoUrl = (
  teamName: string, 
  sport?: string
): string | null => {
  if (!teamName) return null;
  
  const name = normalize(teamName);
  const sportLower = (sport || '').toLowerCase();
  
  // Try sport-specific first
  if (sportLower.includes('basketball') || sportLower.includes('nba')) {
    const abbrev = NBA_TEAMS[name];
    if (abbrev) return `${ESPN_CDN}/nba/500/${abbrev}.png`;
  }
  
  if (sportLower.includes('nfl') || sportLower.includes('american football')) {
    const abbrev = NFL_TEAMS[name];
    if (abbrev) return `${ESPN_CDN}/nfl/500/${abbrev}.png`;
  }
  
  if (sportLower.includes('hockey') || sportLower.includes('nhl') || sportLower.includes('ice hockey')) {
    const abbrev = NHL_TEAMS[name];
    if (abbrev) return `${ESPN_CDN}/nhl/500/${abbrev}.png`;
  }
  
  if (sportLower.includes('baseball') || sportLower.includes('mlb')) {
    const abbrev = MLB_TEAMS[name];
    if (abbrev) return `${ESPN_CDN}/mlb/500/${abbrev}.png`;
  }
  
  if (sportLower.includes('f1') || sportLower.includes('formula') || sportLower.includes('motorsport')) {
    const team = F1_TEAMS[name];
    if (team) return `https://media.formula1.com/content/dam/fom-website/teams/2024/${team}-logo.png`;
  }
  
  if (sportLower.includes('afl') || sportLower.includes('australian football')) {
    const abbrev = AFL_TEAMS[name];
    if (abbrev) return `${ESPN_CDN}/afl/500/${abbrev}.png`;
  }
  
  if (sportLower.includes('football') || sportLower.includes('soccer')) {
    const id = FOOTBALL_TEAMS[name];
    if (id) return `${FOOTBALL_DATA_CDN}/${id}.png`;
  }
  
  // Try all sports if no specific sport given
  if (!sportLower) {
    // Try Football first (most common)
    if (FOOTBALL_TEAMS[name]) return `${FOOTBALL_DATA_CDN}/${FOOTBALL_TEAMS[name]}.png`;
    // Try NBA
    if (NBA_TEAMS[name]) return `${ESPN_CDN}/nba/500/${NBA_TEAMS[name]}.png`;
    // Try NFL
    if (NFL_TEAMS[name]) return `${ESPN_CDN}/nfl/500/${NFL_TEAMS[name]}.png`;
    // Try NHL
    if (NHL_TEAMS[name]) return `${ESPN_CDN}/nhl/500/${NHL_TEAMS[name]}.png`;
    // Try MLB
    if (MLB_TEAMS[name]) return `${ESPN_CDN}/mlb/500/${MLB_TEAMS[name]}.png`;
    // Try AFL
    if (AFL_TEAMS[name]) return `${ESPN_CDN}/afl/500/${AFL_TEAMS[name]}.png`;
  }
  
  return null;
};

// ============================================
// ASYNC FALLBACK TO THESPORTSDB
// ============================================

const logoCache = new Map<string, string | null>();

export const getLogoAsync = async (
  teamName: string, 
  sport?: string
): Promise<string | null> => {
  // Try direct URL first (instant)
  const directUrl = getLogoUrl(teamName, sport);
  if (directUrl) return directUrl;
  
  // Check memory cache
  const cacheKey = `${normalize(teamName)}_${sport || 'all'}`;
  if (logoCache.has(cacheKey)) {
    return logoCache.get(cacheKey) || null;
  }
  
  // Check localStorage
  try {
    const stored = localStorage.getItem(`logo_${cacheKey}`);
    if (stored !== null) {
      logoCache.set(cacheKey, stored || null);
      return stored || null;
    }
  } catch (e) {
    // localStorage might not be available
  }
  
  // Fallback to TheSportsDB (rate limited, use sparingly)
  try {
    const response = await fetch(
      `${SPORTSDB_API}/searchteams.php?t=${encodeURIComponent(teamName)}`,
      { signal: AbortSignal.timeout(3000) }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.teams?.[0]) {
        const logoUrl = data.teams[0].strBadge || data.teams[0].strLogo || '';
        logoCache.set(cacheKey, logoUrl || null);
        try {
          localStorage.setItem(`logo_${cacheKey}`, logoUrl);
        } catch (e) {
          // Ignore storage errors
        }
        return logoUrl || null;
      }
    }
  } catch (e) {
    console.warn('Logo fetch failed:', teamName);
  }
  
  logoCache.set(cacheKey, null);
  try {
    localStorage.setItem(`logo_${cacheKey}`, '');
  } catch (e) {
    // Ignore
  }
  return null;
};

// ============================================
// SPORT CATEGORY ICONS
// ============================================

export const getSportIcon = (sport: string): string => {
  const sportIcons: Record<string, string> = {
    'football': '⚽',
    'soccer': '⚽',
    'basketball': '🏀',
    'nba': '🏀',
    'nfl': '🏈',
    'american football': '🏈',
    'hockey': '🏒',
    'nhl': '🏒',
    'ice hockey': '🏒',
    'baseball': '⚾',
    'mlb': '⚾',
    'tennis': '🎾',
    'golf': '⛳',
    'cricket': '🏏',
    'rugby': '🏉',
    'mma': '🥊',
    'ufc': '🥊',
    'boxing': '🥊',
    'wrestling': '🤼',
    'wwe': '🤼',
    'f1': '🏎️',
    'motorsport': '🏎️',
    'formula 1': '🏎️',
    'formula one': '🏎️',
    'racing': '🏎️',
    'afl': '🏉',
    'australian football': '🏉',
    'volleyball': '🏐',
    'handball': '🤾',
    'darts': '🎯',
    'snooker': '🎱',
    'pool': '🎱',
    'esports': '🎮',
    'gaming': '🎮',
    'cycling': '🚴',
    'swimming': '🏊',
    'athletics': '🏃',
    'track and field': '🏃',
    'skiing': '⛷️',
    'snowboarding': '🏂',
    'surfing': '🏄',
    'skateboarding': '🛹',
    'badminton': '🏸',
    'table tennis': '🏓',
    'ping pong': '🏓',
    'horse racing': '🏇',
    'lacrosse': '🥍',
  };
  
  const key = sport.toLowerCase();
  for (const [k, v] of Object.entries(sportIcons)) {
    if (key.includes(k)) return v;
  }
  return '🏆';
};

// ============================================
// EVENT/MATCH POSTER FALLBACKS
// ============================================

export const getEventPoster = async (
  homeTeam: string,
  awayTeam: string,
  sport?: string
): Promise<string | null> => {
  // Try TheSportsDB event search
  try {
    const eventName = `${homeTeam}_vs_${awayTeam}`.replace(/ /g, '_');
    const response = await fetch(
      `${SPORTSDB_API}/searchevents.php?e=${encodeURIComponent(eventName)}`,
      { signal: AbortSignal.timeout(3000) }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.event?.[0]) {
        return data.event[0].strThumb || data.event[0].strBanner || null;
      }
    }
  } catch (e) {
    // Ignore errors
  }
  
  return null;
};

// ============================================
// BACKWARD COMPATIBILITY EXPORTS
// ============================================

// Alias for backward compatibility with teamLogoService
export const getTeamLogoUrl = getLogoUrl;
export const getTeamLogo = getLogoAsync;
export const getTeamLogoSync = getLogoUrl;
