
export interface ManualMatch {
  id: string;
  title: string;
  teams: {
    home: string;
    away: string;
  };
  date: string;
  visible: boolean;
  image?: string;
}
