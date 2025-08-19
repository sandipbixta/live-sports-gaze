
// Ad configuration utility
export const adConfig = {
  socialBar: {
    scriptSrc: '//monkeyhundredsarmed.com/2d/10/9c/2d109cea62316aeb5d20389246c3d8a9.js'
  },
  banner: {
    key: '6f9d1f3d2ad1eb4e3efaf82e5571ea37',
    scriptSrc: '//monkeyhundredsarmed.com/6f9d1f3d2ad1eb4e3efaf82e5571ea37/invoke.js',
    desktop: {
      width: 728,
      height: 90
    },
    mobile: {
      width: 320,
      height: 50
    }
  },
  directLink: {
    url: 'https://uncertainbill.com/zbt0wegpe?key=39548340a9430381e48a2856c8cf8d37',
    cooldownMinutes: 30, // Only trigger once every 30 minutes
    sessionKey: 'directLinkAdTriggered'
  },
  popunder: {
    scriptSrc: '//uncertainbill.com/ae/f7/eb/aef7eba12c46ca91518228f813db6ce5.js',
    cooldownMinutes: 60, // Only trigger once every hour
    sessionKey: 'popunderAdTriggered',
    delaySeconds: 5 // Wait 5 seconds after page load
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

// Helper to get appropriate ad dimensions based on device type
export const getAdDimensions = (type: 'banner', isMobile: boolean) => {
  if (type === 'banner') {
    return isMobile ? adConfig.banner.mobile : adConfig.banner.desktop;
  }
  return { width: 300, height: 250 }; // Default
};
