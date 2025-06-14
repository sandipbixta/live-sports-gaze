
import { ManualMatch } from '@/types/manualMatch';

export const manualMatches: ManualMatch[] = [
  {
    id: "AL-AHLY-VS-INTER-MIAMI",
    title: "Al ahly vs Inter Miami",
    // FIX: Corrected date (ISO 8601) and image string to direct Imgur link
    date: "2025-06-15T10:00:00Z", // Set to 10:00 AM UTC (adjust if you want 10am in another timezone)
    teams: {
      home: "Al Ahly",
      away: "Inter Miami"
    },
    links: [
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
    ],
    visible: true,
    image: "https://i.imgur.com/C9iom5u.png" // Now direct Imgur PNG link
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
