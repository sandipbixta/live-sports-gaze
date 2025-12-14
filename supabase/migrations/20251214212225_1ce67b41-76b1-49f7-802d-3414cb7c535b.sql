-- Delete incorrectly cached league teams data
DELETE FROM league_teams WHERE league_name IN (
  'soccer_italy_serie_a',
  'soccer_france_ligue_one', 
  'soccer_epl',
  'soccer_spain_la_liga',
  'soccer_germany_bundesliga',
  'soccer_usa_mls',
  'soccer_netherlands_eredivisie',
  'soccer_portugal_primeira_liga',
  'soccer_uefa_champs_league'
);