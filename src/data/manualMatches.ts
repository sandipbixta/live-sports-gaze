
import { ManualMatch } from '@/types/manualMatch';

// Helper function to get tomorrow's date
const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0); // Set to midnight
  return tomorrow.toISOString();
};

export const manualMatches: ManualMatch[] = [
  {
    id: "Fc-barcelona-vs-Olympiakos-Piraeus",
    title: "Fc barcelona vs Olympiakos Piraeus",
    date: new Date().toISOString(), // Live now
    teams: {
      home: "fc Barcelona",
      away: "Olympiakos piraeus"
    },
    links: [
      {
        id: "hls-stream",
        name: "HD Stream",
        url: "https://hls.suanzsd6.com/hd-en-6MvXMfc5VhdYjLsGKH.m3u8",
        quality: "HD"
      }
    ],
    visible: false,
    image: "",
    seo: {
      keywords: "fc barcelona champions league",
      description: "",
      category: "football"
    }
  },
  {
    id: "",
    title: "FC Barcelons vs Vissel kobe",
    date: getTomorrowDate(), // Auto-updates to tomorrow
    teams: {
      home: "",
      away: ""
    },
    links: [
      {
        id: "Nevena-3",
        name: "Nevena3",
        url: "https://topembed.pw/channel/exvisseona",
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
    image: "",
    seo: {
      keywords: "FIFA Club WorldCup live stream, FiFA Club Worldcup watch online, Fifa club wprldcup free stream",
      description: "Watch Fifa club world cup live stream online for free. Stream this exciting football match with high-quality video on DamiTV.",
      category: "Football"
    }
  },
  {
    id: "UEFA-WOMEN-EURO-2025",
    title: "UEFA WOMEN EURO 2025",
    date: getTomorrowDate(), // Auto-updates to tomorrow
    teams: {
      home: "",
      away: ""
    },
    links: [
      {
        id: "FOXSports1[USA]",
        name: "FOXSports1[USA]",
        url: "https://topembed.pw/channel/FOXSports1[USA]",
        quality: "HD"
      },
      {
        id: "TSN4[Canada]",
        name: "TSN4[Canada]",
        url: "https://topembed.pw/channel/TSN4[Canada]",
        quality: "HD"
      },     
      {
        id: "TUDN[USA]",
        name: "TUDN[USA]",
        url: "https://topembed.pw/channel/TUDN[USA]",
        quality: "HD"
      },
      
      {
        id: "ESPN3[Argentina]",
        name: "ESPN3[Argentina]",
        url: "https://topembed.pw/channel/ESPN3[Argentina]",
        quality: "HD"
      },
      {
        id: "SportTV1[Portugal]",
        name: "SportTV1[Portugal]",
        url: "https://topembed.pw/channel/SportTV1[Portugal]",
        quality: "HD"
      },     
    ],
    visible: false,
    image: "https://i.imgur.com/ZDK0tgZ.jpeg",
    seo: {
      keywords: "UEFA women euro 2025 live stream, UEFA watch online,euro women 2025 free stream",
      description: "Watch UEFA euro women 2025 live stream online for free. Stream this exciting football match with high-quality video on DamiTV.",
      category: "Football"
    }
  },
  {
    id: "Los-Angeles-FC-vs-Esperance-Tunis",
    title: "Los Angeles FC vs Esperance Tunis",
    date: getTomorrowDate(), // Auto-updates to tomorrow
    teams: {
      home: "Los Angeles FC",
      away: "Esperance Tunis"
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
        id: "Nevena 1",
        name: "Nevena 1",
        url: "https://topembed.pw/channel/Nevena1[S7]",
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
    image: "https://i.imgur.com/2ttt7yh.jpeg",
    seo: {
      keywords: "Los Angeles FC vs Esperance Tunis live stream, Los Angeles FC Esperance Tunis watch online, Los Angeles FC vs Esperance Tunis free stream",
      description: "Watch Los Angeles FC vs Esperance Tunis live stream online for free. Stream this exciting football match with high-quality video on DamiTV.",
      category: "Football"
    }
  },
  {
    id: "Bayern-Munich-vs-Boca-Juniors",
    title: "Bayern Munich vs Boca Juniors",
    date: getTomorrowDate(), // Auto-updates to tomorrow
    teams: {
      home: "Bayern Munich",
      away: "Boca Juniors"
    },
    links: [
      {
        id: "Nevena-3",
        name: "Nevena 3",
        url: "https://topembed.pw/channel/Nevena3[S7]",
        quality: "HD"
      },     
      {
        id: "Nevena1[S7]",
        name: "Nevena1[S7]",
        url: "https://topembed.pw/channel/Nevena1[S7]",
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
    image: "https://i.imgur.com/zZ4nHho.jpeg",
    seo: {
      keywords: "Bayern Munich vs Boca Juniors live stream, Bayern Munich Boca Juniors watch online, Bayern Munich vs Boca Juniors free stream",
      description: "Watch Bayern Munich vs Boca Juniors live stream online for free. Stream this exciting football match with high-quality video on DamiTV.",
      category: "Football"
    }
  },
  {
    id: "hidden-match",
    title: "Hidden Match",
    date: getTomorrowDate(), // Auto-updates to tomorrow
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
    visible: false,
    seo: {
      keywords: "hidden match live stream",
      description: "Hidden match for testing purposes",
      category: "Other"
    }
  }
];
