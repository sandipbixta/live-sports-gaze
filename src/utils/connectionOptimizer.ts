// Connection speed detection and stream optimization utilities

export interface ConnectionInfo {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export interface StreamQuality {
  level: number;
  name: string;
  maxBitrate: number;
  recommended: boolean;
}

// Detect user's connection quality
export const getConnectionInfo = (): ConnectionInfo => {
  // Check if NetworkInformation API is available
  const nav = navigator as any;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
  
  if (connection) {
    return {
      effectiveType: connection.effectiveType || '4g',
      downlink: connection.downlink || 10,
      rtt: connection.rtt || 100,
      saveData: connection.saveData || false
    };
  }
  
  // Fallback values for browsers without NetworkInformation API
  return {
    effectiveType: '4g',
    downlink: 10,
    rtt: 100,
    saveData: false
  };
};

// Get recommended stream quality based on connection
export const getRecommendedQuality = (connectionInfo: ConnectionInfo): StreamQuality[] => {
  const { effectiveType, downlink, saveData } = connectionInfo;
  
  // Base quality levels
  const qualities: StreamQuality[] = [
    { level: 0, name: 'Auto', maxBitrate: 0, recommended: true },
    { level: 1, name: '360p', maxBitrate: 800000, recommended: false },
    { level: 2, name: '480p', maxBitrate: 1200000, recommended: false },
    { level: 3, name: '720p', maxBitrate: 2500000, recommended: false },
    { level: 4, name: '1080p', maxBitrate: 5000000, recommended: false }
  ];
  
  // If user has data saver on, recommend lower quality
  if (saveData) {
    qualities[1].recommended = true; // 360p
    qualities[0].recommended = false;
    return qualities;
  }
  
  // Recommend quality based on connection speed
  switch (effectiveType) {
    case 'slow-2g':
    case '2g':
      qualities[1].recommended = true; // 360p
      break;
    case '3g':
      if (downlink < 1.5) {
        qualities[1].recommended = true; // 360p
      } else {
        qualities[2].recommended = true; // 480p
      }
      break;
    case '4g':
    default:
      if (downlink < 2) {
        qualities[2].recommended = true; // 480p
      } else if (downlink < 5) {
        qualities[3].recommended = true; // 720p
      } else {
        qualities[0].recommended = true; // Auto (will select best)
      }
      break;
  }
  
  return qualities;
};

// Get optimized HLS config based on connection
export const getOptimizedHLSConfig = (connectionInfo: ConnectionInfo) => {
  const { effectiveType, downlink, rtt, saveData } = connectionInfo;
  
  // Base configuration
  let config = {
    maxBufferLength: 15,
    maxMaxBufferLength: 30,
    maxBufferSize: 30 * 1000 * 1000,
    fragLoadingTimeOut: 20000,
    manifestLoadingTimeOut: 10000,
    levelLoadingTimeOut: 10000
  };
  
  // Adjust based on connection quality
  if (effectiveType === 'slow-2g' || effectiveType === '2g' || saveData) {
    // Very conservative settings for slow connections
    config = {
      ...config,
      maxBufferLength: 5, // Very small buffer
      maxMaxBufferLength: 10,
      maxBufferSize: 10 * 1000 * 1000, // 10MB
      fragLoadingTimeOut: 30000, // Longer timeout for slow connections
      manifestLoadingTimeOut: 15000,
      levelLoadingTimeOut: 15000
    };
  } else if (effectiveType === '3g' || downlink < 2) {
    // Conservative settings for 3G/slow connections
    config = {
      ...config,
      maxBufferLength: 8,
      maxMaxBufferLength: 15,
      maxBufferSize: 15 * 1000 * 1000, // 15MB
      fragLoadingTimeOut: 25000,
      manifestLoadingTimeOut: 12000,
      levelLoadingTimeOut: 12000
    };
  } else if (rtt > 200) {
    // High latency connection adjustments
    config = {
      ...config,
      maxBufferLength: 20, // Larger buffer for high latency
      fragLoadingTimeOut: 30000,
      manifestLoadingTimeOut: 15000,
      levelLoadingTimeOut: 15000
    };
  }
  
  return config;
};

// Monitor connection changes
export const onConnectionChange = (callback: (info: ConnectionInfo) => void) => {
  const nav = navigator as any;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
  
  if (connection) {
    const handleChange = () => {
      callback(getConnectionInfo());
    };
    
    connection.addEventListener('change', handleChange);
    
    // Return cleanup function
    return () => {
      connection.removeEventListener('change', handleChange);
    };
  }
  
  // Return no-op cleanup if connection API not available
  return () => {};
};

// Estimate if current connection can handle a bitrate
export const canHandleBitrate = (bitrate: number, connectionInfo: ConnectionInfo): boolean => {
  const { downlink, effectiveType, saveData } = connectionInfo;
  
  if (saveData) {
    return bitrate <= 800000; // Max 800kbps in data saver mode
  }
  
  // Convert downlink from Mbps to bps and apply safety factor
  const availableBandwidth = downlink * 1000000 * 0.8; // 80% safety margin
  
  // Additional checks based on connection type
  switch (effectiveType) {
    case 'slow-2g':
      return bitrate <= 200000; // 200kbps max
    case '2g':
      return bitrate <= 500000; // 500kbps max
    case '3g':
      return bitrate <= Math.min(2000000, availableBandwidth); // 2Mbps max or available bandwidth
    case '4g':
    default:
      return bitrate <= availableBandwidth;
  }
};