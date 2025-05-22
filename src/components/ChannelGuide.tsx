
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader } from 'lucide-react';
import { getCountries } from '@/data/tvChannels';

interface Program {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
  category?: string;
}

interface ChannelProgram {
  channelId: string;
  channelName: string;
  programs: Program[];
}

const ChannelGuide = ({ selectedCountry }: { selectedCountry: string }) => {
  const [programData, setProgramData] = useState<ChannelProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [allEpgData, setAllEpgData] = useState<Record<string, ChannelProgram[]>>({});
  const countries = getCountries();

  // Fetch ALL TV guide data for all countries
  useEffect(() => {
    const fetchAllEpgData = async () => {
      setIsLoading(true);
      
      try {
        console.log('Fetching ALL EPG data for all countries');
        
        // First try to fetch the combined EPG data
        let combinedResponse = await fetch('https://raw.githubusercontent.com/sandipbixta/epg-damitv/main/epg-all.json')
          .catch(() => {
            console.log('Failed with combined EPG URL, trying alternative location');
            return fetch('https://sandipbixta.github.io/epg-damitv/epg-all.json');
          });
          
        // If combined data exists and is valid, use it
        if (combinedResponse.ok) {
          const combinedData = await combinedResponse.json();
          console.log('Combined EPG data fetched successfully');
          setAllEpgData(combinedData);
          
          // Set initial data to match selected country
          if (combinedData[selectedCountry]) {
            setProgramData(combinedData[selectedCountry]);
          } else {
            setProgramData([]);
          }
          
          setIsLoading(false);
          return;
        }

        // If combined data doesn't exist, fetch individual country data
        console.log('Combined EPG not found, fetching individual country EPGs');
        const epgByCountry: Record<string, ChannelProgram[]> = {};
        
        // Create array of fetch promises for all countries
        const fetchPromises = countries.map(async (country) => {
          const formattedCountry = country.toLowerCase().replace(/\s+/g, '-');
          
          try {
            // Try both potential URLs for each country
            let response = await fetch(`https://raw.githubusercontent.com/sandipbixta/epg-damitv/main/epg-${formattedCountry}.json`)
              .catch(() => fetch(`https://sandipbixta.github.io/epg-damitv/epg-${formattedCountry}.json`));
            
            if (response.ok) {
              const data = await response.json();
              epgByCountry[country] = data;
              console.log(`EPG for ${country} fetched successfully: ${data.length} channels`);
            } else {
              console.log(`No EPG found for ${country}`);
              epgByCountry[country] = [];
            }
          } catch (error) {
            console.error(`Error fetching EPG for ${country}:`, error);
            epgByCountry[country] = [];
          }
        });
        
        // Wait for all fetches to complete
        await Promise.allSettled(fetchPromises);
        
        // Try to get default EPG for countries with empty data
        const defaultResponse = await fetch('https://raw.githubusercontent.com/sandipbixta/epg-damitv/main/epg-default.json')
          .catch(() => fetch('https://sandipbixta.github.io/epg-damitv/epg-default.json'));
          
        if (defaultResponse.ok) {
          const defaultData = await defaultResponse.json();
          countries.forEach(country => {
            if (!epgByCountry[country] || epgByCountry[country].length === 0) {
              console.log(`Using default EPG for ${country}`);
              epgByCountry[country] = defaultData;
            }
          });
        }
        
        setAllEpgData(epgByCountry);
        
        // Set initial data to match selected country
        setProgramData(epgByCountry[selectedCountry] || []);
        
      } catch (error) {
        console.error('Error in EPG data fetching process:', error);
        setProgramData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllEpgData();
    
    // Update current time every minute
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []); // Only fetch on initial load
  
  // Update displayed program data when selected country changes
  useEffect(() => {
    if (allEpgData[selectedCountry]) {
      setProgramData(allEpgData[selectedCountry]);
    } else {
      setProgramData([]);
    }
  }, [selectedCountry, allEpgData]);

  // Format time for display
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Check if a program is currently airing
  const isCurrentlyAiring = (startTime: string, endTime: string) => {
    const now = currentTime.getTime();
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    return now >= start && now <= end;
  };

  if (isLoading) {
    return (
      <Card className="bg-[#151922] border-[#343a4d] mt-6">
        <CardContent className="p-6 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <Loader className="h-8 w-8 animate-spin text-[#ff5a36] mb-2" />
            <p className="text-white">Loading complete TV guide...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!programData.length) {
    return (
      <Card className="bg-[#151922] border-[#343a4d] mt-6">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">No TV guide available for {selectedCountry} channels.</p>
          <p className="text-gray-500 mt-2 text-sm">
            The guide data for {selectedCountry} may be temporarily unavailable. 
            Try selecting a different country or check again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#151922] border-[#343a4d] mt-6">
      <CardHeader>
        <CardTitle className="text-white text-lg">TV Guide - {selectedCountry}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <Table className="border-collapse">
            <TableHeader className="sticky top-0 bg-[#242836] z-10">
              <TableRow className="border-b border-[#343a4d]">
                <TableHead className="text-white w-1/4">Channel</TableHead>
                <TableHead className="text-white">Current & Upcoming Programs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programData.map((channel) => (
                <TableRow key={channel.channelId} className="border-b border-[#343a4d]">
                  <TableCell className="font-medium text-white">{channel.channelName}</TableCell>
                  <TableCell className="p-0">
                    <div className="flex flex-col">
                      {channel.programs.slice(0, 5).map((program) => (
                        <div 
                          key={program.id} 
                          className={`p-3 border-t first:border-t-0 border-[#343a4d] ${
                            isCurrentlyAiring(program.startTime, program.endTime) 
                              ? 'bg-[#343a4d]/40' 
                              : ''
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            <div className="text-gray-400 text-sm whitespace-nowrap">
                              {formatTime(program.startTime)}
                            </div>
                            <div>
                              <div className="font-medium text-white">
                                {program.title}
                                {isCurrentlyAiring(program.startTime, program.endTime) && (
                                  <span className="ml-2 bg-red-600 text-white text-xs px-1 py-0.5 rounded">LIVE</span>
                                )}
                              </div>
                              {program.description && (
                                <div className="text-gray-400 text-sm mt-0.5 line-clamp-1">{program.description}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ChannelGuide;
