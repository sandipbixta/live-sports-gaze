
export interface ManualMatchLink {
  id: string;
  name: string;
  url: string;
  quality?: string;
}

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
  links: ManualMatchLink[];
}
