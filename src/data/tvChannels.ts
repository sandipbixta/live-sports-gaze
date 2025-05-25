interface Channel {
  id: string;
  title: string;
  country: string;
  embedUrl: string;
  category: 'sports' | 'news' | 'entertainment';
  logo?: string;
}

// Group channels by country
export const tvChannels: Channel[] = [
  // UK Channels
  { id: "sky-sports-news", title: "Sky Sports News", country: "UK", embedUrl: "https://topembed.pw/channel/SkySportsNews%5BUK%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-kingdom/sky-sports-news-uk.png?raw=true" },
  { id: "sky-sports-main-event", title: "Sky Sports Main Event", country: "UK", embedUrl: "https://topembed.pw/channel/SkySportsMainEvent%5BUK%5D", category: "sports" },
  { id: "sky-sports-action", title: "Sky Sports Action", country: "UK", embedUrl: "https://topembed.pw/channel/SkySportsAction%5BUK%5D", category: "sports" },
  { id: "sky-sports-arena", title: "Sky Sports Arena", country: "UK", embedUrl: "https://topembed.pw/channel/SkySportsArena%5BUK%5D", category: "sports" },
  { id: "sky-sports-f1", title: "Sky Sports F1", country: "UK", embedUrl: "https://topembed.pw/channel/SkySportsF1%5BUK%5D", category: "sports" },
  { id: "sky-sports-premier-league", title: "Sky Sports Premier League", country: "UK", embedUrl: "https://topembed.pw/channel/SkySportsPremierLeague%5BUK%5D", category: "sports" },
  { id: "sky-sports-football", title: "Sky Sports Football", country: "UK", embedUrl: "https://topembed.pw/channel/SkySportsFootball%5BUK%5D", category: "sports" },
  { id: "sky-sports-golf", title: "Sky Sports Golf", country: "UK", embedUrl: "https://topembed.pw/channel/SkySportsGolf%5BUK%5D", category: "sports" },
  { id: "sky-sports-mix", title: "Sky Sports Mix", country: "UK", embedUrl: "https://topembed.pw/channel/SkySportsMix%5BUK%5D", category: "sports" },
  { id: "sky-sports-tennis", title: "Sky Sports Tennis", country: "UK", embedUrl: "https://topembed.pw/channel/SkySportsTennis%5BUK%5D", category: "sports" },
  { id: "sky-sports-racing", title: "Sky Sports Racing", country: "UK", embedUrl: "https://topembed.pw/channel/SkySportsRacing%5BUK%5D", category: "sports" },
  { id: "tnt-sports-1", title: "TNT Sports 1", country: "UK", embedUrl: "https://topembed.pw/channel/TNTSports1%5BUK%5D", category: "sports" },
  { id: "tnt-sports-2", title: "TNT Sports 2", country: "UK", embedUrl: "https://topembed.pw/channel/TNTSports2%5BUK%5D", category: "sports" },
  { id: "tnt-sports-3", title: "TNT Sports 3", country: "UK", embedUrl: "https://topembed.pw/channel/TNTSports3%5BUK%5D", category: "sports" },
  { id: "tnt-sports-4", title: "TNT Sports 4", country: "UK", embedUrl: "https://topembed.pw/channel/TNTSports4%5BUK%5D", category: "sports" },
  { id: "tnt-sports-5", title: "TNT Sports 5", country: "UK", embedUrl: "https://topembed.pw/channel/TNTSports5%5BUK%5D", category: "sports" },
  { id: "tnt-sports-6", title: "TNT Sports 6", country: "UK", embedUrl: "https://topembed.pw/channel/TNTSports6%5BUK%5D", category: "sports" },
  { id: "tnt-sports-7", title: "TNT Sports 7", country: "UK", embedUrl: "https://topembed.pw/channel/TNTSports7%5BUK%5D", category: "sports" },
  { id: "premier-sports-1", title: "Premier Sports 1", country: "UK", embedUrl: "https://topembed.pw/channel/PremierSports1%5BUK%5D", category: "sports" },
  { id: "premier-sports-2", title: "Premier Sports 2", country: "UK", embedUrl: "https://topembed.pw/channel/PremierSports2%5BUK%5D", category: "sports" },
  { id: "laliga-tv", title: "LaLiga TV", country: "UK", embedUrl: "https://topembed.pw/channel/LaLigaTV%5BUK%5D", category: "sports" },
  { id: "dazn-1-uk", title: "DAZN 1", country: "UK", embedUrl: "https://topembed.pw/channel/DAZN1UK%5BUK%5D", category: "sports" },
  { id: "tnt-sports-ultimate", title: "TNT Sports Ultimate", country: "UK", embedUrl: "https://topembed.pw/channel/TNTSportsUltimate%5BUK%5D", category: "sports" },
  
  // Argentina Channels
  { id: "espn-argentina", title: "ESPN", country: "Argentina", embedUrl: "https://topembed.pw/channel/ESPN%5BArgentina%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/argentina/espn-ar.png?raw=true" },
  { id: "espn2-argentina", title: "ESPN2", country: "Argentina", embedUrl: "https://topembed.pw/channel/ESPN2%5BArgentina%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/argentina/espn-2-ar.png?raw=true" },
  { id: "espn3-argentina", title: "ESPN3", country: "Argentina", embedUrl: "https://topembed.pw/channel/ESPN3%5BArgentina%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/argentina/espn-3-ar.png?raw=true" },
  { id: "espn-premium-argentina", title: "ESPN Premium", country: "Argentina", embedUrl: "https://topembed.pw/channel/ESPNPremium%5BArgentina%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/argentina/espn-premium-ar.png?raw=true" },
  { id: "directv-sports-argentina", title: "DirecTV Sports", country: "Argentina", embedUrl: "https://topembed.pw/channel/DirecTVSports%5BArgentina%5D", category: "sports" },
  { id: "directv-sports2-argentina", title: "DirecTV Sports 2", country: "Argentina", embedUrl: "https://topembed.pw/channel/DirecTVSports2%5BArgentina%5D", category: "sports" },
  { id: "fox-sports1-argentina", title: "FOX Sports 1", country: "Argentina", embedUrl: "https://topembed.pw/channel/FOXSports1%5BArgentina%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/argentina/fox-sports-ar.png?raw=true" },
  { id: "fox-sports2-argentina", title: "FOX Sports 2", country: "Argentina", embedUrl: "https://topembed.pw/channel/FOXSports2%5BArgentina%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/argentina/fox-sports-2-ar.png?raw=true" },
  { id: "tnt-sports-argentina", title: "TNT Sports", country: "Argentina", embedUrl: "https://topembed.pw/channel/TNTSports%5BArgentina%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/argentina/tnt-sports-ar.png?raw=true" },
  { id: "bein-sports-mena3", title: "BeIN Sports MENA 3", country: "Argentina", embedUrl: "https://topembed.pw/channel/BeinSportsMENA3%5BArgentina%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/world-middle-east/bein-sports/bein-sports-mea.png?raw=true" },
  
  // Australia Channels
  { id: "fox-501", title: "Fox 501", country: "Australia", embedUrl: "https://topembed.pw/channel/Fox501%5BAustralia%5D", category: "sports" },
  { id: "fox-502", title: "Fox 502", country: "Australia", embedUrl: "https://topembed.pw/channel/Fox502%5BAustralia%5D", category: "sports" },
  { id: "fox-503", title: "Fox 503", country: "Australia", embedUrl: "https://topembed.pw/channel/Fox503%5BAustralia%5D", category: "sports" },
  { id: "fox-504", title: "Fox 504", country: "Australia", embedUrl: "https://topembed.pw/channel/Fox504%5BAustralia%5D", category: "sports" },
  { id: "fox-506", title: "Fox 506", country: "Australia", embedUrl: "https://topembed.pw/channel/Fox506%5BAustralia%5D", category: "sports" },
  { id: "fox-507", title: "Fox 507", country: "Australia", embedUrl: "https://topembed.pw/channel/Fox507%5BAustralia%5D", category: "sports" },
  
  // France Channels
  { id: "bein-sport1-france", title: "BeIN Sport 1", country: "France", embedUrl: "https://topembed.pw/channel/BeINSport1%5BFrance%5D", category: "sports" },
  { id: "bein-sport2-france", title: "BeIN Sport 2", country: "France", embedUrl: "https://topembed.pw/channel/BeINSport2%5BFrance%5D", category: "sports" },
  { id: "bein-sport3-france", title: "BeIN Sport 3", country: "France", embedUrl: "https://topembed.pw/channel/BeINSport3%5BFrance%5D", category: "sports" },
  { id: "rmc-sport1-france", title: "RMC Sport 1", country: "France", embedUrl: "https://topembed.pw/channel/RMCSport1%5BFrance%5D", category: "sports" },
  
  // Germany Channels
  { id: "dazn1-germany", title: "DAZN 1", country: "Germany", embedUrl: "https://topembed.pw/channel/DAZN1Deutschland%5BGermany%5D", category: "sports" },
  { id: "dazn2-germany", title: "DAZN 2", country: "Germany", embedUrl: "https://topembed.pw/channel/DAZN2Deutschland%5BGermany%5D", category: "sports" },
  
  // India Channels
  { id: "star-sports1-india", title: "Star Sports 1", country: "India", embedUrl: "https://topembed.pw/channel/StarSports1%5BIndia%5D", category: "sports" },
  { id: "star-sports2-india", title: "Star Sports 2", country: "India", embedUrl: "https://topembed.pw/channel/StarSports2%5BIndia%5D", category: "sports" },
  { id: "star-sports3-india", title: "Star Sports 3", country: "India", embedUrl: "https://topembed.pw/channel/StarSports3%5BIndia%5D", category: "sports" },
  
  // Italy Channels
  { id: "dazn1-italy", title: "DAZN 1", country: "Italy", embedUrl: "https://topembed.pw/channel/DAZN1%5BItaly%5D", category: "sports" },
  { id: "dazn2-italy", title: "DAZN 2", country: "Italy", embedUrl: "https://topembed.pw/channel/DAZN2%5BItaly%5D", category: "sports" },
  
  // Mexico Channels
  { id: "espn-deportes-mexico", title: "ESPN Deportes", country: "Mexico", embedUrl: "https://topembed.pw/channel/ESPNDeportes%5BMexico%5D", category: "sports" },
  { id: "fox-sports1-mexico", title: "FOX Sports 1", country: "Mexico", embedUrl: "https://topembed.pw/channel/FOXSports1%5BMexico%5D", category: "sports" },
  { id: "fox-sports2-mexico", title: "FOX Sports 2", country: "Mexico", embedUrl: "https://topembed.pw/channel/FOXSports2%5BMexico%5D", category: "sports" },
  { id: "fox-sports3-mexico", title: "FOX Sports 3", country: "Mexico", embedUrl: "https://topembed.pw/channel/FOXSports3%5BMexico%5D", category: "sports" },
  { id: "tudn-mexico", title: "TUDN", country: "Mexico", embedUrl: "https://topembed.pw/channel/TUDN%5BMexico%5D", category: "sports" },
  
  // Netherlands Channel
  { id: "ziggo-sport-netherlands", title: "Ziggo Sport", country: "Netherlands", embedUrl: "https://topembed.pw/channel/ZiggoSport%5BNetherlands%5D", category: "sports" },
  
  // New Zealand Channels
  { id: "sky-sport1-nz", title: "Sky Sport 1", country: "New Zealand", embedUrl: "https://topembed.pw/channel/SkySport1%5BNewZealand%5D", category: "sports" },
  { id: "sky-sport2-nz", title: "Sky Sport 2", country: "New Zealand", embedUrl: "https://topembed.pw/channel/SkySport2%5BNewZealand%5D", category: "sports" },
  { id: "sky-sport3-nz", title: "Sky Sport 3", country: "New Zealand", embedUrl: "https://topembed.pw/channel/SkySport3%5BNewZealand%5D", category: "sports" },
  { id: "sky-sport4-nz", title: "Sky Sport 4", country: "New Zealand", embedUrl: "https://topembed.pw/channel/SkySport4%5BNewZealand%5D", category: "sports" },
  { id: "sky-sport5-nz", title: "Sky Sport 5", country: "New Zealand", embedUrl: "https://topembed.pw/channel/SkySport5%5BNewZealand%5D", category: "sports" },
  { id: "sky-sport6-nz", title: "Sky Sport 6", country: "New Zealand", embedUrl: "https://topembed.pw/channel/SkySport6%5BNewZealand%5D", category: "sports" },
  { id: "sky-sport7-nz", title: "Sky Sport 7", country: "New Zealand", embedUrl: "https://topembed.pw/channel/SkySport7%5BNewZealand%5D", category: "sports" },
  { id: "sky-sport8-nz", title: "Sky Sport 8", country: "New Zealand", embedUrl: "https://topembed.pw/channel/SkySport8%5BNewZealand%5D", category: "sports" },
  { id: "sky-sport9-nz", title: "Sky Sport 9", country: "New Zealand", embedUrl: "https://topembed.pw/channel/SkySport9%5BNewZealand%5D", category: "sports" },
  { id: "sky-sport-select-nz", title: "Sky Sport Select", country: "New Zealand", embedUrl: "https://topembed.pw/channel/SkySportSelect%5BNewZealand%5D", category: "sports" },
  
  // Canada Channels
  { id: "tsn1-canada", title: "TSN1", country: "Canada", embedUrl: "https://topembed.pw/channel/TSN1%5BCanada%5D", category: "sports" },
  { id: "tsn2-canada", title: "TSN2", country: "Canada", embedUrl: "https://topembed.pw/channel/TSN2%5BCanada%5D", category: "sports" },
  { id: "tsn3-canada", title: "TSN3", country: "Canada", embedUrl: "https://topembed.pw/channel/TSN3%5BCanada%5D", category: "sports" },
  { id: "tsn4-canada", title: "TSN4", country: "Canada", embedUrl: "https://topembed.pw/channel/TSN4%5BCanada%5D", category: "sports" },
  { id: "tsn5-canada", title: "TSN5", country: "Canada", embedUrl: "https://topembed.pw/channel/TSN5%5BCanada%5D", category: "sports" },
  { id: "sportsnet-one-canada", title: "Sportsnet One", country: "Canada", embedUrl: "https://topembed.pw/channel/SportsnetOne%5BCanada%5D", category: "sports" },
  { id: "sportsnet-pacific-canada", title: "Sportsnet Pacific", country: "Canada", embedUrl: "https://topembed.pw/channel/SportsnetPacific%5BCanada%5D", category: "sports" },
  { id: "sportsnet-east-canada", title: "Sportsnet East", country: "Canada", embedUrl: "https://topembed.pw/channel/SportsnetEast%5BCanada%5D", category: "sports" },
  { id: "sportsnet-west-canada", title: "Sportsnet West", country: "Canada", embedUrl: "https://topembed.pw/channel/SportsnetWest%5BCanada%5D", category: "sports" },
  { id: "sportsnet-world-canada", title: "Sportsnet World", country: "Canada", embedUrl: "https://topembed.pw/channel/SportsnetWorld%5BCanada%5D", category: "sports" },
  { id: "sportsnet-360-canada", title: "Sportsnet 360", country: "Canada", embedUrl: "https://topembed.pw/channel/Sportsnet360%5BCanada%5D", category: "sports" },
  { id: "sportsnet-ontario-canada", title: "Sportsnet Ontario", country: "Canada", embedUrl: "https://topembed.pw/channel/SportsnetOntario%5BCanada%5D", category: "sports" },
  
  // Add remaining channels for other countries
  // Poland, Portugal, Romania, Serbia, South Africa, Spain, USA...
  { id: "cbs-sports-network-usa", title: "CBS Sports Network", country: "USA", embedUrl: "https://topembed.pw/channel/CBSSportsNetwork%5BUSA%5D", category: "sports" },
  { id: "willow-tv-usa", title: "Willow TV", country: "USA", embedUrl: "https://topembed.pw/channel/WillowTV%5BUSA%5D", category: "sports" },
  { id: "willow-xtra2-usa", title: "Willow Xtra 2", country: "USA", embedUrl: "https://topembed.pw/channel/WillowXtra2%5BUSA%5D", category: "sports" },
  { id: "usa-network-usa", title: "USA Network", country: "USA", embedUrl: "https://topembed.pw/channel/USANetwork%5BUSA%5D", category: "sports" },
  { id: "nfl-network-usa", title: "NFL Network", country: "USA", embedUrl: "https://topembed.pw/channel/NFLNetwork%5BUSA%5D", category: "sports" },
  { id: "fox-sports1-usa", title: "FOX Sports 1", country: "USA", embedUrl: "https://topembed.pw/channel/FOXSports1%5BUSA%5D", category: "sports" },
  { id: "fox-sports2-usa", title: "FOX Sports 2", country: "USA", embedUrl: "https://topembed.pw/channel/FOXSports2%5BUSA%5D", category: "sports" },
  { id: "espn-usa", title: "ESPN", country: "USA", embedUrl: "https://topembed.pw/channel/ESPN%5BUSA%5D", category: "sports" },
  { id: "espn2-usa", title: "ESPN 2", country: "USA", embedUrl: "https://topembed.pw/channel/ESPN2%5BUSA%5D", category: "sports" },
];

export const getChannelsByCountry = () => {
  const channels: Record<string, Channel[]> = {};
  
  tvChannels.forEach(channel => {
    if (!channels[channel.country]) {
      channels[channel.country] = [];
    }
    channels[channel.country].push(channel);
  });
  
  return channels;
};

export const getCountries = (): string[] => {
  return [...new Set(tvChannels.map(channel => channel.country))].sort();
};
