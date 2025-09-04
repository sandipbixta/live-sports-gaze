// Service to provide channel logos based on channel names and countries
interface ChannelLogoMapping {
  [key: string]: string;
}

// Comprehensive channel logo mappings
const CHANNEL_LOGOS: ChannelLogoMapping = {
  // UK Channels
  'sky sports news': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/Sky_Sports_News_logo.svg/200px-Sky_Sports_News_logo.svg.png',
  'sky sports main event': 'https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Sky_Sports_Main_Event_logo.svg/200px-Sky_Sports_Main_Event_logo.svg.png',
  'sky sports action': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1f/Sky_Sports_Action_logo.svg/200px-Sky_Sports_Action_logo.svg.png',
  'sky sports arena': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Sky_Sports_Arena_logo.svg/200px-Sky_Sports_Arena_logo.svg.png',
  'sky sports f1': 'https://upload.wikimedia.org/wikipedia/en/thumb/7/77/Sky_Sports_F1_logo.svg/200px-Sky_Sports_F1_logo.svg.png',
  'sky sports premier league': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Sky_Sports_Premier_League_logo.svg/200px-Sky_Sports_Premier_League_logo.svg.png',
  'sky sports football': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d0/Sky_Sports_Football_logo.svg/200px-Sky_Sports_Football_logo.svg.png',
  'sky sports golf': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/06/Sky_Sports_Golf_logo.svg/200px-Sky_Sports_Golf_logo.svg.png',
  'sky sports mix': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/97/Sky_Sports_Mix_logo.svg/200px-Sky_Sports_Mix_logo.svg.png',
  'sky sports tennis': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Sky_Sports_Tennis_logo.svg/200px-Sky_Sports_Tennis_logo.svg.png',
  'sky sports racing': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Sky_Sports_Racing_logo.svg/200px-Sky_Sports_Racing_logo.svg.png',
  'sky sports cricket': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/63/Sky_Sports_Cricket_logo.svg/200px-Sky_Sports_Cricket_logo.svg.png',
  'tnt sports 1': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/91/TNT_Sports_1_logo.svg/200px-TNT_Sports_1_logo.svg.png',
  'tnt sports 2': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/TNT_Sports_2_logo.svg/200px-TNT_Sports_2_logo.svg.png',
  'tnt sports 3': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c8/TNT_Sports_3_logo.svg/200px-TNT_Sports_3_logo.svg.png',
  'tnt sports 4': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/TNT_Sports_4_logo.svg/200px-TNT_Sports_4_logo.svg.png',
  'tnt sports ultimate': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/TNT_Sports_Ultimate_logo.svg/200px-TNT_Sports_Ultimate_logo.svg.png',
  'premier sports 1': 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Premier_Sports_1_logo.svg/200px-Premier_Sports_1_logo.svg.png',
  'premier sports 2': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/99/Premier_Sports_2_logo.svg/200px-Premier_Sports_2_logo.svg.png',
  'bbc one': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/BBC_One_logo_%282021%29.svg/200px-BBC_One_logo_%282021%29.svg.png',
  'bbc two': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/BBC_Two_logo_%282021%29.svg/200px-BBC_Two_logo_%282021%29.svg.png',
  'bbc three': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/BBC_Three_logo_%282022%29.svg/200px-BBC_Three_logo_%282022%29.svg.png',
  'bbc four': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/BBC_Four_logo_%282021%29.svg/200px-BBC_Four_logo_%282021%29.svg.png',
  'bbc scotland': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/BBC_Scotland_logo_%282019%29.svg/200px-BBC_Scotland_logo_%282019%29.svg.png',
  'bbc news 24': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/BBC_News_2019.svg/200px-BBC_News_2019.svg.png',
  'itv1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/ITV1_logo.svg/200px-ITV1_logo.svg.png',
  'itv2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/ITV2_logo.svg/200px-ITV2_logo.svg.png',
  'itv3': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/ITV3_logo.svg/200px-ITV3_logo.svg.png',
  'itv4': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/ITV4_logo.svg/200px-ITV4_logo.svg.png',
  'channel 4': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Channel_4_logo_2015.svg/200px-Channel_4_logo_2015.svg.png',
  'channel 5': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Channel_5_logo_2016.svg/200px-Channel_5_logo_2016.svg.png',
  'racing tv': 'https://upload.wikimedia.org/wikipedia/en/thumb/7/79/Racing_TV_logo.svg/200px-Racing_TV_logo.svg.png',
  'laliga tv': 'https://upload.wikimedia.org/wikipedia/en/thumb/7/70/LaLiga_TV_logo.svg/200px-LaLiga_TV_logo.svg.png',

  // USA Channels
  'espn': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/200px-ESPN_wordmark.svg.png',
  'espn2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/ESPN2_logo.svg/200px-ESPN2_logo.svg.png',
  'espn deportes': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/ESPN_Deportes_logo.svg/200px-ESPN_Deportes_logo.svg.png',
  'espnu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/ESPNU_logo.svg/200px-ESPNU_logo.svg.png',
  'espn news': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/ESPNews_logo.svg/200px-ESPNews_logo.svg.png',
  'fox sports 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Fox_Sports_1_logo.svg/200px-Fox_Sports_1_logo.svg.png',
  'fox sports 2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Fox_Sports_2_logo.svg/200px-Fox_Sports_2_logo.svg.png',
  'nfl network': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NFL_Network_logo.svg/200px-NFL_Network_logo.svg.png',
  'nfl redzone': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3e/NFL_RedZone_logo.svg/200px-NFL_RedZone_logo.svg.png',
  'nba tv': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/NBA_TV.svg/200px-NBA_TV.svg.png',
  'nhl network': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f9/NHL_Network_US_logo.svg/200px-NHL_Network_US_logo.svg.png',
  'mlb network': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/MLB_Network_Logo.svg/200px-MLB_Network_Logo.svg.png',
  'golf channel': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Golf_Channel_logo.svg/200px-Golf_Channel_logo.svg.png',
  'tennis channel': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0b/Tennis_Channel_logo.svg/200px-Tennis_Channel_logo.svg.png',
  'btn': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Big_Ten_Network_logo.svg/200px-Big_Ten_Network_logo.svg.png',
  'sec network': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/SEC_Network_logo.svg/200px-SEC_Network_logo.svg.png',
  'acc network': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/ACC_Network_logo.svg/200px-ACC_Network_logo.svg.png',
  'usa network': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/USA_Network_logo_%282016%29.svg/200px-USA_Network_logo_%282016%29.svg.png',
  'tnt': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/TNT_Logo_2016.svg/200px-TNT_Logo_2016.svg.png',
  'tbs': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/TBS_logo_2016.svg/200px-TBS_logo_2016.svg.png',
  'cbs': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/CBS_logo.svg/200px-CBS_logo.svg.png',
  'nbc': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/NBC_logo.svg/200px-NBC_logo.svg.png',
  'abc': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/American_Broadcasting_Company_Logo.svg/200px-American_Broadcasting_Company_Logo.svg.png',
  'fox': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Fox_logo.svg/200px-Fox_logo.svg.png',
  'cnn': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Cnn_logo_red_background.svg/200px-Cnn_logo_red_background.svg.png',
  'fox news': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Fox_News_Channel_logo.svg/200px-Fox_News_Channel_logo.svg.png',
  'msnbc': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/MSNBC_logo.svg/200px-MSNBC_logo.svg.png',
  'hbo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/HBO_logo.svg/200px-HBO_logo.svg.png',
  'showtime': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Showtime_logo.svg/200px-Showtime_logo.svg.png',

  // Germany Channels
  'sky bundesliga': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Sky_Deutschland_Logo_2017.svg/200px-Sky_Deutschland_Logo_2017.svg.png',
  'sky sport 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Sky_Deutschland_Logo_2017.svg/200px-Sky_Deutschland_Logo_2017.svg.png',
  'sky sport tennis': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Sky_Deutschland_Logo_2017.svg/200px-Sky_Deutschland_Logo_2017.svg.png',
  'sport1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Sport1_logo_2011.svg/200px-Sport1_logo_2011.svg.png',
  'eurosport 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Eurosport_1_logo.svg/200px-Eurosport_1_logo.svg.png',
  'eurosport 2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Eurosport_2_logo.svg/200px-Eurosport_2_logo.svg.png',
  'dazn 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/DAZN_logo.svg/200px-DAZN_logo.svg.png',
  'dazn 2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/DAZN_logo.svg/200px-DAZN_logo.svg.png',

  // Spain Channels
  'dazn laliga': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/DAZN_logo.svg/200px-DAZN_logo.svg.png',
  'dazn f1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/DAZN_logo.svg/200px-DAZN_logo.svg.png',
  'movistar deportes': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Movistar_Logo.svg/200px-Movistar_Logo.svg.png',
  'movistar liga de campeones 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Movistar_Logo.svg/200px-Movistar_Logo.svg.png',
  'telecinco': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Telecinco_logo_2019.svg/200px-Telecinco_logo_2019.svg.png',

  // France Channels
  'canal sport': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Canal%2B_logo.svg/200px-Canal%2B_logo.svg.png',
  'canal plus': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Canal%2B_logo.svg/200px-Canal%2B_logo.svg.png',
  'bein sport 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/BeIN_Sports_logo_%282017%29.svg/200px-BeIN_Sports_logo_%282017%29.svg.png',
  'bein sport 2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/BeIN_Sports_logo_%282017%29.svg/200px-BeIN_Sports_logo_%282017%29.svg.png',
  'bein sport 3': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/BeIN_Sports_logo_%282017%29.svg/200px-BeIN_Sports_logo_%282017%29.svg.png',
  'rmc sport 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/RMC_Sport_logo_2018.svg/200px-RMC_Sport_logo_2018.svg.png',
  'lequipe': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/L%27%C3%89quipe_logo.svg/200px-L%27%C3%89quipe_logo.svg.png',

  // Portugal Channels
  'sport tv 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Sport_TV_logo.svg/200px-Sport_TV_logo.svg.png',
  'sport tv 2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Sport_TV_logo.svg/200px-Sport_TV_logo.svg.png',
  'sport tv 3': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Sport_TV_logo.svg/200px-Sport_TV_logo.svg.png',
  'eleven sports 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Eleven_Sports_logo.svg/200px-Eleven_Sports_logo.svg.png',
  'eleven sports 2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Eleven_Sports_logo.svg/200px-Eleven_Sports_logo.svg.png',
  'canal 11': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Canal_11_logo.svg/200px-Canal_11_logo.svg.png',

  // Canada Channels
  'tsn 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/TSN_Logo.svg/200px-TSN_Logo.svg.png',
  'tsn 2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/TSN_Logo.svg/200px-TSN_Logo.svg.png',
  'sportsnet one': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Sportsnet_logo.svg/200px-Sportsnet_logo.svg.png',
  'sportsnet pacific': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Sportsnet_logo.svg/200px-Sportsnet_logo.svg.png',
  'sportsnet ontario': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Sportsnet_logo.svg/200px-Sportsnet_logo.svg.png',

  // Italy Channels
  'sky sport calcio': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Sky_Italia_logo_2018.svg/200px-Sky_Italia_logo_2018.svg.png',
  'sky sport uno': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Sky_Italia_logo_2018.svg/200px-Sky_Italia_logo_2018.svg.png',
  'sky sport f1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Sky_Italia_logo_2018.svg/200px-Sky_Italia_logo_2018.svg.png',

  // Netherlands Channels
  'ziggo sport': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Ziggo_Sport_logo.svg/200px-Ziggo_Sport_logo.svg.png',
  'ziggo sport 2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Ziggo_Sport_logo.svg/200px-Ziggo_Sport_logo.svg.png',

  // Australia/New Zealand Channels
  'sky sport 1 nz': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Sky_Sport_logo_%28New_Zealand%29.svg/200px-Sky_Sport_logo_%28New_Zealand%29.svg.png',
  'sky sport 2 nz': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Sky_Sport_logo_%28New_Zealand%29.svg/200px-Sky_Sport_logo_%28New_Zealand%29.svg.png',
  'fox sports 506': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Fox_Sports_Australia_logo.svg/200px-Fox_Sports_Australia_logo.svg.png',

  'optus sport 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Optus_Sport_logo.svg/200px-Optus_Sport_logo.svg.png',
  'supersport action': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/SuperSport_logo.svg/200px-SuperSport_logo.svg.png',
  'supersport premier league': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/SuperSport_logo.svg/200px-SuperSport_logo.svg.png',
  'supersport football': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/SuperSport_logo.svg/200px-SuperSport_logo.svg.png',

  // Romania Channels
  'digi sport 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/DigiSport_logo.svg/200px-DigiSport_logo.svg.png',
  'orange sport 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/200px-Orange_logo.svg.png',
  'prima sport 1': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Prima_Sport_logo.svg/200px-Prima_Sport_logo.svg.png',
  'pro tv': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Pro_TV_logo.svg/200px-Pro_TV_logo.svg.png',

  // Serbia Channels
  'sportklub 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Sport_Klub_logo.svg/200px-Sport_Klub_logo.svg.png',
  'arena sport 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Arena_Sport_logo.svg/200px-Arena_Sport_logo.svg.png',
  'arena premium 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Arena_Sport_logo.svg/200px-Arena_Sport_logo.svg.png',

  // Greece Channels
  'nova sports 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Nova_Sports_logo.svg/200px-Nova_Sports_logo.svg.png',
  'cosmote sport 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Cosmote_Sport_logo.svg/200px-Cosmote_Sport_logo.svg.png',

  // Argentina Channels
  'tyc sports': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/TyC_Sports_logo.svg/200px-TyC_Sports_logo.svg.png',
  'directv sports': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/DirecTV_Sports_logo.svg/200px-DirecTV_Sports_logo.svg.png',

  // Brazil Channels
  'premiere 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Premiere_logo_2018.svg/200px-Premiere_logo_2018.svg.png',
  'combate': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/Combate_logo.svg/200px-Combate_logo.svg.png',

  // Other International
  'bein sports usa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/BeIN_Sports_logo_%282017%29.svg/200px-BeIN_Sports_logo_%282017%29.svg.png',
};

class ChannelLogoService {
  // Get logo URL for a channel
  getChannelLogo(channelTitle: string, channelId?: string): string | undefined {
    const normalizedTitle = channelTitle.toLowerCase().trim();
    
    // Direct match
    if (CHANNEL_LOGOS[normalizedTitle]) {
      return CHANNEL_LOGOS[normalizedTitle];
    }

    // Try to match without numbers for numbered channels
    const baseTitle = normalizedTitle.replace(/\s*\d+$/, '').trim();
    if (CHANNEL_LOGOS[baseTitle]) {
      return CHANNEL_LOGOS[baseTitle];
    }

    // Try matching common patterns
    for (const [key, logo] of Object.entries(CHANNEL_LOGOS)) {
      if (normalizedTitle.includes(key) || key.includes(normalizedTitle)) {
        return logo;
      }
    }

    return undefined;
  }

  // Generate a fallback logo URL based on channel name
  generateFallbackLogo(channelTitle: string): string {
    const initials = channelTitle
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 3)
      .join('');
    
    // Use a placeholder service that generates logos with initials
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=200&background=1f2937&color=ffffff&bold=true&format=png`;
  }

  // Get logo with fallback
  getChannelLogoWithFallback(channelTitle: string, channelId?: string): string {
    return this.getChannelLogo(channelTitle, channelId) || this.generateFallbackLogo(channelTitle);
  }

  // Add new logo mapping
  addChannelLogo(channelTitle: string, logoUrl: string): void {
    CHANNEL_LOGOS[channelTitle.toLowerCase().trim()] = logoUrl;
  }

  // Get all available logos
  getAllLogos(): ChannelLogoMapping {
    return { ...CHANNEL_LOGOS };
  }
}

export const channelLogoService = new ChannelLogoService();
export default channelLogoService;
