
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
  }
};

// Helper to determine if ads should be shown
export const shouldShowAds = () => {
  // You can add logic here based on user preferences or other factors
  // For now, we'll always return true
  return true;
};

// Helper to get appropriate ad dimensions based on device type
export const getAdDimensions = (type: 'banner', isMobile: boolean) => {
  if (type === 'banner') {
    return isMobile ? adConfig.banner.mobile : adConfig.banner.desktop;
  }
  return { width: 300, height: 250 }; // Default
};
