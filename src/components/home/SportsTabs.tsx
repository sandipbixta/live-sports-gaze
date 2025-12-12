import { SPORTS } from '@/services/combinedSportsService';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SportsTabs = ({ activeTab, onTabChange }: Props) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {SPORTS.map((sport) => (
        <button
          key={sport.id}
          onClick={() => onTabChange(sport.id)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all duration-200 ${
            activeTab === sport.id
              ? 'bg-gradient-to-r from-primary to-orange-500 text-primary-foreground shadow-lg shadow-primary/30 scale-105'
              : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
          }`}
        >
          <span className="text-lg">{sport.icon}</span>
          <span className="text-sm font-medium">{sport.name}</span>
        </button>
      ))}
    </div>
  );
};

export default SportsTabs;
