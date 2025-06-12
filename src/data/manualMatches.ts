
export interface ManualMatchLink {
  id: string;
  name: string;
  url: string;
  quality?: string;
}

export interface ManualMatch {
  id: string;
  title: string;
  date: string;
  teams: {
    home: string;
    away: string;
  };
  links: ManualMatchLink[];
  visible: boolean;
}

export const manualMatches: ManualMatch[] = [
  {
    id: "WillowTV",
    title: "Aus vs SA",
    date: "2025-06-12T20:00:00Z",
    teams: {
      home: "Australia",
      away: "South Africa"
    },
    links: [
      {
        id: "willow-hd",
        name: "Willow TV HD",
        url: "https://topembed.pw/channel/WillowTV%5BUSA%5D",
        quality: "HD"
      },
      {
        id: "willow-backup",
        name: "Willow TV Backup",
        url: "https://topembed.pw/channel/WillowTV-backup",
        quality: "SD"
      },
      {
        id: "sports-stream",
        name: "Sports Stream",
        url: "https://topembed.pw/channel/sports-live",
        quality: "HD"
      }
    ],
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
    links: [
      {
        id: "hidden-link",
        name: "Hidden Stream",
        url: "https://topembed.pw/channel/hidden",
        quality: "HD"
      }
    ],
    visible: false
  }
];
