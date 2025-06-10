
export interface ManualMatch {
  id: string;
  title: string;
  date: string;
  teams: {
    home: string;
    away: string;
  };
  streamUrl: string;
}

export const manualMatches: ManualMatch[] = [
  {
    id: "real-madrid-vs-barcelona-2024",
    title: "El Clasico - Real Madrid vs Barcelona",
    date: "2024-06-15T20:00:00Z",
    teams: {
      home: "Real Madrid",
      away: "Barcelona"
    },
    streamUrl: "https://damitv.pro/channel/India/star-sports2-india"
  },
  {
    id: "manchester-united-vs-liverpool-2024",
    title: "Manchester United vs Liverpool",
    date: "2024-06-16T15:30:00Z",
    teams: {
      home: "Manchester United",
      away: "Liverpool"
    },
    streamUrl: "https://example.com/stream2.m3u8"
  }
];
