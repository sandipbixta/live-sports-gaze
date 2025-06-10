
export interface ManualMatch {
  id: string;
  title: string;
  date: string;
  teams: {
    home: string;
    away: string;
  };
  embedUrl: string; // iframe source link
}
export const manualMatches: ManualMatch[] = [
  {
    id: "el-clasico-2024",
    title: "El Clasico - Barcelona vs Real Madrid",
    date: "2024-06-15T20:00:00Z",
    teams: {
      home: "Barcelona",
      away: "Real Madrid"
    },
    embedUrl: "https://topembed.pw/channel/DAZNF1%5BSpain%5D"
  },
  {
    id: "mancity-vs-arsenal",
    title: "Manchester City vs Arsenal",
    date: "2024-06-16T17:00:00Z",
    teams: {
      home: "Manchester City",
      away: "Arsenal"
    },
    embedUrl: "https://topembed.pw/channel/SkySportPremierLeague"
  }
];
