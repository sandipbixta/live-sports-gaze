
import { ManualMatch } from '@/types/manualMatch';

export const manualMatches: ManualMatch[] = [
  {
    id: "BAYERN-MUNICH-VS-AUCKLAND-CITY",
    title: "Bayern vs Auckland",
    // FIX: Corrected date with zero-padded hour (ISO 8601)
    date: "2025-06-16T16:00:00Z", 
    teams: {
      home: "Bayern Munich",
      away: "Auckland City"
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
    visible: false,
    image: "https://i.imgur.com/zUQD0ek.jpeg"
  },
  {
    id: "PSG-VS-ATL-MADRID",
    title: "PSG vs Atl. Madrid",
    // FIX: Corrected date with zero-padded hour
    date: "2025-06-16T19:00:00Z", 
    teams: {
      home: "PSG",
      away: "Atl. Madrid"
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
    visible: false,
    image: "https://i.imgur.com/nywK4YX.jpeg"
  },
  {
    id: "BOTAFOGO-AJ-VS-SEATTLE-SOUNDERS",
    title: "Bota vs Sea",
    // Already correct: zero-padded hour and T
    date: "2025-06-16T22:00:00Z",
    teams: {
      home: "Botafogo RJ",
      away: "Seattle Sounders"
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
    image: "https://i.imgur.com/f6ByUT2.jpeg"
  },
  {
    id: "PALMEIRAS-VS-FC-PORTO",
    title: "Palmeiras vs FC Porto",
    // FIX: Corrected date with zero-padded hour
    date: "2025-06-16T02:00:00Z",
    teams: {
      home: "Palmeiras",
      away: "FC Porto"
    },
    links: [
      {
        id: "Nevena-2",
        name: "Nevena 2",
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
    image: "https://i.imgur.com/PojQSYn.jpeg"
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
