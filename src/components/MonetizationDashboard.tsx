import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { analytics } from '@/utils/analytics';

interface MetricData {
  pageViews: number;
  adImpressions: number;
  adClicks: number;
  avgEngagement: number;
  topPages: { path: string; views: number }[];
  revenueEstimate: number;
}

const MonetizationDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricData>({
    pageViews: 0,
    adImpressions: 0,
    adClicks: 0,
    avgEngagement: 0,
    topPages: [],
    revenueEstimate: 0
  });

  useEffect(() => {
    // Simulate fetching analytics data (replace with real GA4 API calls)
    const fetchMetrics = () => {
      // In a real implementation, you'd fetch from Google Analytics API
      // For now, we'll use localStorage to track basic metrics
      const storedViews = parseInt(localStorage.getItem('total_page_views') || '0');
      const storedClicks = parseInt(localStorage.getItem('total_ad_clicks') || '0');
      const storedImpressions = parseInt(localStorage.getItem('total_ad_impressions') || '0');
      
      setMetrics({
        pageViews: storedViews,
        adImpressions: storedImpressions,
        adClicks: storedClicks,
        avgEngagement: 45, // seconds
        topPages: [
          { path: '/live', views: Math.floor(storedViews * 0.3) },
          { path: '/match/*', views: Math.floor(storedViews * 0.25) },
          { path: '/', views: Math.floor(storedViews * 0.2) },
          { path: '/channels', views: Math.floor(storedViews * 0.15) },
          { path: '/schedule', views: Math.floor(storedViews * 0.1) }
        ],
        revenueEstimate: (storedClicks * 0.25) + (storedImpressions * 0.003) // Rough RPM calculation
      });
    };

    fetchMetrics();
    
    // Update metrics every minute
    const interval = setInterval(fetchMetrics, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Track dashboard view
  useEffect(() => {
    analytics.track({
      action: 'monetization_dashboard_view',
      category: 'Admin',
      label: 'revenue_tracking'
    });
  }, []);

  const ctr = metrics.adImpressions > 0 ? ((metrics.adClicks / metrics.adImpressions) * 100).toFixed(2) : '0.00';
  const rpm = metrics.pageViews > 0 ? ((metrics.revenueEstimate / metrics.pageViews) * 1000).toFixed(2) : '0.00';

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Page Views</CardTitle>
          <Badge variant="secondary">24h</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.pageViews.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Avg engagement: {metrics.avgEngagement}s
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ad Revenue</CardTitle>
          <Badge variant="secondary">${rpm} RPM</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${metrics.revenueEstimate.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.adClicks} clicks • {ctr}% CTR
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ad Performance</CardTitle>
          <Badge variant="secondary">{ctr}% CTR</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.adImpressions.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Impressions • {metrics.adClicks} clicks
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Content</CardTitle>
          <Badge variant="secondary">Revenue</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {metrics.topPages.slice(0, 3).map((page, index) => (
              <div key={page.path} className="flex justify-between text-sm">
                <span className="truncate">{page.path}</span>
                <span className="font-medium">{page.views}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonetizationDashboard;