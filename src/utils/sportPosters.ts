// Auto-generated sport poster resolver
// Maps sport/category names to local poster images

import football from '@/assets/sports/football.jpg';
import basketball from '@/assets/sports/basketball.jpg';
import cricket from '@/assets/sports/cricket.jpg';
import tennis from '@/assets/sports/tennis.jpg';
import f1 from '@/assets/sports/f1.jpg';
import ufc from '@/assets/sports/ufc.jpg';
import boxing from '@/assets/sports/boxing.jpg';
import wwe from '@/assets/sports/wwe.jpg';
import rugby from '@/assets/sports/rugby.jpg';
import baseball from '@/assets/sports/baseball.jpg';
import hockey from '@/assets/sports/hockey.jpg';
import golf from '@/assets/sports/golf.jpg';
import esports from '@/assets/sports/esports.jpg';

const map: Record<string, string> = {
  football,
  soccer: football,
  basketball,
  cricket,
  tennis,
  'formula-1': f1,
  f1,
  motorsport: f1,
  racing: f1,
  mma: ufc,
  ufc,
  fight: ufc,
  boxing,
  wrestling: wwe,
  wwe,
  rugby,
  baseball,
  hockey,
  golf,
  esports,
  'e-sports': esports,
  gaming: esports,
};

function normalize(input?: string) {
  return (input || '').toLowerCase().replace(/[^a-z0-9-]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function getSportPoster(category?: string): string | undefined {
  const key = normalize(category);
  if (!key) return undefined;

  // direct match
  if (map[key]) return map[key];

  // fuzzy contains checks
  if (key.includes('football') || key.includes('soccer')) return football;
  if (key.includes('basket')) return basketball;
  if (key.includes('cricket')) return cricket;
  if (key.includes('tennis')) return tennis;
  if (key.includes('formula') || key.includes('f1') || key.includes('motor') || key.includes('race')) return f1;
  if (key.includes('mma') || key.includes('ufc') || key.includes('fight')) return ufc;
  if (key.includes('boxing')) return boxing;
  if (key.includes('wrest') || key.includes('wwe')) return wwe;
  if (key.includes('rugby')) return rugby;
  if (key.includes('baseball')) return baseball;
  if (key.includes('hockey')) return hockey;
  if (key.includes('golf')) return golf;
  if (key.includes('esport') || key.includes('gaming')) return esports;

  return undefined;
}
