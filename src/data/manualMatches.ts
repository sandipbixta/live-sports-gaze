
import { ManualMatch } from '@/types/manualMatch';

export const manualMatches: ManualMatch[] = [
  {
    id: "Austraila-VS-South-africa,Day-3",
    title: "Aus vs SA",
    date: "2025-06-12T09:00:00Z",
    Day: "3",
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
        id: "Sky-Sports-Main-Event [UK]",
        name: "Sky Sports MainEvent[UK]",
        url: "https://topembed.pw/channel/SkySportsMainEvent%5BUK%5D",
        quality: "HD"
      },
      {
        id: "sky-sport-2",
        name: "Sky sport 2 ",
        url: "https://topembed.pw/channel/SkySport2%5BNewZealand%5D",
        quality: "HD"
      },
      {
        id: "Willow-Extra",
        name: "Willow Extra ",
        url: "https://topembed.pw/channel/WillowXtra2%5BUSA%5D",
        quality: "HD"
      }
    ],
    visible: true,
    image: "https://i.imgur.com/SU5B2sQ.jpg" // fixed: use direct image link
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
