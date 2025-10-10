import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Signal, SignalHigh, SignalLow, SignalMedium } from 'lucide-react';
import { getConnectionInfo, ConnectionInfo, detectGeographicLatency } from '@/utils/connectionOptimizer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConnectionIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({ 
  className = '',
  showDetails = false 
}) => {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>(getConnectionInfo());
  const [latency, setLatency] = useState<number | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    // Initial latency measurement
    detectGeographicLatency().then(setLatency);

    // Update connection info on changes
    const updateConnection = () => {
      setConnectionInfo(getConnectionInfo());
    };

    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', updateConnection);
      return () => connection.removeEventListener('change', updateConnection);
    }
  }, []);

  const getConnectionQuality = () => {
    const { effectiveType, downlink, rtt, saveData } = connectionInfo;
    const effectiveLatency = latency || rtt;

    if (saveData) return 'poor';
    if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'poor';
    if (effectiveType === '3g' && downlink < 1) return 'poor';
    if (effectiveType === '3g' || downlink < 2) return 'fair';
    if (effectiveLatency > 500) return 'fair'; // Only warn on very high latency
    if (effectiveType === '4g' && downlink >= 5) return 'excellent';
    return 'good';
  };

  const getIcon = () => {
    const quality = getConnectionQuality();
    const iconClass = "w-4 h-4";
    
    switch (quality) {
      case 'poor':
        return <SignalLow className={`${iconClass} text-red-500`} />;
      case 'fair':
        return <SignalMedium className={`${iconClass} text-yellow-500`} />;
      case 'good':
        return <SignalHigh className={`${iconClass} text-blue-500`} />;
      case 'excellent':
        return <Signal className={`${iconClass} text-green-500`} />;
      default:
        return <Wifi className={`${iconClass} text-gray-500`} />;
    }
  };

  const getQualityText = () => {
    const quality = getConnectionQuality();
    switch (quality) {
      case 'poor':
        return 'Poor Connection';
      case 'fair':
        return 'Fair Connection';
      case 'good':
        return 'Good Connection';
      case 'excellent':
        return 'Excellent Connection';
      default:
        return 'Unknown';
    }
  };

  const getRecommendation = () => {
    const quality = getConnectionQuality();
    const effectiveLatency = latency || connectionInfo.rtt;

    if (quality === 'poor') {
      return 'Recommended: 360p or lower quality';
    }
    if (quality === 'fair') {
      if (effectiveLatency > 500) {
        return 'High latency detected. Consider lower quality for stability.';
      }
      return 'Recommended: 480p-720p quality';
    }
    if (quality === 'good') {
      return 'Recommended: 720p-1080p quality';
    }
    return 'Recommended: Auto quality (best available)';
  };

  const getStatusColor = () => {
    const quality = getConnectionQuality();
    switch (quality) {
      case 'poor':
        return 'bg-red-500/20 border-red-500/50 text-red-300';
      case 'fair':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      case 'good':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
      case 'excellent':
        return 'bg-green-500/20 border-green-500/50 text-green-300';
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
    }
  };

  const content = (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getStatusColor()} ${className}`}>
      {getIcon()}
      {showDetails && (
        <div className="flex flex-col">
          <span className="text-xs font-medium">{getQualityText()}</span>
          <span className="text-[10px] opacity-75">
            {connectionInfo.effectiveType.toUpperCase()} • {connectionInfo.downlink}Mbps
            {latency && ` • ${latency}ms`}
          </span>
        </div>
      )}
      {!showDetails && (
        <span className="text-xs font-medium">{connectionInfo.effectiveType.toUpperCase()}</span>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent className="bg-black/90 border-white/20 max-w-xs">
          <div className="space-y-2">
            <div className="font-medium">{getQualityText()}</div>
            <div className="text-xs space-y-1">
              <div>Speed: {connectionInfo.downlink} Mbps</div>
              <div>Type: {connectionInfo.effectiveType.toUpperCase()}</div>
              {latency && <div>Latency: {latency}ms {latency > 300 && '(High)'}</div>}
              {connectionInfo.saveData && <div className="text-yellow-400">Data Saver: On</div>}
            </div>
            <div className="text-xs pt-2 border-t border-white/20 text-white/70">
              {getRecommendation()}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConnectionIndicator;
