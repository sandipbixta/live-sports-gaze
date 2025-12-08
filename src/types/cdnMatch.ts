export interface CDNMatchChannel {
  channel_name: string;
  channel_code: string;
  url: string;
  image: string;
  viewers: string;
}

export interface CDNMatch {
  gameID: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamIMG: string;
  awayTeamIMG: string;
  time: string;
  tournament: string;
  country: string;
  countryIMG: string;
  status: 'live' | 'finished' | 'upcoming';
  start: string;
  end: string;
  channels: CDNMatchChannel[];
}

export interface CDNMatchData {
  'cdn-live-tv': {
    [sport: string]: CDNMatch[];
  };
}
