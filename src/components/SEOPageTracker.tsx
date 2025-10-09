import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/utils/analytics';
import RevenueOptimizer from './RevenueOptimizer';

interface SEOPageTrackerProps {
  children: React.ReactNode;
  pageTitle?: string;
  contentType?: 'match' | 'live' | 'channels' | 'schedule' | 'news' | 'home' | 'blog' | 'admin';
}

const SEOPageTracker: React.FC<SEOPageTrackerProps> = ({ 
  children, 
  pageTitle,
  contentType = 'home'
}) => {
  const location = useLocation();

  useEffect(() => {
    // Track page view with enhanced data
    analytics.trackPageView(location.pathname, pageTitle);
    
    // Track content type for better segmentation
    analytics.track({
      action: 'content_view',
      category: 'Content',
      label: contentType,
      custom_parameters: {
        page_path: location.pathname,
        page_title: pageTitle || document.title,
        referrer: document.referrer,
        user_agent: navigator.userAgent.substring(0, 100)
      }
    });

    // Track high-value pages for monetization
    if (['match', 'live'].includes(contentType)) {
      analytics.track({
        action: 'high_value_page_view',
        category: 'Revenue Opportunity',
        label: contentType,
        value: contentType === 'match' ? 10 : 8, // Assign values for optimization
        custom_parameters: {
          monetization_priority: 'high',
          ad_targeting: contentType
        }
      });
    }

    // Enhanced organic traffic tracking
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    
    if (utmSource || document.referrer.includes('google.com')) {
      analytics.track({
        action: 'organic_traffic',
        category: 'SEO Performance',
        label: utmSource || 'google_organic',
        custom_parameters: {
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          landing_page: location.pathname,
          search_keywords: urlParams.get('q') || 'unknown'
        }
      });
    }

  }, [location.pathname, pageTitle, contentType]);

  return (
    <>
      <RevenueOptimizer pagePath={location.pathname} contentType={contentType} />
      {children}
    </>
  );
};

export default SEOPageTracker;