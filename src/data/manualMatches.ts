
export interface ManualMatch {
  id: string;
  title: string;
  date: string;
  teams: {
    home: string;
    away: string;
  };
  embedUrl: string;
  visible: boolean;
}

export const manualMatches: ManualMatch[] = [
  {
    id: "AUS-vs-SA",
    title: "Australia vs South Africa",
    date: "2025-06-12T20:00:00Z",
    teams: {
      home: "Australia",
      away: "South Africa"
    },
    embedUrl: "https://topembed.pw/channel/WillowTV%5BUSA%5D",
    visible: true
  },
  {
    id: "hidden-match",
    title: "Hidden Match",
    date: "2025-06-10T17:00:00Z",
    teams: {
      home: "Hidden FC",
      away: "Invisible United"
    },
    embedUrl: "https://topembed.pw/channel/hidden",
    visible: false
  }
];
