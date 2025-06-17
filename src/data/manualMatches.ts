
import { ManualMatch } from '@/types/manualMatch';

export const manualMatches: ManualMatch[] = [
  {
    id: "FLUMINENSE-VS-DORTMUND",
    title: "Fluminense vs Dortmund",
    // FIX: Corrected date with zero-padded hour (ISO 8601)
    date: "2025-06-18T16:00:00Z", 
    teams: {
      home: "Fluminense",
      away: "Dortmund"
    },
    links: [
      {
        id: "Nevena-3",
        name: "Nevena3",
        url: "https://topembed.pw/channel/Nevena3[S7]",
        quality: "HD"
      },     
      {
        id: "TBS-USA",
        name: "TBS [USA]",
        url: "https://topembed.pw/channel/TBS[USA]",
        quality: "HD"
      },
      {
        id: "Channel-5 [UK]",
        name: "Channel 5 [UK]",
        url: "https://topembed.pw/channel/Channel5[UK]",
        quality: "HD"
      },
      {
        id: "TUDN-[USA]",
        name: "TUDN [USA]",
        url: "https://topembed.pw/channel/TUDN[USA]",
        quality: "HD"
      },
      {
        id: "Nevena-2",
        name: "Nevena 2",
        url: "https://topembed.pw/channel/Nevena2[S7]",
        quality: "HD"
      },     
    ],
    visible: true,
    image: "https://i.imgur.com/Gvjm0BZ.jpeg"
  },
  {
    id: "RIVER-PLATE-VS-URAWA-REDS",
    title: "River Plate vs Urawa Reds",
    // FIX: Corrected date with zero-padded hour
    date: "2025-06-17T22:00:00Z", 
    teams: {
      home: "River Plate",
      away: "Urawa Reds"
    },
    links: [
      {
        id: "Nevena-3",
        name: "Nevena3",
        url: "https://topembed.pw/channel/Nevena3[S7]",
        quality: "HD"
      },     
      {
        id: "TBS-USA",
        name: "TBS [USA]",
        url: "https://topembed.pw/channel/TBS[USA]",
        quality: "HD"
      },
      {
        id: "Channel-5 [UK]",
        name: "Channel 5 [UK]",
        url: "https://topembed.pw/channel/Channel5[UK]",
        quality: "HD"
      },
      {
        id: "TUDN-[USA]",
        name: "TUDN [USA]",
        url: "https://topembed.pw/channel/TUDN[USA]",
        quality: "HD"
      },
      {
        id: "Nevena-2",
        name: "Nevena 2",
        url: "https://topembed.pw/channel/Nevena3[S7]",
        quality: "HD"
      },     
    ],
    visible: true,
    image: "https://i.imgur.com/ersHuzP.jpeg"
  },
  {
    id: "ULSAN-HD-VS-MAMELODI-SUNDOWNS",
    title: "Ulsan HD vs Mamelodi Sundowns",
    // Already correct: zero-padded hour and T
    date: "2025-06-18T01:00:00Z",
    teams: {
      home: "Ulsan",
      away: "Mamelodi"
    },
    links: [
      {
        id: "Nevena-3",
        name: "Nevena3",
        url: "https://topembed.pw/channel/Nevena2[S7]",
        quality: "HD"
      },     
      {
        id: "TBS-USA",
        name: "TBS [USA]",
        url: "https://topembed.pw/channel/TBS[USA]",
        quality: "HD"
      },
      {
        id: "Channel-5 [UK]",
        name: "Channel 5 [UK]",
        url: "https://topembed.pw/channel/Channel5[UK]",
        quality: "HD"
      },
      {
        id: "TUDN-[USA]",
        name: "TUDN [USA]",
        url: "https://topembed.pw/channel/TUDN[USA]",
        quality: "HD"
      },
      {
        id: "Nevena-2",
        name: "Nevena 2",
        url: "https://topembed.pw/channel/Nevena2[S7]",
        quality: "HD"
      },     
    ],
    visible: true,
    image: "https://i.imgur.com/5ANBndF.jpeg"
  },
  {
    id: "MONTERREY-VS-INTER-MILAN",
    title: "Monterrey vs Inter Milan",
    // FIX: Corrected date with zero-padded hour
    date: "2025-06-18T22:00:00Z",
    teams: {
      home: "Monterrey",
      away: "Inter"
    },
    links: [
      {
        id: "Nevena-3",
        name: "Nevena 3",
        url: "https://topembed.pw/channel/Nevena3[S7]",
        quality: "HD"
      },     
      {
        id: "TBS-USA",
        name: "TBS [USA]",
        url: "https://topembed.pw/channel/TBS[USA]",
        quality: "HD"
      },
      {
        id: "Channel-5 [UK]",
        name: "Channel 5 [UK]",
        url: "https://topembed.pw/channel/Channel5[UK]",
        quality: "HD"
      },
      {
        id: "TUDN-[USA]",
        name: "TUDN [USA]",
        url: "https://topembed.pw/channel/TUDN[USA]",
        quality: "HD"
      },
      {
        id: "Nevena-2",
        name: "Nevena 2",
        url: "https://topembed.pw/channel/Nevena2[S7]",
        quality: "HD"
      },     
    ],
    visible: true,
    image: "https://i.imgur.com/5ANBndF.jpeg"
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
