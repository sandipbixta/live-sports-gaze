
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChannelCard from './ChannelCard';
import EnhancedChannelCard from './EnhancedChannelCard';
import ModernChannelCard from './ModernChannelCard';
import { getChannelsByCountry, getCountries } from '@/data/tvChannels';

// Helper to get channel initials (first 2 capital letters)
const getInitials = (title: string) => title.split(' ').map(word => word.charAt(0).toUpperCase()).slice(0, 2).join('');

const ChannelsGrid = () => {
  const navigate = useNavigate();

  const channelsByCountry = getChannelsByCountry();
  const countryNames = Object.keys(channelsByCountry).length > 0
    ? Object.keys(channelsByCountry)
    : [];

  // To allow for "Other" category
  const filteredCountries = countryNames.filter(c => c !== "Other");
  const otherChannels = channelsByCountry["Other"] || [];

  const handleSelectChannel = (channel: any, country: string) => {
    navigate(`/channel/${country}/${channel.id}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-bold text-white mb-4">All Channels by Country</h2>
      <div className="flex flex-col gap-8">
        {/* Render channels grouped by country */}
        {filteredCountries.map(country => (
          <div key={country} className="bg-[#151922] rounded-xl border border-[#343a4d] p-4">
            <h3 className="font-semibold text-white text-lg mb-2">{country}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {(channelsByCountry[country] || []).map(channel => (
                <div
                  key={channel.id}
                  className="bg-[#1a1f2e] rounded-xl p-4 cursor-pointer hover:bg-[#242836] transition-all duration-200 border border-[#343a4d] hover:border-[#ff5a36] group"
                  onClick={() => handleSelectChannel(channel, country)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-xl mb-3 overflow-hidden flex items-center justify-center bg-[#343a4d] group-hover:scale-110 transition-transform">
                      {channel.logo ? (
                        <img
                          src={channel.logo}
                          alt={channel.title}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center text-xs font-bold text-white ${channel.logo ? 'hidden' : ''}`}>
                        {getInitials(channel.title)}
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-white group-hover:text-[#ff5a36] transition-colors">
                      {channel.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {otherChannels.length > 0 && (
          <div className="bg-[#151922] rounded-xl border border-[#343a4d] p-4">
            <h3 className="font-semibold text-white text-lg mb-2">Other</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {otherChannels.map(channel => (
                <div
                  key={channel.id}
                  className="bg-[#1a1f2e] rounded-xl p-4 cursor-pointer hover:bg-[#242836] transition-all duration-200 border border-[#343a4d] hover:border-[#ff5a36] group"
                  onClick={() => handleSelectChannel(channel, 'Other')}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-xl mb-3 overflow-hidden flex items-center justify-center bg-[#343a4d] group-hover:scale-110 transition-transform">
                      {channel.logo ? (
                        <img
                          src={channel.logo}
                          alt={channel.title}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center text-xs font-bold text-white ${channel.logo ? 'hidden' : ''}`}>
                        {getInitials(channel.title)}
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-white group-hover:text-[#ff5a36] transition-colors">
                      {channel.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelsGrid;
