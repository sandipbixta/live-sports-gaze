import { adConfig, isAdCooldownPassed, markAdTriggered } from './adConfig';

/**
 * Triggers smartlink ad when changing streams
 * Respects cooldown period to prevent spam
 */
export const triggerStreamChangeAd = (): void => {
  // Check if cooldown period has passed
  if (!isAdCooldownPassed(adConfig.directLink.sessionKey, adConfig.directLink.cooldownMinutes)) {
    console.log('⏳ Stream change ad on cooldown');
    return;
  }

  // Mark as triggered and open the smartlink ad
  markAdTriggered(adConfig.directLink.sessionKey);
  window.open(adConfig.directLink.url, "_blank", "noopener noreferrer");
  console.log('🎯 Stream change ad triggered!');
};
