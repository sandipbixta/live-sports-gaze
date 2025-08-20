// Analytics utilities for traffic tracking and optimization

export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

class Analytics {
  private isProduction = window.location.hostname !== 'localhost';

  // Track custom events
  track(event: AnalyticsEvent) {
    if (!this.isProduction) {
      console.log('Analytics Event:', event);
      return;
    }

    // Google Analytics 4
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
      });
    }
  }

  // Track page views
  trackPageView(path: string, title?: string) {
    if (!this.isProduction) {
      console.log('Page View:', { path, title });
      return;
    }

    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', 'G-012D2PN0S2', {
        page_path: path,
        page_title: title,
      });
    }
  }

  // Track match engagement
  trackMatchEngagement(action: 'view' | 'play' | 'share' | 'source_change', matchTitle: string, data?: any) {
    this.track({
      action,
      category: 'Match Engagement',
      label: matchTitle,
      value: data?.duration || 1
    });
  }

  // Track user behavior
  trackUserBehavior(action: string, data?: any) {
    this.track({
      action,
      category: 'User Behavior',
      label: data?.source || 'unknown',
      value: data?.value || 1
    });
  }

  // Track search queries
  trackSearch(query: string, resultsCount: number) {
    this.track({
      action: 'search',
      category: 'Search',
      label: query,
      value: resultsCount
    });
  }

  // Track social sharing
  trackSocialShare(platform: string, content: string) {
    this.track({
      action: 'share',
      category: 'Social',
      label: `${platform}:${content}`,
    });
  }

  // Track performance metrics
  trackPerformance() {
    if (!this.isProduction || !window.performance) return;

    // Track page load time
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.fetchStart;
          this.track({
            action: 'page_load_time',
            category: 'Performance',
            value: Math.round(loadTime)
          });
        }
      }, 1000);
    });
  }

  // Track errors
  trackError(error: Error, context?: string) {
    this.track({
      action: 'error',
      category: 'Error',
      label: `${context || 'unknown'}: ${error.message}`,
    });
  }
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const analytics = new Analytics();

// Auto-track performance on import
analytics.trackPerformance();