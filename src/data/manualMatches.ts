
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
    id: "A-vs-B-2024",
    title: "El Clasico - A vs B",
    date: "2024-06-15T20:00:00Z",
    teams: {
      home: "A",
      away: "B"
    },
    streamUrl: "https://azonew.newkso.ru/azo/skynz1/mono.m3u8"
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
