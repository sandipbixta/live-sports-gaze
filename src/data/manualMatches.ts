
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
    id: "barca-vs-real",
    title: "Barcelona vs Real Madrid",
    date: "2025-06-12T19:00:00Z",
    teams: {
      home: "Barcelona",
      away: "Real Madrid"
    },
    embedUrl: "https://topembed.pw/channel/DAZNF1%5BSpain%5D",
    visible: false
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
