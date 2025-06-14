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
  { id: "sky-sports-main-event", title: "Sky Sports Main Event", country: "UK", embedUrl: "https://topembed.pw/channel/SkySportsMainEvent%5BUK%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-kingdom/sky-sports-main-event-icon-uk.png?raw=true" },
  { id: "sky-sports-action", title: "Sky Sports Action", country: "UK", embedUrl: "https://topembed.pw/channel/SkySportsAction%5BUK%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-kingdom/sky-sports-action-icon-uk.png?raw=true" },
  { id: "sky-sports-arena", title: "Sky Sports Arena", country: "UK", embedUrl: "https://topembed.pw/channel/SkySportsArena%5BUK%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-kingdom/sky-sports-arena-icon-uk.png?raw=true" },
  { id: "sky-sports-f1", title: "Sky Sports F1", country: "UK", embedUrl: "https://topembed.pw/channel/SkySportsF1%5BUK%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-kingdom/sky-sports-f1-icon-uk.png?raw=true" },
  { id: "sky-sports-premier-league", title: "Sky Sports Premier League", country: "UK", embedUrl: "https://topembed.pw/channel/SkySportsPremierLeague%5BUK%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-kingdom/sky-sports-premier-league-icon-uk.png?raw=true" },
  { id: "sky-sports-football", title: "Sky Sports Football", country: "UK", embedUrl: "https://topembed.pw/channel/SkySportsFootball%5BUK%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-kingdom/sky-sports-football-icon-uk.png?raw=true" },
  { id: "sky-sports-golf", title: "Sky Sports Golf", country: "UK", embedUrl: "https://topembed.pw/channel/SkySportsGolf%5BUK%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-kingdom/sky-sports-golf-icon-uk.png?raw=true" },
  { id: "sky-sports-mix", title: "Sky Sports Mix", country: "UK", embedUrl: "https://topembed.pw/channel/SkySportsMix%5BUK%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-kingdom/sky-sports-mix-icon-uk.png?raw=true" },
  { id: "sky-sports-tennis", title: "Sky Sports Tennis", country: "UK", embedUrl: "https://topembed.pw/channel/SkySportsTennis%5BUK%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-kingdom/sky-sports-tennis-icon-uk.png?raw=true" },
  { id: "sky-sports-racing", title: "Sky Sports Racing", country: "UK", embedUrl: "https://topembed.pw/channel/SkySportsRacing%5BUK%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-kingdom/sky-sports-racing-icon-uk.png?raw=true" },
  { id: "tnt-sports-1", title: "TNT Sports 1", country: "UK", embedUrl: "https://topembed.pw/channel/TNTSports1%5BUK%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-kingdom/tnt-sports-1-uk.png?raw=true" },
  { id: "tnt-sports-2", title: "TNT Sports 2", country: "UK", embedUrl: "https://topembed.pw/channel/TNTSports2%5BUK%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-kingdom/tnt-sports-2-uk.png?raw=true" },
  { id: "tnt-sports-3", title: "TNT Sports 3", country: "UK", embedUrl: "https://topembed.pw/channel/TNTSports3%5BUK%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-kingdom/tnt-sports-3-uk.png?raw=true" },
  { id: "tnt-sports-4", title: "TNT Sports 4", country: "UK", embedUrl: "https://topembed.pw/channel/TNTSports4%5BUK%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-kingdom/tnt-sports-4-uk.png?raw=true" },
  { id: "tnt-sports-5", title: "TNT Sports 5", country: "UK", embedUrl: "https://topembed.pw/channel/TNTSports5%5BUK%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-kingdom/tnt-sports-5-uk.png?raw=true" },
  { id: "tnt-sports-6", title: "TNT Sports 6", country: "UK", embedUrl: "https://topembed.pw/channel/TNTSports6%5BUK%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-kingdom/tnt-sports-6-uk.png?raw=true" },
  { id: "tnt-sports-7", title: "TNT Sports 7", country: "UK", embedUrl: "https://topembed.pw/channel/TNTSports7%5BUK%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-kingdom/tnt-sports-7-uk.png?raw=true" },
  { id: "premier-sports-1", title: "Premier Sports 1", country: "UK", embedUrl: "https://topembed.pw/channel/PremierSports1%5BUK%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-kingdom/premier-sports-1-uk.png?raw=true" },
  { id: "premier-sports-2", title: "Premier Sports 2", country: "UK", embedUrl: "https://topembed.pw/channel/PremierSports2%5BUK%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-kingdom/premier-sports-2-uk.png?raw=true" },
  { id: "laliga-tv", title: "LaLiga TV", country: "UK", embedUrl: "https://topembed.pw/channel/LaLigaTV%5BUK%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-kingdom/laliga-tv-uk.png?raw=true" },
  { id: "dazn-1-uk", title: "DAZN 1", country: "UK", embedUrl: "https://topembed.pw/channel/DAZN1UK%5BUK%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/spain/dazn-1-es.png?raw=true" },
  { id: "tnt-sports-ultimate", title: "TNT Sports Ultimate", country: "UK", embedUrl: "https://topembed.pw/channel/TNTSportsUltimate%5BUK%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-kingdom/tnt-sports-ultimate-uk.png?raw=true" },
  
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
  { id: "fox-501", title: "Fox 501", country: "Australia", embedUrl: "https://topembed.pw/channel/Fox501%5BAustralia%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/australia/fox-sports-cricket-501-hd-au.png?raw=true" },
  { id: "fox-502", title: "Fox 502", country: "Australia", embedUrl: "https://topembed.pw/channel/Fox502%5BAustralia%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/australia/fox-sports-league-502-au.png?raw=true" },
  { id: "fox-503", title: "Fox 503", country: "Australia", embedUrl: "https://topembed.pw/channel/Fox503%5BAustralia%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/australia/fox-sports-503-au.png?raw=true" },
  { id: "fox-504", title: "Fox 504", country: "Australia", embedUrl: "https://topembed.pw/channel/Fox504%5BAustralia%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/australia/fox-sports-footy-504-au.png?raw=true" },
  { id: "fox-506", title: "Fox 506", country: "Australia", embedUrl: "https://topembed.pw/channel/Fox506%5BAustralia%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/australia/fox-sports-506-au.png?raw=true" },
  { id: "fox-507", title: "Fox 507", country: "Australia", embedUrl: "https://topembed.pw/channel/Fox507%5BAustralia%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/australia/fox-sports-507-au.png?raw=true" },
  
  // France Channels
  { id: "bein-sport1-france", title: "BeIN Sport 1", country: "France", embedUrl: "https://topembed.pw/channel/BeINSport1%5BFrance%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/france/bein-sports-1-french-fr.png?raw=true" },
  { id: "bein-sport2-france", title: "BeIN Sport 2", country: "France", embedUrl: "https://topembed.pw/channel/BeINSport2%5BFrance%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/france/bein-sports-2-french-fr.png?raw=true" },
  { id: "bein-sport3-france", title: "BeIN Sport 3", country: "France", embedUrl: "https://topembed.pw/channel/BeINSport3%5BFrance%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/france/bein-sports-3-french-fr.png?raw=true" },
  { id: "rmc-sport1-france", title: "RMC Sport 1", country: "France", embedUrl: "https://topembed.pw/channel/RMCSport1%5BFrance%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/france/rmc-sport-1-fr.png?raw=true" },
  
  // Germany Channels
  { id: "dazn1-germany", title: "DAZN 1", country: "Germany", embedUrl: "https://topembed.pw/channel/DAZN1Deutschland%5BGermany%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/international/dazn1-int.png?raw=true" },
  { id: "dazn2-germany", title: "DAZN 2", country: "Germany", embedUrl: "https://topembed.pw/channel/DAZN2Deutschland%5BGermany%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/international/dazn2-int.png?raw=true" },
  
  // India Channels
  { id: "star-sports1-india", title: "Star Sports 1", country: "India", embedUrl: "https://topembed.pw/channel/StarSports1%5BIndia%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/india/star-sports-1-in.png?raw=true" },
  { id: "star-sports2-india", title: "Star Sports 2", country: "India", embedUrl: "https://topembed.pw/channel/StarSports2%5BIndia%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/india/star-sports-2-in.png?raw=true" },
  { id: "star-sports3-india", title: "Star Sports 3", country: "India", embedUrl: "https://topembed.pw/channel/StarSports3%5BIndia%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/india/star-sports-3-in.png?raw=true" },
  
  // Italy Channels
  { id: "dazn1-italy", title: "DAZN 1", country: "Italy", embedUrl: "https://topembed.pw/channel/DAZN1%5BItaly%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/italy/dazn-channel-it.png?raw=true" },
  { id: "dazn2-italy", title: "DAZN 2", country: "Italy", embedUrl: "https://topembed.pw/channel/DAZN2%5BItaly%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/italy/zona-dazn-it.png?raw=true" },
  
  // Mexico Channels
  { id: "espn-deportes-mexico", title: "ESPN Deportes", country: "Mexico", embedUrl: "https://topembed.pw/channel/ESPNDeportes%5BMexico%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-states/espn-deportes-us.png?raw=true" },
  { id: "fox-sports1-mexico", title: "FOX Sports 1", country: "Mexico", embedUrl: "https://topembed.pw/channel/FOXSports1%5BMexico%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/world-latin-america/fox-sports-1-lam.png?raw=true" },
  { id: "fox-sports2-mexico", title: "FOX Sports 2", country: "Mexico", embedUrl: "https://topembed.pw/channel/FOXSports2%5BMexico%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/world-latin-america/fox-sports-2-lam.png?raw=true" },
  { id: "fox-sports3-mexico", title: "FOX Sports 3", country: "Mexico", embedUrl: "https://topembed.pw/channel/FOXSports3%5BMexico%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/world-latin-america/fox-sports-3-lam.png?raw=true" },
  { id: "tudn-mexico", title: "TUDN", country: "Mexico", embedUrl: "https://topembed.pw/channel/TUDN%5BMexico%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/mexico/tudn-mx.png?raw=true" },
  
  // Netherlands Channel
  { id: "ziggo-sport-netherlands", title: "Ziggo Sport", country: "Netherlands", embedUrl: "https://topembed.pw/channel/ZiggoSport%5BNetherlands%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/netherlands/ziggo-sport-nl.png?raw=true" },
  
  // New Zealand Channels
  { id: "sky-sport1-nz", title: "Sky Sport 1", country: "New Zealand", embedUrl: "https://topembed.pw/channel/SkySport1%5BNewZealand%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/new-zealand/sky-sport-1-nz.png?raw=true" },
  { id: "sky-sport2-nz", title: "Sky Sport 2", country: "New Zealand", embedUrl: "https://topembed.pw/channel/SkySport2%5BNewZealand%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/new-zealand/sky-sport-2-nz.png?raw=true" },
  { id: "sky-sport3-nz", title: "Sky Sport 3", country: "New Zealand", embedUrl: "https://topembed.pw/channel/SkySport3%5BNewZealand%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/new-zealand/sky-sport-3-nz.png?raw=true" },
  { id: "sky-sport4-nz", title: "Sky Sport 4", country: "New Zealand", embedUrl: "https://topembed.pw/channel/SkySport4%5BNewZealand%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/new-zealand/sky-sport-4-nz.png?raw=true" },
  { id: "sky-sport5-nz", title: "Sky Sport 5", country: "New Zealand", embedUrl: "https://topembed.pw/channel/SkySport5%5BNewZealand%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/new-zealand/sky-sport-5-nz.png?raw=true" },
  { id: "sky-sport6-nz", title: "Sky Sport 6", country: "New Zealand", embedUrl: "https://topembed.pw/channel/SkySport6%5BNewZealand%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/new-zealand/sky-sport-6-nz.png?raw=true" },
  { id: "sky-sport7-nz", title: "Sky Sport 7", country: "New Zealand", embedUrl: "https://topembed.pw/channel/SkySport7%5BNewZealand%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/new-zealand/sky-sport-7-nz.png?raw=true" },
  { id: "sky-sport8-nz", title: "Sky Sport 8", country: "New Zealand", embedUrl: "https://topembed.pw/channel/SkySport8%5BNewZealand%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/new-zealand/sky-sport-8-nz.png?raw=true" },
  { id: "sky-sport9-nz", title: "Sky Sport 9", country: "New Zealand", embedUrl: "https://topembed.pw/channel/SkySport9%5BNewZealand%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/new-zealand/sky-sport-9-nz.png?raw=true" },
  { id: "sky-sport-select-nz", title: "Sky Sport Select", country: "New Zealand", embedUrl: "https://topembed.pw/channel/SkySportSelect%5BNewZealand%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/new-zealand/sky-sport-select-nz.png?raw=true" },
  
  // Canada Channels
  { id: "tsn1-canada", title: "TSN1", country: "Canada", embedUrl: "https://topembed.pw/channel/TSN1%5BCanada%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/canada/tsn-1-ca.png?raw=true" },
  { id: "tsn2-canada", title: "TSN2", country: "Canada", embedUrl: "https://topembed.pw/channel/TSN2%5BCanada%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/canada/tsn-2-ca.png?raw=true" },
  { id: "tsn3-canada", title: "TSN3", country: "Canada", embedUrl: "https://topembed.pw/channel/TSN3%5BCanada%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/canada/tsn-3-ca.png?raw=true" },
  { id: "tsn4-canada", title: "TSN4", country: "Canada", embedUrl: "https://topembed.pw/channel/TSN4%5BCanada%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/canada/tsn-4-ca.png?raw=true" },
  { id: "tsn5-canada", title: "TSN5", country: "Canada", embedUrl: "https://topembed.pw/channel/TSN5%5BCanada%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/canada/tsn-5-ca.png?raw=true" },
  { id: "sportsnet-one-canada", title: "Sportsnet One", country: "Canada", embedUrl: "https://topembed.pw/channel/SportsnetOne%5BCanada%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/canada/sportsnet-one-ca.png?raw=true" },
  { id: "sportsnet-pacific-canada", title: "Sportsnet Pacific", country: "Canada", embedUrl: "https://topembed.pw/channel/SportsnetPacific%5BCanada%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/canada/sportsnet-pacific-ca.png?raw=true" },
  { id: "sportsnet-east-canada", title: "Sportsnet East", country: "Canada", embedUrl: "https://topembed.pw/channel/SportsnetEast%5BCanada%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/canada/sportsnet-east-ca.png?raw=true" },
  { id: "sportsnet-west-canada", title: "Sportsnet West", country: "Canada", embedUrl: "https://topembed.pw/channel/SportsnetWest%5BCanada%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/canada/sportsnet-west-ca.png?raw=true" },
  { id: "sportsnet-world-canada", title: "Sportsnet World", country: "Canada", embedUrl: "https://topembed.pw/channel/SportsnetWorld%5BCanada%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/canada/sportsnet-world-ca.png?raw=true" },
  { id: "sportsnet-360-canada", title: "Sportsnet 360", country: "Canada", embedUrl: "https://topembed.pw/channel/Sportsnet360%5BCanada%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/canada/sportsnet-360-ca.png?raw=true" },
  { id: "sportsnet-ontario-canada", title: "Sportsnet Ontario", country: "Canada", embedUrl: "https://topembed.pw/channel/SportsnetOntario%5BCanada%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/canada/sportsnet-ontario-ca.png?raw=true" },
  
  // USA Channels
  { id: "cbs-sports-network-usa", title: "CBS Sports Network", country: "USA", embedUrl: "https://topembed.pw/channel/CBSSportsNetwork%5BUSA%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-states/cbs-sports-us.png?raw=true" },
  { id: "willow-tv-usa", title: "Willow TV", country: "USA", embedUrl: "https://topembed.pw/channel/WillowTV%5BUSA%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-states/willow-us.png?raw=true" },
  { id: "willow-xtra2-usa", title: "Willow Xtra 2", country: "USA", embedUrl: "https://topembed.pw/channel/WillowXtra2%5BUSA%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-states/willow-xtra-us.png?raw=true" },
  { id: "usa-network-usa", title: "USA Network", country: "USA", embedUrl: "https://topembed.pw/channel/USANetwork%5BUSA%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/canada/usa-network-ca.png?raw=true" },
  { id: "nfl-network-usa", title: "NFL Network", country: "USA", embedUrl: "https://topembed.pw/channel/NFLNetwork%5BUSA%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-states/nfl-network-hz-us.png?raw=true" },
  { id: "fox-sports1-usa", title: "FOX Sports 1", country: "USA", embedUrl: "https://topembed.pw/channel/FOXSports1%5BUSA%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-states/fox-sports-1-us.png?raw=true" },
  { id: "fox-sports2-usa", title: "FOX Sports 2", country: "USA", embedUrl: "https://topembed.pw/channel/FOXSports2%5BUSA%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-states/fox-sports-2-us.png?raw=true" },
  { id: "espn-usa", title: "ESPN", country: "USA", embedUrl: "https://topembed.pw/channel/ESPN%5BUSA%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-states/espn-us.png?raw=true" },
  { id: "espn2-usa", title: "ESPN 2", country: "USA", embedUrl: "https://topembed.pw/channel/ESPN2%5BUSA%5D", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-states/espn-2-us.png?raw=true" },
  
  // Wrestling/UFC/Boxing Channels
  { id: "wwe-ufc-boxing", title: "WWE/UFC/Boxing", country: "USA", embedUrl: "https://topembed.pw/channel/fight", category: "sports" },
];

// Add extra channels only if not already present in tvChannels (avoid duplicates)
const extraChannels: Channel[] = [
  // UK
  { id: "bbc-scotland-uk", title: "BBCScotland", country: "UK", embedUrl: "https://topembed.pw/channel/BBCScotland[UK]", category: "sports", logo: "https://github.com/tv-logo/tv-logos/blob/main/countries/united-kingdom/bbc-scotland-uk.png?raw=true" },
  { id: "itv-1-uk", title: "ITV1", country: "UK", embedUrl: "https://topembed.pw/channel/ITV1[UK]", category: "sports" },
  { id: "itv-2-uk", title: "ITV2", country: "UK", embedUrl: "https://topembed.pw/channel/ITV2[UK]", category: "sports" },
  { id: "itv-3-uk", title: "ITV3", country: "UK", embedUrl: "https://topembed.pw/channel/ITV3[UK]", category: "sports" },
  { id: "itv-4-uk", title: "ITV4", country: "UK", embedUrl: "https://topembed.pw/channel/ITV4[UK]", category: "sports" },
  { id: "bbc-one-uk", title: "BBCOne", country: "UK", embedUrl: "https://topembed.pw/channel/BBCOne[UK]", category: "sports" },
  { id: "bbc-two-uk", title: "BBCTwo", country: "UK", embedUrl: "https://topembed.pw/channel/BBCTwo[UK]", category: "sports" },
  { id: "bbc-three-uk", title: "BBCThree", country: "UK", embedUrl: "https://topembed.pw/channel/BBCThree[UK]", category: "sports" },
  { id: "bbc-four-uk", title: "BBCFour", country: "UK", embedUrl: "https://topembed.pw/channel/BBCFour[UK]", category: "sports" },
  { id: "sky-discovery-hd-uk", title: "SkyDiscoveryHD", country: "UK", embedUrl: "https://topembed.pw/channel/SkyDiscoveryHD[UK]", category: "sports" },
  { id: "film4-uk", title: "Film4", country: "UK", embedUrl: "https://topembed.pw/channel/Film4[UK]", category: "sports" },
  { id: "mutv-uk", title: "MUTV", country: "UK", embedUrl: "https://topembed.pw/channel/MUTV[UK]", category: "sports" },
  { id: "viaplaysports1-uk", title: "ViaplaySports1", country: "UK", embedUrl: "https://topembed.pw/channel/ViaplaySports1[UK]", category: "sports" },

  // USA
  { id: "btn-usa", title: "BTN", country: "USA", embedUrl: "https://topembed.pw/channel/BTN[USA]", category: "sports" },
  { id: "espn-deportes-usa", title: "ESPNDeportes", country: "USA", embedUrl: "https://topembed.pw/channel/ESPNDeportes[USA]", category: "sports" },
  { id: "espnu-usa", title: "ESPNU", country: "USA", embedUrl: "https://topembed.pw/channel/ESPNU[USA]", category: "sports" },
  { id: "golf-channel-usa", title: "GOLFChannel", country: "USA", embedUrl: "https://topembed.pw/channel/GOLFChannel[USA]", category: "sports" },
  { id: "nba-tv-usa", title: "NBATV", country: "USA", embedUrl: "https://topembed.pw/channel/NBATV[USA]", category: "sports" },
  { id: "nfl-network-usa", title: "NFLNetwork", country: "USA", embedUrl: "https://topembed.pw/channel/NFLNetwork[USA]", category: "sports" },
  { id: "nfl-redzone-usa", title: "NFLRedzone", country: "USA", embedUrl: "https://topembed.pw/channel/NFLRedzone[USA]", category: "sports" },
  { id: "nhl-network-usa", title: "NHLNetwork", country: "USA", embedUrl: "https://topembed.pw/channel/NHLNetwork[USA]", category: "sports" },
  { id: "sec-network-usa", title: "SECNetwork", country: "USA", embedUrl: "https://topembed.pw/channel/SECNetwork[USA]", category: "sports" },
  { id: "tennis-channel-usa", title: "TennisChannel", country: "USA", embedUrl: "https://topembed.pw/channel/TennisChannel[USA]", category: "sports" },

  // Australia
  { id: "fox-sports-506-au", title: "FoxSports506", country: "Australia", embedUrl: "https://topembed.pw/channel/FoxSports506[Australia]", category: "sports" },
  { id: "optus-sport-1-au", title: "OptusSport1", country: "Australia", embedUrl: "https://topembed.pw/channel/OptusSport1[Australia]", category: "sports" },

  // Portugal
  { id: "canal-11-portugal", title: "Canal11", country: "Portugal", embedUrl: "https://topembed.pw/channel/Canal11[Portugal]", category: "sports" },
  { id: "eleven-sports-1-portugal", title: "ElevenSports1", country: "Portugal", embedUrl: "https://topembed.pw/channel/ElevenSports1[Portugal]", category: "sports" },

  // Romania
  { id: "digi-sport-1-ro", title: "DigiSport1", country: "Romania", embedUrl: "https://topembed.pw/channel/DigiSport1[Romania]", category: "sports" },
  { id: "orange-sport-1-ro", title: "OrangeSport1", country: "Romania", embedUrl: "https://topembed.pw/channel/OrangeSport1[Romania]", category: "sports" },
  { id: "pro-arena-ro", title: "ProArena", country: "Romania", embedUrl: "https://topembed.pw/channel/ProArena[Romania]", category: "sports" },

  // Greece
  { id: "novasports1-gr", title: "NovaSports1", country: "Greece", embedUrl: "https://topembed.pw/channel/NovaSports1[Greece]", category: "sports" },

  // Germany
  { id: "sky-bundesliga1-de", title: "SkyBundesliga1", country: "Germany", embedUrl: "https://topembed.pw/channel/SkyBundesliga1[Germany]", category: "sports" },
  
  // Serbia
  { id: "sportklub-1-serbia", title: "Sportklub1", country: "Serbia", embedUrl: "https://topembed.pw/channel/Sportklub1[Serbia]", category: "sports" },

  // SouthAfrica
  { id: "super-sport-action-zaf", title: "SuperSportAction", country: "SouthAfrica", embedUrl: "https://topembed.pw/channel/SuperSportAction[SouthAfrica]", category: "sports" },

  // Canada
  { id: "sportsnet-ontario-canada", title: "SportsnetOntario", country: "Canada", embedUrl: "https://topembed.pw/channel/SportsnetOntario[Canada]", category: "sports" },

  // Netherlands
  { id: "ziggo-sport-2-nl", title: "ZiggoSport2", country: "Netherlands", embedUrl: "https://topembed.pw/channel/ZiggoSport2[Netherlands]", category: "sports" },

  // Ireland
  { id: "rte-one-ie", title: "RTEOne", country: "Ireland", embedUrl: "https://topembed.pw/channel/RTEOne[Ireland]", category: "sports" },
  { id: "rte-two-ie", title: "RTETwo", country: "Ireland", embedUrl: "https://topembed.pw/channel/RTETwo[Ireland]", category: "sports" },

  // Spain
  { id: "movistar-deportes-es", title: "MovistarDeportes", country: "Spain", embedUrl: "https://topembed.pw/channel/MovistarDeportes[Spain]", category: "sports" },

  // France
  { id: "canal-sport-fr", title: "CanalSport", country: "France", embedUrl: "https://topembed.pw/channel/CanalSport[France]", category: "sports" },

  // Italy
  { id: "cartoon-network-it", title: "CartoonNetworkItaly", country: "Italy", embedUrl: "https://topembed.pw/channel/CartoonNetworkItaly[Italy]", category: "sports" },

  // Poland
  { id: "canal-sport-pl", title: "CanalSport", country: "Poland", embedUrl: "https://topembed.pw/channel/CanalSport[Poland]", category: "sports" },

  // Brazil
  { id: "combate-br", title: "Combate", country: "Brazil", embedUrl: "https://topembed.pw/channel/Combate[Brazil]", category: "sports" },

  // Albania
  { id: "rtsh-sport-al", title: "RTSHSport", country: "Albania", embedUrl: "https://topembed.pw/channel/RTSHSport[Albania]", category: "sports" },

  // Ecuador
  { id: "gol-tv-ec", title: "GolTV", country: "Ecuador", embedUrl: "https://topembed.pw/channel/GolTV[Ecuador]", category: "sports" },

  // Colombia
  { id: "win-sports-co", title: "WINSports", country: "Colombia", embedUrl: "https://topembed.pw/channel/WINSports[Colombia]", category: "sports" },

  // Israel
  { id: "yessport1-il", title: "YesSport1", country: "Israel", embedUrl: "https://topembed.pw/channel/YesSport1[Israel]", category: "sports" },

  // Bulgaria
  { id: "diema-sport-bg", title: "DiemaSport", country: "Bulgaria", embedUrl: "https://topembed.pw/channel/DiemaSport[Bulgaria]", category: "sports" },

  // Arab (as "Other")
  { id: "bein-sports-1-arab", title: "BeinSports1", country: "Other", embedUrl: "https://topembed.pw/channel/BeinSports1[Arab]", category: "sports" },

  // Malaysia
  { id: "astro-cricket-my", title: "AstroCricket", country: "Malaysia", embedUrl: "https://topembed.pw/channel/AstroCricket[Malaysia]", category: "sports" },

  // Denmark
  { id: "tv3-dk", title: "TV3", country: "Denmark", embedUrl: "https://topembed.pw/channel/TV3[Denmark]", category: "sports" },

  // Russia
  { id: "khl-tv-ru", title: "KHLTV", country: "Russia", embedUrl: "https://topembed.pw/channel/KHLTV[Russia]", category: "sports" },

  // Pakistan
  { id: "ptv-sports-pk", title: "PTVSports", country: "Pakistan", embedUrl: "https://topembed.pw/channel/PTVSports[Pakistan]", category: "sports" },

  // Belgium
  { id: "vtm2-be", title: "VTM2", country: "Belgium", embedUrl: "https://topembed.pw/channel/VTM2[Belgium]", category: "sports" },

  // S7 (Other)
  { id: "nevena1-s7", title: "Nevena1", country: "Other", embedUrl: "https://topembed.pw/channel/Nevena1[S7]", category: "sports" },

  // ... more can be appended as needed ...
];

const existingKeySet = new Set(tvChannels.map(c => `${c.title.toLowerCase()}|${c.country.toLowerCase()}`));

for (const channel of extraChannels) {
  const key = `${channel.title.toLowerCase()}|${channel.country.toLowerCase()}`;
  if (!existingKeySet.has(key)) {
    tvChannels.push(channel);
  }
}

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
