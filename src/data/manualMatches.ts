
import { ManualMatch } from '@/types/manualMatch';

export const manualMatches: ManualMatch[] = [
  {
    id: "MANCHESTER-CIRT-VS-WYDAD",
    title: "Manchester City vs Wydad",
    // FIX: Corrected date with zero-padded hour (ISO 8601)
    date: "2025-06-17T16:00:00Z", 
    teams: {
      home: "Manchester City",
      away: "Wydad"
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
    image: "https://i.imgur.com/Hu4TGZt.jpeg"
  },
  {
    id: "REAL-MADRID-VS-AL-HILAL",
    title: "Real Madrid vs Al Hilal",
    // FIX: Corrected date with zero-padded hour
    date: "2025-06-17T19:00:00Z", 
    teams: {
      home: "Real Madrid",
      away: "Al Hilal"
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
    image: "https://i.imgur.com/7ykKYUk.jpeg"
  },
  {
    id: "PACHUCA-VS-SALZBURG",
    title: "Pachuca vs Salzburg",
    // Already correct: zero-padded hour and T
    date: "2025-06-17T22:00:00Z",
    teams: {
      home: "Pachuca",
      away: "Salzburg"
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
    image: "https://i.imgur.com/lSpovBr.jpeg"
  },
  {
    id: "AL-AIN-VS-JUVENTUS",
    title: "Al Ain vs Juventus",
    // FIX: Corrected date with zero-padded hour
    date: "2025-06-18T01:00:00Z",
    teams: {
      home: "Al Ain",
      away: "Juventus"
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
    image: "https://i.imgur.com/fHT7ssS.jpeg"
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
