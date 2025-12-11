import { Link } from "react-router-dom";

interface SectionHeaderProps {
  title: string;
  seeAllLink?: string;
  seeAllText?: string;
}

const SectionHeader = ({ title, seeAllLink, seeAllText = "SEE ALL" }: SectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 bg-primary rounded-full" />
        <h2 className="text-lg md:text-xl font-bold text-foreground">{title}</h2>
      </div>
      {seeAllLink && (
        <Link 
          to={seeAllLink}
          className="text-primary text-sm font-semibold hover:underline transition-colors"
        >
          {seeAllText}
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;