
// Ad configuration utility
export const adConfig = {
  rectangle: {
    key: '7c589340b2a1155dcea92f44cc468438',
    scriptSrc: '//uncertainbill.com/7c589340b2a1155dcea92f44cc468438/invoke.js',
    width: 300,
    height: 250
  },
  directLink: {
    url: 'https://temperweekly.com/zbt0wegpe?key=39548340a9430381e48a2856c8cf8d37',
    cooldownMinutes: 5,
    sessionKey: 'directLinkAdTriggered'
  },
  popunder: {
    scriptSrc: '//temperweekly.com/ae/f7/eb/aef7eba12c46ca91518228f813db6ce5.js',
    cooldownMinutes: 5,
    sessionKey: 'popunderAdTriggered',
    delaySeconds: 3
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
