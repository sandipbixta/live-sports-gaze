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

// Detect if user is casting (AirPlay, Chromecast, etc.)
export const detectCasting = (): boolean => {
  // Check for AirPlay
  if ('webkitDisplayingFullscreen' in HTMLVideoElement.prototype) {
    return true;
  }
  
  // Check for Remote Playback API (Chromecast)
  if ('remote' in HTMLVideoElement.prototype) {
    return true;
  }
  
  // Check user agent for casting indicators
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('airplay') || userAgent.includes('chromecast')) {
    return true;
  }
  
  return false;
};

// Get optimized HLS config based on connection and casting status
export const getOptimizedHLSConfig = (connectionInfo: ConnectionInfo, isCasting: boolean = false) => {
  const { effectiveType, downlink, rtt, saveData } = connectionInfo;
  
  // Base configuration with all properties
  let config = {
    maxBufferLength: 15,
    maxMaxBufferLength: 30,
    maxBufferSize: 30 * 1000 * 1000,
    maxBufferHole: 0.5,
    fragLoadingTimeOut: 20000,
    manifestLoadingTimeOut: 10000,
    levelLoadingTimeOut: 10000,
    fragLoadingMaxRetry: 6,
    levelLoadingMaxRetry: 6,
    abrBandWidthFactor: 0.95,
    abrBandWidthUpFactor: 0.7,
    nudgeOffset: 0.1,
    nudgeMaxRetry: 3,
    maxLoadingDelay: 4,
    maxFragLookUpTolerance: 0.25,
    liveSyncDurationCount: 3,
    liveMaxLatencyDurationCount: 10,
    backBufferLength: 10,
    highBufferWatchdogPeriod: 2,
    fragLoadingMaxRetryTimeout: 30000,
    manifestLoadingMaxRetry: 6
  };
  
  // Casting-optimized configuration - much larger buffers for stability
  if (isCasting) {
    return {
      ...config,
      maxBufferLength: 60, // 60 seconds for casting stability
      maxMaxBufferLength: 120, // 2 minutes max buffer
      maxBufferSize: 100 * 1000 * 1000, // 100MB for casting
      fragLoadingTimeOut: 45000, // Longer timeout for casting
      manifestLoadingTimeOut: 20000,
      levelLoadingTimeOut: 20000,
      maxBufferHole: 2.0, // More tolerant of buffer holes
      highBufferWatchdogPeriod: 5, // Less frequent checks
      nudgeOffset: 0.5, // More tolerant nudging
      nudgeMaxRetry: 12, // More retry attempts
      maxLoadingDelay: 8, // More patient loading
      maxFragLookUpTolerance: 1.0, // Very tolerant lookup
      liveSyncDurationCount: 5, // More stable sync
      liveMaxLatencyDurationCount: 15, // Higher latency tolerance
      backBufferLength: 30, // Keep more back buffer
      abrBandWidthFactor: 0.6, // Very conservative bandwidth usage
      abrBandWidthUpFactor: 0.4, // Very slow quality upgrades
      fragLoadingMaxRetry: 8, // More retry attempts
      fragLoadingMaxRetryTimeout: 60000, // Longer retry timeout
      manifestLoadingMaxRetry: 6,
      levelLoadingMaxRetry: 6
    };
  }
  
  // Adjust based on connection quality
  if (effectiveType === 'slow-2g' || effectiveType === '2g' || saveData) {
    // Very conservative settings for slow connections
    return {
      ...config,
      maxBufferLength: 5, // Very small buffer
      maxMaxBufferLength: 10,
      maxBufferSize: 10 * 1000 * 1000, // 10MB
      fragLoadingTimeOut: 30000, // Longer timeout for slow connections
      manifestLoadingTimeOut: 15000,
      levelLoadingTimeOut: 15000,
      abrBandWidthFactor: 0.8, // More conservative
      abrBandWidthUpFactor: 0.5 // Slower upgrades
    };
  } else if (effectiveType === '3g' || downlink < 2) {
    // Conservative settings for 3G/slow connections
    return {
      ...config,
      maxBufferLength: 8,
      maxMaxBufferLength: 15,
      maxBufferSize: 15 * 1000 * 1000, // 15MB
      fragLoadingTimeOut: 25000,
      manifestLoadingTimeOut: 12000,
      levelLoadingTimeOut: 12000,
      abrBandWidthFactor: 0.9,
      abrBandWidthUpFactor: 0.6
    };
  } else if (rtt > 300) {
    // Very high latency (international/European viewers from Australia)
    return {
      ...config,
      maxBufferLength: 45, // Much larger buffer for international viewers
      maxMaxBufferLength: 90, // 90 seconds max buffer
      maxBufferSize: 60 * 1000 * 1000, // 60MB buffer
      fragLoadingTimeOut: 60000, // 60 seconds timeout
      manifestLoadingTimeOut: 30000, // 30 seconds manifest timeout
      levelLoadingTimeOut: 30000,
      maxBufferHole: 2.0, // Very tolerant of buffer holes
      backBufferLength: 20, // Keep substantial back buffer
      fragLoadingMaxRetry: 10, // More retry attempts
      fragLoadingMaxRetryTimeout: 90000, // 90 seconds retry timeout
      abrBandWidthFactor: 0.7, // Conservative bandwidth usage
      abrBandWidthUpFactor: 0.4, // Slow quality upgrades
      nudgeMaxRetry: 8, // More nudge retries
      maxLoadingDelay: 8, // More patient loading
      liveSyncDurationCount: 4, // More stable sync
      liveMaxLatencyDurationCount: 12, // Higher latency tolerance
      highBufferWatchdogPeriod: 4 // Less frequent checks
    };
  } else if (rtt > 200) {
    // High latency connection adjustments
    return {
      ...config,
      maxBufferLength: 25, // Larger buffer for high latency
      maxMaxBufferLength: 45,
      fragLoadingTimeOut: 40000,
      manifestLoadingTimeOut: 20000,
      levelLoadingTimeOut: 20000,
      maxBufferHole: 1.5, // More tolerant of holes
      backBufferLength: 18, // Keep more back buffer
      fragLoadingMaxRetry: 8,
      fragLoadingMaxRetryTimeout: 50000
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

// Detect geographic latency by measuring connection to a known endpoint
export const detectGeographicLatency = async (): Promise<number> => {
  try {
    const start = performance.now();
    await fetch('https://www.cloudflare.com/cdn-cgi/trace', { 
      method: 'HEAD',
      cache: 'no-cache'
    });
    const end = performance.now();
    return Math.round(end - start);
  } catch (error) {
    console.warn('Geographic latency detection failed, using default');
    return 100; // Default to moderate latency
  }
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