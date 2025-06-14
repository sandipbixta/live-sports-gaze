import React from "react";
import { Helmet } from "react-helmet-async";
import { manualMatches } from "@/data/manualMatches";
import FeaturedMatches from "@/components/FeaturedMatches";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { fetchMatches } from "../api/sportsApi"; // Corrected import
import { Match } from "../types/sports"; // Corrected import
import MatchCard from "@/components/MatchCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

const IndexPage = () => {
  // Filter for only visible manual matches
  const visibleManualMatches = manualMatches.filter((m) => m.visible);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  // Create JSON-LD entries for each
  const sportsEventsJSONLD = visibleManualMatches.map((match) => {
    return {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      "name": match.title,
      "startDate": match.date,
      "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
      "eventStatus": "https://schema.org/EventScheduled",
      "location": {
        "@type": "VirtualLocation",
        "url": `${window.location.origin}/manual-match/${match.id}`,
      },
      "image": match.image,
      "description": `Watch ${match.teams.home} vs ${match.teams.away} live stream online for free on DamiTV.`,
      "performer": [
        {
          "@type": "SportsTeam",
          "name": match.teams.home,
        },
        {
          "@type": "SportsTeam",
          "name": match.teams.away,
        },
      ],
      "offers": {
        "@type": "Offer",
        "url": `${window.location.origin}/manual-match/${match.id}`,
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "validFrom": match.date,
      },
      "organizer": {
        "@type": "Organization",
        "name": "DamiTV",
        "url": "https://damitv.pro"
      }
    };
  });

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        const data = await fetchMatches();
        setMatches(data);
      } catch (error) {
        console.error("Failed to fetch matches:", error);
        toast({
          title: "Error",
          description: "Failed to load matches. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [toast]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredMatches = matches.filter((match) => {
    const searchMatch =
      match.teams.home.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.teams.away.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.competition.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "all") return searchMatch;
    return (
      searchMatch && match.competition.name.toLowerCase().includes(activeTab.toLowerCase())
    );
  });

  const competitions = Array.from(
    new Set(matches.map((match) => match.competition.name))
  );

  return (
    <>
      <Helmet>
        <title>DamiTV - Free Live Football Streaming & Sports TV Online</title>
        <meta
          name="description"
          content="Watch free live football streaming with Premier League, Champions League, La Liga matches and all sports TV online at DamiTV. Access hundreds of free sports channels with no registration required."
        />
        {/* Inject all match meta tags for SEO */}
        {sportsEventsJSONLD.map((event, idx) => (
          <script
            key={idx}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(event) }}
          />
        ))}
      </Helmet>
      <PageLayout searchTerm={searchTerm} onSearch={handleSearch}>
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white mb-6 sm:mb-8">
          <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
          <div className="relative p-6 sm:p-8 md:p-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">
              Watch Live Football Streams
            </h1>
            <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 max-w-2xl">
              Stream Premier League, Champions League, La Liga, Serie A and more for free.
              No registration required, just click and watch in HD quality.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Link to="/live">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Live Now
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white/10"
              >
                <Link to="/schedule">View Schedule</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Featured Matches Section */}
        <FeaturedMatches visibleManualMatches={visibleManualMatches} />

        {/* Live & Upcoming Matches */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
              <Play className="h-6 w-6 text-[#ff5a36]" />
              Live & Upcoming Matches
            </h2>
            <Link
              to="/live"
              className="text-sm text-[#ff5a36] hover:underline font-medium"
            >
              View All
            </Link>
          </div>

          {/* Tabs for filtering */}
          <Tabs
            defaultValue="all"
            className="mb-4"
            onValueChange={(value) => setActiveTab(value)}
          >
            <TabsList className="mb-4 flex flex-wrap gap-2">
              <TabsTrigger value="all">All</TabsTrigger>
              {competitions.map((competition) => (
                <TabsTrigger key={competition} value={competition.toLowerCase()}>
                  {competition}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="mt-0">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="border border-gray-200 dark:border-gray-800 rounded-lg p-4"
                    >
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-10 w-full mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filteredMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredMatches.slice(0, 8).map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      sportId={match.sportId || "football"} // Make sure to always provide sportId
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400">
                    No matches found. Please try a different search.
                  </p>
                </div>
              )}
            </TabsContent>

            {competitions.map((competition) => (
              <TabsContent
                key={competition}
                value={competition.toLowerCase()}
                className="mt-0"
              >
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="border border-gray-200 dark:border-gray-800 rounded-lg p-4"
                      >
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-10 w-full mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : filteredMatches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredMatches.slice(0, 8).map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        sportId={match.sportId || "football"} // Always provide sportId
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">
                      No matches found for this competition.
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex justify-center mt-6">
            <Button asChild variant="outline">
              <Link to="/live">View All Matches</Link>
            </Button>
          </div>
        </div>

        <Separator className="my-8 bg-gray-200 dark:bg-gray-800" />

        {/* How to Watch Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
            How to Watch
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <span className="text-blue-600 dark:text-blue-300 text-xl font-bold">
                  1
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">
                Find Your Match
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Browse our extensive collection of live and upcoming matches from
                various competitions around the world.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <span className="text-green-600 dark:text-green-300 text-xl font-bold">
                  2
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">
                Select a Stream
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Choose from multiple streaming options available for each match.
                We provide various quality options to suit your internet speed.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                <span className="text-purple-600 dark:text-purple-300 text-xl font-bold">
                  3
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">
                Enjoy the Game
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Watch the match in HD quality for free. No registration required,
                no credit card needed - just pure football action.
              </p>
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default IndexPage;
