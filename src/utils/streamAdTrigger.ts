import { adConfig, isAdCooldownPassed, markAdTriggered } from './adConfig';
import { adTracking } from './adTracking';

/**
 * Randomly selects a Smartlink from the rotation pool (50/50)
 */
const selectSmartlink = (): string => {
  const urls = adConfig.directLink.urls;
  const randomIndex = Math.floor(Math.random() * urls.length);
  return urls[randomIndex];
};

/**
 * Triggers smartlink ad when changing streams
 * Respects cooldown period to prevent spam
 * Uses 50/50 rotation between Adsterra and Monetag
 */
export const triggerStreamChangeAd = (): void => {
  // Check if cooldown period has passed
  if (!isAdCooldownPassed(adConfig.directLink.sessionKey, adConfig.directLink.cooldownMinutes)) {
    console.log('⏳ Stream change ad on cooldown');
    return;
  }

  // Select a smartlink from the rotation pool
  const selectedUrl = selectSmartlink();
  const provider = selectedUrl.includes('foreseehawancesator') ? 'Adsterra' : 'Monetag';

  // Mark as triggered and open the smartlink ad
  markAdTriggered(adConfig.directLink.sessionKey);
  adTracking.trackStreamChangeAd();
  window.open(selectedUrl, "_blank", "noopener noreferrer");
  console.log(`🎯 Stream change ad triggered! (${provider})`);
};
