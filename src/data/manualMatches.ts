
import { ManualMatch } from '@/types/manualMatch';

export const manualMatches: ManualMatch[] = [
  {
    id: "Austraila-VS-South-africa,Day-2",
    title: "Aus vs SA",
    date: "2025-06-12T09:00:00Z",
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
        id: "Super-sport-G[SouthAfrica]",
        name: "Super Sport G [SouthAfrica]",
        url: "https://topembed.pw/channel/SuperSportGrandstand[SouthAfrica]",
        quality: "HD"
      },
      {
        id: "sky-sport",
        name: "Sky sport ",
        url: "https://topembed.pw/channel/SkySportsCricket[UK]",
        quality: "HD"
      }
    ],
    visible: true,
    image: "https://i.imgur.com/MpB8olj.png"
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
