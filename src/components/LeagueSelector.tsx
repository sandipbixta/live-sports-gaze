import { useEffect, useState } from "react";
import { apiSportsService, League } from "@/services/apiSportsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface LeagueSelectorProps {
  onLeagueSelect?: (leagueId: number, leagueName: string) => void;
}

export const LeagueSelector = ({ onLeagueSelect }: LeagueSelectorProps) => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("England");

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiSportsService.getLeagues(selectedCountry);
        
        // Extract leagues from response
        const leagueData = response.map((item: any) => ({
          id: item.league.id,
          name: item.league.name,
          type: item.league.type,
          logo: item.league.logo,
          country: item.country.name,
          flag: item.country.flag
        }));
        
        setLeagues(leagueData);
      } catch (err) {
        console.error('Error fetching leagues:', err);
        setError('Failed to load leagues');
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, [selectedCountry]);

  const countries = [
    "England", "Spain", "Italy", "Germany", "France", 
    "Portugal", "Netherlands", "Belgium", "Turkey", "Brazil"
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select League</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Country</label>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">League</label>
          <Select 
            onValueChange={(value) => {
              const league = leagues.find(l => l.id === parseInt(value));
              if (league && onLeagueSelect) {
                onLeagueSelect(league.id, league.name);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select league" />
            </SelectTrigger>
            <SelectContent>
              {leagues.map((league) => (
                <SelectItem key={league.id} value={league.id.toString()}>
                  <div className="flex items-center gap-2">
                    <img 
                      src={league.logo} 
                      alt={league.name}
                      className="w-5 h-5"
                    />
                    <span>{league.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
