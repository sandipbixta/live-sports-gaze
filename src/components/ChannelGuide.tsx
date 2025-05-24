
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader } from 'lucide-react';
import { getCountries, getChannelsByCountry } from '@/data/tvChannels';
import { epgService, EPGChannel } from '@/services/epgService';

const ChannelGuide = ({ selectedCountry }: { selectedCountry: string }) => {
  const [programData, setProgramData] = useState<EPGChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [allEpgData, setAllEpgData] = useState<Record<string, EPGChannel[]>>({});
  
  const channelsByCountry = getChannelsByCountry();

  // Fetch EPG data for all countries
  useEffect(() => {
    const fetchAllEpgData = async () => {
      setIsLoading(true);
      
      try {
        const epgData = await epgService.getAllEPGData(channelsByCountry);
        setAllEpgData(epgData);
        
        // Set initial data to match selected country
        if (epgData[selectedCountry]) {
          setProgramData(epgData[selectedCountry]);
        } else {
          setProgramData([]);
        }
        
      } catch (error) {
        console.error('Error fetching EPG data:', error);
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
  }, []);
  
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
            <p className="text-white">Loading TV guide...</p>
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
            EPG data is being generated. Please try again in a moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#151922] border-[#343a4d] mt-6">
      <CardHeader>
        <CardTitle className="text-white text-lg">TV Guide - {selectedCountry}</CardTitle>
        <p className="text-gray-400 text-sm">Live and upcoming programs</p>
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
