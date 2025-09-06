import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SocialMediaGenerator from './SocialMediaGenerator';
import BlogContentGenerator, { type BlogPost } from '@/utils/blogContentGenerator';
import { matchSEO, type MatchSEOData } from '@/utils/matchSEO';
import { Search, FileText, Share2, TrendingUp } from 'lucide-react';

const SEODashboard: React.FC = () => {
  const [matchData, setMatchData] = useState<MatchSEOData>({
    homeTeam: '',
    awayTeam: '',
    league: '',
    date: '',
    time: ''
  });

  const [generatedBlog, setGeneratedBlog] = useState<BlogPost | null>(null);

  const handleGenerateBlog = () => {
    if (matchData.homeTeam && matchData.awayTeam) {
      const blog = BlogContentGenerator.generateMatchPreview(matchData);
      setGeneratedBlog(blog);
    }
  };

  const quickMatchTemplates = [
    { homeTeam: 'Real Madrid', awayTeam: 'Barcelona', league: 'La Liga', date: '2025-01-15', time: '20:00' },
    { homeTeam: 'Liverpool', awayTeam: 'Manchester City', league: 'Premier League', date: '2025-01-16', time: '17:30' },
    { homeTeam: 'Bayern Munich', awayTeam: 'Borussia Dortmund', league: 'Bundesliga', date: '2025-01-17', time: '18:30' }
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SEO Content Generator</h1>
        <p className="text-muted-foreground">Generate complete SEO-ready content for all matches and pages</p>
      </div>

      <Tabs defaultValue="match-seo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="match-seo">Match SEO</TabsTrigger>
          <TabsTrigger value="social-media">Social Media</TabsTrigger>
          <TabsTrigger value="blog-content">Blog Content</TabsTrigger>
          <TabsTrigger value="templates">Quick Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="match-seo">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Match SEO Generator
              </CardTitle>
              <CardDescription>
                Generate complete SEO content for any match
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Home Team"
                  value={matchData.homeTeam}
                  onChange={(e) => setMatchData({...matchData, homeTeam: e.target.value})}
                />
                <Input
                  placeholder="Away Team"
                  value={matchData.awayTeam}
                  onChange={(e) => setMatchData({...matchData, awayTeam: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="League"
                  value={matchData.league}
                  onChange={(e) => setMatchData({...matchData, league: e.target.value})}
                />
                <Input
                  type="date"
                  value={matchData.date}
                  onChange={(e) => setMatchData({...matchData, date: e.target.value})}
                />
                <Input
                  type="time"
                  value={matchData.time}
                  onChange={(e) => setMatchData({...matchData, time: e.target.value})}
                />
              </div>
              
              {matchData.homeTeam && matchData.awayTeam && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-semibold">Generated SEO Content:</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Title:</strong> {matchSEO.generateTitle(matchData)}</p>
                    <p><strong>Meta Description:</strong> {matchSEO.generateMetaDescription(matchData)}</p>
                    <p><strong>Keywords:</strong> {matchSEO.generateKeywords(matchData, true).substring(0, 200)}...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social-media">
          <SocialMediaGenerator matchInfo={matchData.homeTeam ? matchData : undefined} />
        </TabsContent>

        <TabsContent value="blog-content">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Blog Content Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleGenerateBlog} disabled={!matchData.homeTeam || !matchData.awayTeam}>
                Generate Blog Post
              </Button>
              
              {generatedBlog && (
                <div className="mt-4 p-4 border rounded-lg space-y-2">
                  <h3 className="font-semibold">{generatedBlog.title}</h3>
                  <p className="text-sm text-muted-foreground">{generatedBlog.metaDescription}</p>
                  <div className="max-h-64 overflow-y-auto">
                    <pre className="text-xs whitespace-pre-wrap">{generatedBlog.content.substring(0, 1000)}...</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Quick Match Templates</CardTitle>
              <CardDescription>Use these popular match templates for instant SEO content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {quickMatchTemplates.map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => setMatchData(template)}
                    className="justify-start h-auto p-4"
                  >
                    <div>
                      <div className="font-semibold">{template.homeTeam} vs {template.awayTeam}</div>
                      <div className="text-sm text-muted-foreground">{template.league} • {template.date}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SEODashboard;