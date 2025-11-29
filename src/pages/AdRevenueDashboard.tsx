import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Eye, MousePointer, TrendingUp } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

interface AdStats {
  ad_type: string;
  impressions: number;
  clicks: number;
  ctr: number;
  estimated_revenue: number;
}

export default function AdRevenueDashboard() {
  const [stats, setStats] = useState<AdStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const daysAgo = timeRange === '7d' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data, error } = await supabase.rpc('get_ad_stats', {
        start_date: startDate.toISOString(),
        end_date: new Date().toISOString()
      });

      if (error) throw error;
      setStats(data || []);
    } catch (error) {
      console.error('Error fetching ad stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const totalRevenue = stats.reduce((sum, stat) => sum + Number(stat.estimated_revenue), 0);
  const totalImpressions = stats.reduce((sum, stat) => sum + Number(stat.impressions), 0);
  const totalClicks = stats.reduce((sum, stat) => sum + Number(stat.clicks), 0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">💰 Ad Revenue Dashboard</h1>
          <p className="text-muted-foreground">Track your ad performance and earnings in real-time</p>
        </div>

        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as '7d' | '30d')} className="mb-6">
          <TabsList>
            <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
            <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Estimated Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Based on CPM rates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Ad views</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Ad clicks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgCTR}%</div>
              <p className="text-xs text-muted-foreground">Click-through rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats by Ad Type */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Ad Type</CardTitle>
            <CardDescription>Breakdown of each ad unit's performance</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading stats...</div>
            ) : stats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No data yet. Ads will start tracking soon!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Ad Type</th>
                      <th className="text-right py-3 px-4">Impressions</th>
                      <th className="text-right py-3 px-4">Clicks</th>
                      <th className="text-right py-3 px-4">CTR</th>
                      <th className="text-right py-3 px-4">Est. Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((stat) => (
                      <tr key={stat.ad_type} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium capitalize">{stat.ad_type}</td>
                        <td className="text-right py-3 px-4">{Number(stat.impressions).toLocaleString()}</td>
                        <td className="text-right py-3 px-4">{Number(stat.clicks).toLocaleString()}</td>
                        <td className="text-right py-3 px-4">{Number(stat.ctr).toFixed(2)}%</td>
                        <td className="text-right py-3 px-4 font-bold text-green-600">
                          ${Number(stat.estimated_revenue).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h3 className="font-semibold mb-2">📊 How Revenue is Calculated</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Popunder:</strong> $3 CPM (per 1,000 impressions)</li>
            <li>• <strong>Interstitial:</strong> $4 CPM (highest earning)</li>
            <li>• <strong>Native Ads:</strong> $1.50 CPM</li>
            <li>• <strong>Social Bar:</strong> $1 CPM</li>
            <li>• Actual earnings may vary based on traffic quality and geo-location</li>
          </ul>
        </div>
      </div>
    </PageLayout>
  );
}
