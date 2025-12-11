import { Link } from "react-router-dom";
import SectionHeader from "./SectionHeader";

interface Tour {
  id: string;
  name: string;
  shortName: string;
  image: string;
  sport: string;
  link: string;
}

const tours: Tour[] = [
  {
    id: "premier-league",
    name: "Premier League",
    shortName: "EPL",
    image: "https://www.thesportsdb.com/images/media/league/badge/i6o0kh1549879062.png",
    sport: "Football",
    link: "/leagues/premier-league"
  },
  {
    id: "champions-league",
    name: "UEFA Champions League",
    shortName: "UCL",
    image: "https://www.thesportsdb.com/images/media/league/badge/0j55yv1534764799.png",
    sport: "Football",
    link: "/leagues/champions-league"
  },
  {
    id: "la-liga",
    name: "La Liga",
    shortName: "La Liga",
    image: "https://www.thesportsdb.com/images/media/league/badge/7onmyv1534768460.png",
    sport: "Football",
    link: "/leagues/la-liga"
  },
  {
    id: "serie-a",
    name: "Serie A",
    shortName: "Serie A",
    image: "https://www.thesportsdb.com/images/media/league/badge/ocy2fe1566216901.png",
    sport: "Football",
    link: "/leagues/serie-a"
  },
  {
    id: "bundesliga",
    name: "Bundesliga",
    shortName: "Bundesliga",
    image: "https://www.thesportsdb.com/images/media/league/badge/0j55yv1534764799.png",
    sport: "Football",
    link: "/leagues/bundesliga"
  },
  {
    id: "nba",
    name: "NBA Basketball",
    shortName: "NBA",
    image: "https://www.thesportsdb.com/images/media/league/badge/8o8pls1535214746.png",
    sport: "Basketball",
    link: "/leagues/nba"
  },
  {
    id: "ufc",
    name: "UFC",
    shortName: "UFC",
    image: "https://www.thesportsdb.com/images/media/league/badge/4my8c71699464722.png",
    sport: "MMA",
    link: "/leagues/ufc"
  },
  {
    id: "f1",
    name: "Formula 1",
    shortName: "F1",
    image: "https://www.thesportsdb.com/images/media/league/badge/1j42571522333498.png",
    sport: "Motorsport",
    link: "/leagues/formula-1"
  }
];

const PopularTours = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <div className="mr-4">
          <h3 className="text-lg font-bold text-primary">POPULAR</h3>
          <p className="text-xs text-muted-foreground">LIVE STREAMING</p>
          <h2 className="text-2xl font-bold text-foreground">TOURS</h2>
        </div>
      </div>
      
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
        {tours.map((tour) => (
          <Link
            key={tour.id}
            to={tour.link}
            className="flex-shrink-0 group"
          >
            <div className="w-40 h-52 rounded-xl overflow-hidden relative bg-gradient-to-b from-secondary to-card hover:scale-105 transition-transform duration-300">
              {/* Background image */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
              
              {/* League badge */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <img
                  src={tour.image}
                  alt={tour.name}
                  className="w-24 h-24 object-contain drop-shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
              
              {/* Tour info at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                <p className="text-xs text-primary font-medium uppercase">{tour.sport}</p>
                <h4 className="text-sm font-bold text-white truncate">{tour.shortName}</h4>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PopularTours;