import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Settings, Check, Wifi, WifiOff } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { getConnectionInfo, getRecommendedQuality, StreamQuality } from '../utils/connectionOptimizer';

interface StreamQualitySelectorProps {
  onQualityChange: (level: number) => void;
  currentLevel: number;
  availableLevels?: Array<{ width: number; height: number; bitrate: number }>;
  className?: string;
}

const StreamQualitySelector: React.FC<StreamQualitySelectorProps> = ({
  onQualityChange,
  currentLevel,
  availableLevels = [],
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState(getConnectionInfo());
  const [recommendedQualities, setRecommendedQualities] = useState<StreamQuality[]>([]);

  // Update connection info and recommendations
  useEffect(() => {
    const updateConnection = () => {
      const info = getConnectionInfo();
      setConnectionInfo(info);
      setRecommendedQualities(getRecommendedQuality(info));
    };

    updateConnection();

    // Listen for connection changes
    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', updateConnection);
      return () => connection.removeEventListener('change', updateConnection);
    }
  }, []);

  // Map HLS levels to quality names
  const getQualityName = (levelIndex: number): string => {
    if (levelIndex === -1 || levelIndex === 0) return 'Auto';
    
    const level = availableLevels[levelIndex - 1]; // HLS levels are 0-indexed but we show them as 1-indexed
    if (!level) return `Level ${levelIndex}`;
    
    // Determine quality name based on resolution
    if (level.height >= 1080) return '1080p';
    if (level.height >= 720) return '720p';
    if (level.height >= 480) return '480p';
    if (level.height >= 360) return '360p';
    return `${level.height}p`;
  };

  // Get bitrate display
  const getBitrateDisplay = (levelIndex: number): string => {
    if (levelIndex === -1 || levelIndex === 0) return '';
    
    const level = availableLevels[levelIndex - 1];
    if (!level) return '';
    
    return ` (${Math.round(level.bitrate / 1000)}k)`;
  };

  // Check if quality is recommended
  const isRecommended = (levelIndex: number): boolean => {
    if (levelIndex === -1 || levelIndex === 0) {
      return recommendedQualities.find(q => q.level === 0)?.recommended || false;
    }
    
    const level = availableLevels[levelIndex - 1];
    if (!level) return false;
    
    return recommendedQualities.some(q => 
      q.recommended && level.bitrate <= q.maxBitrate
    );
  };

  const handleQualitySelect = (level: number) => {
    onQualityChange(level);
    setIsOpen(false);
  };

  const getConnectionIcon = () => {
    switch (connectionInfo.effectiveType) {
      case 'slow-2g':
      case '2g':
        return <WifiOff className="w-3 h-3 text-red-400" />;
      case '3g':
        return <Wifi className="w-3 h-3 text-yellow-400" />;
      case '4g':
      default:
        return <Wifi className="w-3 h-3 text-green-400" />;
    }
  };

  // Create quality options including auto and available levels
  const qualityOptions = [
    { level: -1, name: 'Auto', isRecommended: isRecommended(-1), bitrate: '' },
    ...availableLevels.map((level, index) => ({
      level: index + 1,
      name: getQualityName(index + 1),
      isRecommended: isRecommended(index + 1),
      bitrate: getBitrateDisplay(index + 1)
    }))
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`bg-black/50 hover:bg-black/70 text-white border-0 ${className}`}
        >
          <Settings className="w-4 h-4 mr-1" />
          {getQualityName(currentLevel)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 bg-black/90 border-white/20" align="end">
        <div className="p-3">
          {/* Connection Info */}
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/20">
            {getConnectionIcon()}
            <span className="text-xs text-white/70">
              {connectionInfo.effectiveType.toUpperCase()} 
              {connectionInfo.downlink > 0 && ` • ${connectionInfo.downlink}Mbps`}
              {connectionInfo.saveData && ' • Data Saver'}
            </span>
          </div>

          {/* Quality Options */}
          <div className="space-y-1">
            {qualityOptions.map((option) => (
              <button
                key={option.level}
                onClick={() => handleQualitySelect(option.level)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                  currentLevel === option.level
                    ? 'bg-blue-600 text-white'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{option.name}{option.bitrate}</span>
                  {option.isRecommended && (
                    <span className="text-xs bg-green-600 text-white px-1.5 py-0.5 rounded">
                      Recommended
                    </span>
                  )}
                </div>
                {currentLevel === option.level && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>

          {/* Help Text */}
          <div className="mt-3 pt-2 border-t border-white/20">
            <p className="text-xs text-white/60">
              Quality is automatically adjusted based on your connection speed. 
              Choose manual settings if you experience buffering.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default StreamQualitySelector;