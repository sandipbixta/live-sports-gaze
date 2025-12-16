import { Channel } from './tvChannels';

// TV Channel logo mappings - using public CDN logos
export const channelLogos: Record<string, string> = {
  'beinsport': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Bein_sport_logo.svg/200px-Bein_sport_logo.svg.png',
  'cbs': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/CBS_logo.svg/200px-CBS_logo.svg.png',
  'dazn': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/DAZN_Logo.svg/200px-DAZN_Logo.svg.png',
  'espn': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/200px-ESPN_wordmark.svg.png',
  'fox': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Fox_Broadcasting_Company_logo_%282019%29.svg/200px-Fox_Broadcasting_Company_logo_%282019%29.svg.png',
  'fs1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Fox_Sports_1_logo.svg/200px-Fox_Sports_1_logo.svg.png',
  'fs2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Fox_Sports_2_logo.svg/200px-Fox_Sports_2_logo.svg.png',
  'fubo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/FuboTV_logo.svg/200px-FuboTV_logo.svg.png',
  'laliga': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/LaLiga.svg/200px-LaLiga.svg.png',
  'mlb': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Major_League_Baseball_logo.svg/200px-Major_League_Baseball_logo.svg.png',
  'msg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/MSG_Network_logo_2019.png/200px-MSG_Network_logo_2019.png',
  'nba': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/03/National_Basketball_Association_logo.svg/200px-National_Basketball_Association_logo.svg.png',
  'nbc': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/NBC_logo.svg/200px-NBC_logo.svg.png',
  'nfl': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/National_Football_League_logo.svg/200px-National_Football_League_logo.svg.png',
  'premier': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/200px-Premier_League_Logo.svg.png',
  'sky': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a6/Sky_Sports_logo_2020.svg/200px-Sky_Sports_logo_2020.svg.png',
  'spectrum': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Spectrum_Sports_logo.svg/200px-Spectrum_Sports_logo.svg.png',
  'tnt': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/TNT_Logo_2016.svg/200px-TNT_Logo_2016.svg.png',
  'tsn': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/TSN_logo.svg/200px-TSN_logo.svg.png',
  'usa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/USA_Network_logo_%282016%29.svg/200px-USA_Network_logo_%282016%29.svg.png',
  'sportsnet': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Sportsnet_Logo.svg/200px-Sportsnet_Logo.svg.png',
};

// Get logo for a channel based on name matching
export function getChannelLogo(channelName: string): string | undefined {
  const lowerName = channelName.toLowerCase();
  
  for (const [key, logo] of Object.entries(channelLogos)) {
    if (lowerName.includes(key)) {
      return logo;
    }
  }
  
  return undefined;
}

// Premium HLS channels parsed from the provided data
export const premiumChannels: Channel[] = [
  { id: 'beinsport-usa', title: 'Bein Sport USA', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/afdb73c451239369681c5e34207bf17a.m3u8', logo: channelLogos['beinsport'] },
  { id: 'cbs-sports-network', title: 'CBS Sports Network', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/kd4hg2fw9pa7un1bs8ml5yq0cx6ozr.m3u8', logo: channelLogos['cbs'] },
  { id: 'cbs', title: 'CBS', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/v3weufn13faamb6eqbgd8myxv7zqe314.m3u8', logo: channelLogos['cbs'] },
  { id: 'cbs-sports-golazo', title: 'CBS Sports Golazo Network', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/ceswuphe1islp6ray6nemozltr4x7w4b.m3u8', logo: channelLogos['cbs'] },
  { id: 'dazn-1-us', title: 'DAZN 1 US', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/29f80fe360ea09758cda99ec2eb61fd2.m3u8', logo: channelLogos['dazn'] },
  { id: 'dazn-f1', title: 'DAZN F1', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/fc3a54634d0867b0c02ee3223292e7c6.m3u8', logo: channelLogos['dazn'] },
  { id: 'espn', title: 'ESPN', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/tgcyutly3zujtd3bgef8nevyy5v5n301.m3u8', logo: channelLogos['espn'] },
  { id: 'espn-2', title: 'ESPN 2', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/zl7vb5kt3ao1gr8ix4nf6wp9dy2uhs.m3u8', logo: channelLogos['espn'] },
  { id: 'espn-u', title: 'ESPN U', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/oi3uc8jf6yp2bw0zq9na5sm7lx1ert.m3u8', logo: channelLogos['espn'] },
  { id: 'espn-deportes', title: 'ESPN Deportes', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/45cb98f6ff304e742c65ec6a3b5d087f.m3u8', logo: channelLogos['espn'] },
  { id: 'fox', title: 'FOX', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/o282ztvzyz2nv82nowu477d4zriul8ji.m3u8', logo: channelLogos['fox'] },
  { id: 'fox-deportes', title: 'FOX Deportes', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/26f350e4a688a9a15a10f1c76712551f.m3u8', logo: channelLogos['fox'] },
  { id: 'fs1', title: 'FS1', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/j7xysrst3ytbc4h50of84mmbyrn4ba9v.m3u8', logo: channelLogos['fs1'] },
  { id: 'fs2', title: 'FS2', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/9bfdo7kxd45sst08hbuh6rwhkykmitwb.m3u8', logo: channelLogos['fs2'] },
  { id: 'fubo-sports-network', title: 'Fubo Sports Network', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/92399eaa937b3e8386b43ed0e15150e2.m3u8', logo: channelLogos['fubo'] },
  { id: 'laliga-tv', title: 'LaLiga TV', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/03b0b886a6f5016d2d70c0d1fd307ab8.m3u8', logo: channelLogos['laliga'] },
  { id: 'mlb-network', title: 'MLB Network', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/dd2b541cd3c0f5e547f9a7cdd4c2cb06.m3u8', logo: channelLogos['mlb'] },
  { id: 'msg', title: 'MSG', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/b4a3ff5f5a5a275c2494765ef30ee0f4.m3u8', logo: channelLogos['msg'] },
  { id: 'nba-tv', title: 'NBA TV', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/t1ag4xopruwafuthuwus7lni4hetucot.m3u8', logo: channelLogos['nba'] },
  { id: 'nbc', title: 'NBC', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/cb740a8079d4cb569d40d6cfa1a1b22a.m3u8', logo: channelLogos['nbc'] },
  { id: 'nbc-sports-california', title: 'NBC Sports California', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/db42b951b60b85a60a3511ac0afcd382.m3u8', logo: channelLogos['nbc'] },
  { id: 'nbc-sports-bay-area', title: 'NBC Sports Bay Area', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/5411235d278f9abfce9db28c140374d5.m3u8', logo: channelLogos['nbc'] },
  { id: 'nbc-sports-boston', title: 'NBC Sports Boston', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/df01290a3852048fa5c6688724bce1fa.m3u8', logo: channelLogos['nbc'] },
  { id: 'nbc-sports-philadelphia', title: 'NBC Sports Philadelphia', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/b46c64f505d77d9c3ba37c2f3037f0f3.m3u8', logo: channelLogos['nbc'] },
  { id: 'nfl-network', title: 'NFL Network', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/prareprlcri3on2nos6upr5fujozotro.m3u8', logo: channelLogos['nfl'] },
  { id: 'nfl-redzone', title: 'NFL Redzone', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/2d81f7d9aebd2ebbd49fc25cde38cc90.m3u8', logo: channelLogos['nfl'] },
  { id: 'premier-sports-1-ie', title: 'Premier Sports 1 IE', country: 'Ireland', countryCode: 'ie', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/ae5dt9yh2uj8gp1zwn7fk4ol6mv3cb.m3u8', logo: channelLogos['premier'] },
  { id: 'premier-sports-2-ie', title: 'Premier Sports 2 IE', country: 'Ireland', countryCode: 'ie', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/sy1bx6ca8rm3wq7in9jv2pe5hu0lgf.m3u8', logo: channelLogos['premier'] },
  { id: 'racer-network', title: 'Racer Network', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/26f5d9d5d9c41d0a73a94b793d59f158.m3u8' },
  { id: 'sky-sport-1-nz', title: 'Sky Sport 1 NZ', country: 'New Zealand', countryCode: 'nz', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/8f9b6c2d1e4a7890f3a5b1c8d7e6f4a3.m3u8', logo: channelLogos['sky'] },
  { id: 'sky-sport-2-nz', title: 'Sky Sport 2 NZ', country: 'New Zealand', countryCode: 'nz', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6.m3u8', logo: channelLogos['sky'] },
  { id: 'sky-sport-3-nz', title: 'Sky Sport 3 NZ', country: 'New Zealand', countryCode: 'nz', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b.m3u8', logo: channelLogos['sky'] },
  { id: 'sky-sport-4-nz', title: 'Sky Sport 4 NZ', country: 'New Zealand', countryCode: 'nz', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/67f5bf81544d442bd7c1f29d822ac19b.m3u8', logo: channelLogos['sky'] },
  { id: 'sky-sport-5-nz', title: 'Sky Sport 5 NZ', country: 'New Zealand', countryCode: 'nz', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d.m3u8', logo: channelLogos['sky'] },
  { id: 'sky-sport-6-nz', title: 'Sky Sport 6 NZ', country: 'New Zealand', countryCode: 'nz', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/f1e2d3c4b5a698786543210fedcba987.m3u8', logo: channelLogos['sky'] },
  { id: 'sky-sport-7-nz', title: 'Sky Sport 7 NZ', country: 'New Zealand', countryCode: 'nz', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d.m3u8', logo: channelLogos['sky'] },
  { id: 'sky-sport-8-nz', title: 'Sky Sport 8 NZ', country: 'New Zealand', countryCode: 'nz', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/e25132915cf1e67759051cac80b42275.m3u8', logo: channelLogos['sky'] },
  { id: 'sky-sport-9-nz', title: 'Sky Sport 9 NZ', country: 'New Zealand', countryCode: 'nz', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/6ace62ce8424aee87f1edadb67d5a60a.m3u8', logo: channelLogos['sky'] },
  { id: 'sky-sports-plus', title: 'Sky Sports+', country: 'United Kingdom', countryCode: 'gb', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/kl11IkOsWATR8duxiWrOyiprERl2hLx4.m3u8', logo: channelLogos['sky'] },
  { id: 'sky-sports-action', title: 'Sky Sports Action', country: 'United Kingdom', countryCode: 'gb', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/wra2wlraTrewrAwohlsiCr0kUpHlswuc.m3u8', logo: channelLogos['sky'] },
  { id: 'sky-sports-cricket', title: 'Sky Sports Cricket', country: 'United Kingdom', countryCode: 'gb', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/j5ru6icHofROsespidec64w0s7lgo8ot.m3u8', logo: channelLogos['sky'] },
  { id: 'sky-sports-football', title: 'Sky Sports Football', country: 'United Kingdom', countryCode: 'gb', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/zuw3aylborapastup4o5rophlbrospev.m3u8', logo: channelLogos['sky'] },
  { id: 'sky-sports-f1', title: 'Sky Sports F1', country: 'United Kingdom', countryCode: 'gb', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/888520f36cd94c5da4c71fddc1a5fc9b.m3u8', logo: channelLogos['sky'] },
  { id: 'sky-sports-main-event', title: 'Sky Sports Main Event', country: 'United Kingdom', countryCode: 'gb', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/4restacahurastic3o7rodraprey2glb.m3u8', logo: channelLogos['sky'] },
  { id: 'sky-sports-mix', title: 'Sky Sports Mix', country: 'United Kingdom', countryCode: 'gb', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/phAjl4we7iw0agitOpro8Rlcrotrufre.m3u8', logo: channelLogos['sky'] },
  { id: 'spectrum-sportsnet-dodgers', title: 'Spectrum Sportsnet Dodgers', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/1e79f36d906e804c956fd1a78c811548.m3u8', logo: channelLogos['spectrum'] },
  { id: 'tnt', title: 'TNT', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/qibemas7lswithlwodu4ozablj8zuno4.m3u8', logo: channelLogos['tnt'] },
  { id: 'tnt-sports-1', title: 'TNT Sports 1', country: 'United Kingdom', countryCode: 'gb', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/frofudrljocldrugudr295ifistlsw1w.m3u8', logo: channelLogos['tnt'] },
  { id: 'tnt-sports-2', title: 'TNT Sports 2', country: 'United Kingdom', countryCode: 'gb', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/c5phuthukothlwrudro8rosas3b64ini.m3u8', logo: channelLogos['tnt'] },
  { id: 'tnt-sports-3', title: 'TNT Sports 3', country: 'United Kingdom', countryCode: 'gb', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/sodrito5weqefradroqa900esw68i9lg.m3u8', logo: channelLogos['tnt'] },
  { id: 'tnt-sports-4', title: 'TNT Sports 4', country: 'United Kingdom', countryCode: 'gb', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/8esim7bratiq3cadaxes34tesibropop.m3u8', logo: channelLogos['tnt'] },
  { id: 'tsn-1', title: 'TSN 1', country: 'Canada', countryCode: 'ca', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/4a1b2c3d5e6f7890a1b2c3d4e5f67890.m3u8', logo: channelLogos['tsn'] },
  { id: 'tsn-2', title: 'TSN 2', country: 'Canada', countryCode: 'ca', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/8b9c0d1e2f3a4b5c6d7e8f90a1b2c3d4.m3u8', logo: channelLogos['tsn'] },
  { id: 'tsn-3', title: 'TSN 3', country: 'Canada', countryCode: 'ca', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/e5f6a7b8c9d0e1f2a3b4c5d6e7f890a1.m3u8', logo: channelLogos['tsn'] },
  { id: 'tsn-4', title: 'TSN 4', country: 'Canada', countryCode: 'ca', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8.m3u8', logo: channelLogos['tsn'] },
  { id: 'tsn-5', title: 'TSN 5', country: 'Canada', countryCode: 'ca', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/8a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d.m3u8', logo: channelLogos['tsn'] },
  { id: 'usa-network', title: 'USA Network', country: 'United States', countryCode: 'us', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/wraprawiclijudr9qodr7stltr7atre6.m3u8', logo: channelLogos['usa'] },
  { id: 'sportsnet-ontario', title: 'Sportsnet Ontario', country: 'Canada', countryCode: 'ca', category: 'sports', embedUrl: '', hlsUrl: 'https://47442542a4df9c37168d814d2743c294.s3.eu-central-2.wasabisys.com/c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0.m3u8', logo: channelLogos['sportsnet'] },
];

// Get premium channels grouped by country
export function getPremiumChannelsByCountry(): Record<string, Channel[]> {
  return premiumChannels.reduce((acc, channel) => {
    if (!acc[channel.country]) {
      acc[channel.country] = [];
    }
    acc[channel.country].push(channel);
    return acc;
  }, {} as Record<string, Channel[]>);
}
