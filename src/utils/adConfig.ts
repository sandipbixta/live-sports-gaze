
// Ad configuration utility
export const adConfig = {
  banner: {
    large: {
      key: '6f9d1f3d2ad1eb4e3efaf82e5571ea37',
      scriptSrc: '//uncertainbill.com/6f9d1f3d2ad1eb4e3efaf82e5571ea37/invoke.js',
      width: 728,
      height: 90
    },
    medium: {
      key: '24887eba6a7c2444602020b1915f8a43',
      scriptSrc: '//uncertainbill.com/24887eba6a7c2444602020b1915f8a43/invoke.js',
      width: 468,
      height: 60
    }
  },
  rectangle: {
    key: '7c589340b2a1155dcea92f44cc468438',
    scriptSrc: '//uncertainbill.com/7c589340b2a1155dcea92f44cc468438/invoke.js',
    width: 300,
    height: 250
  },
  container: {
    key: 'a873bc1d3d203f2f13c32a99592441b8',
    scriptSrc: '//uncertainbill.com/a873bc1d3d203f2f13c32a99592441b8/invoke.js',
    containerId: 'container-a873bc1d3d203f2f13c32a99592441b8'
  },
  directLink: {
    url: 'https://assumptiveslumber.com/zbt0wegpe?key=39548340a9430381e48a2856c8cf8d37',
    cooldownMinutes: 5,
    sessionKey: 'directLinkAdTriggered'
  },
  popunder: {
    scriptSrc: '//assumptiveslumber.com/ae/f7/eb/aef7eba12c46ca91518228f813db6ce5.js',
    cooldownMinutes: 5,
    sessionKey: 'popunderAdTriggered',
    delaySeconds: 3
  },
  adult: {
    mobile: {
      key: 'aef1978a837e09b2a4db7546aaaf55e4',
      scriptSrc: '//uncertainbill.com/aef1978a837e09b2a4db7546aaaf55e4/invoke.js',
      width: 320,
      height: 50
    },
    sidebar: {
      key: 'a15877b546566779d012a746c76b88da',
      scriptSrc: '//uncertainbill.com/a15877b546566779d012a746c76b88da/invoke.js',
      width: 160,
      height: 300
    }
  }
};

// Helper to determine if ads should be shown
export const shouldShowAds = () => {
  // You can add logic here based on user preferences or other factors
  // For now, we'll always return true
  return true;
};

// Helper to check if ad cooldown has passed
export const isAdCooldownPassed = (sessionKey: string, cooldownMinutes: number): boolean => {
  const lastTriggered = localStorage.getItem(sessionKey);
  if (!lastTriggered) {
    return true;
  }
  
  const timePassed = Date.now() - parseInt(lastTriggered);
  const cooldownMs = cooldownMinutes * 60 * 1000;
  return timePassed > cooldownMs;
};

// Helper to mark ad as triggered
export const markAdTriggered = (sessionKey: string): void => {
  localStorage.setItem(sessionKey, Date.now().toString());
};

// Helper to get appropriate ad dimensions and config based on device type
export const getBannerAdConfig = (isMobile: boolean) => {
  return isMobile ? adConfig.banner.medium : adConfig.banner.large;
};

// Helper to get appropriate ad dimensions based on device type
export const getAdDimensions = (type: 'banner', isMobile: boolean) => {
  if (type === 'banner') {
    const config = getBannerAdConfig(isMobile);
    return { width: config.width, height: config.height };
  }
  return { width: 300, height: 250 }; // Default
};
