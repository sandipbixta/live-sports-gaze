import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Users, TrendingUp, Radio } from 'lucide-react';

interface AnalyticsStats {
  totalViews: number;
  uniqueSessions: number;
  liveViewers: number;
  topPages: Array<{ page_path: string; views: number }>;
}

const AnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsStats>({
    totalViews: 0,
    uniqueSessions: 0,
    liveViewers: 0,
    topPages: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchLiveViewers();
    
    // Update live viewers every 10 seconds
    const interval = setInterval(fetchLiveViewers, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveViewers = async () => {
    try {
      const { count } = await supabase
        .from('viewer_sessions')
        .select('*', { count: 'exact', head: true })
        .gt('last_heartbeat', new Date(Date.now() - 30000).toISOString());
      
      setStats(prev => ({ ...prev, liveViewers: count || 0 }));
    } catch (error) {
      console.error('Error fetching live viewers:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Get total views
      const { data: totalData } = await supabase.rpc('get_total_page_views');
      
      // Get stats for last 30 days
      const { data: statsData } = await supabase.rpc('get_page_views_stats');
      
      if (statsData && statsData.length > 0) {
        const stats = statsData[0];
        const topPages = Array.isArray(stats.top_pages) 
          ? stats.top_pages as Array<{ page_path: string; views: number }>
          : [];
        
        setStats(prev => ({
          ...prev,
          totalViews: Number(totalData || 0),
          uniqueSessions: Number(stats.unique_sessions || 0),
          topPages
        }));
      } else {
        setStats(prev => ({
          ...prev,
          totalViews: Number(totalData || 0),
          uniqueSessions: 0,
          topPages: []
        }));
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-20 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-full">
              <Radio className="h-6 w-6 text-green-500 animate-pulse" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Live Viewers</p>
              <p className="text-2xl font-bold">{stats.liveViewers.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Views</p>
              <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unique Sessions (30d)</p>
              <p className="text-2xl font-bold">{stats.uniqueSessions.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Views/Session</p>
              <p className="text-2xl font-bold">
                {stats.uniqueSessions > 0 
                  ? (stats.totalViews / stats.uniqueSessions).toFixed(1)
                  : '0'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {stats.topPages.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Pages (Last 30 Days)</h3>
          <div className="space-y-3">
            {stats.topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium truncate flex-1">{page.page_path}</span>
                <span className="text-sm text-muted-foreground ml-2">{page.views} views</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
