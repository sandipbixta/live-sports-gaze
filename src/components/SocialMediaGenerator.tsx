import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Share2, MessageCircle, Clock } from 'lucide-react';
import { matchSEO, type MatchSEOData } from '@/utils/matchSEO';
import { toast } from 'sonner';

interface SocialMediaGeneratorProps {
  matchInfo?: MatchSEOData;
  leagueName?: string;
  autoGenerate?: boolean;
}

const SocialMediaGenerator: React.FC<SocialMediaGeneratorProps> = ({
  matchInfo,
  leagueName,
  autoGenerate = false
}) => {
  const [copiedContent, setCopiedContent] = useState<string>('');

  const generateContent = () => {
    if (matchInfo) {
      return matchSEO.generateSocialContent(matchInfo);
    }
    
    // Default league content
    const defaultContent = {
      facebook: [
        `⚽ ${leagueName || 'Live Football'} TODAY!\nWatch all matches FREE on DAMITV.pro\nNo signup needed! 📱💻\n#LiveFootball #FreeStreaming #DAMITV`,
        `🚨 ${leagueName || 'Football'} Schedule Updated!\n📺 HD Quality Streams\n🔗 DAMITV.pro\nJoin thousands of fans! 👥\n#${leagueName?.replace(/\s+/g, '') || 'Football'}`,
        `🔥 Best ${leagueName || 'Football'} Streaming Site\n📱 Mobile Friendly\n⚡ Zero Buffering\n🆓 Completely Free\nDAMITV.pro 🏆`
      ],
      twitter: [
        `⚽ ${leagueName || 'Live Football'} streaming FREE\n📱 Watch now: DAMITV.pro\n#${leagueName?.replace(/\s+/g, '') || 'Football'} #FreeStreaming`,
        `🔥 ${leagueName || 'Football'} LIVE\n📺 HD Quality guaranteed\n🔗 DAMITV.pro\n#LiveFootball`,
        `🚨 Best ${leagueName || 'Football'} streaming site\n✅ No registration\n✅ Mobile optimized\n🔗 DAMITV.pro`
      ],
      telegram: [
        `⚽ ${leagueName || 'Live Football'} FREE STREAMING\n🔥 HD Quality\n📲 DAMITV.pro - No ads, no signup!\nJoin 50K+ fans! 🏆`,
        `🚨 ${leagueName || 'Football'} LIVE!\n📱 Mobile & Desktop Ready\n🔥 Zero Buffering\n🔗 DAMITV.pro\nBest streaming experience! 📺`,
        `🏆 ${leagueName || 'Football'} Central Hub\n⚽ All matches live\n📱 Perfect mobile streaming\n🔗 DAMITV.pro\nFree forever! 🎯`
      ]
    };
    
    return defaultContent;
  };

  const socialContent = generateContent();

  const copyToClipboard = async (content: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedContent(content);
      toast.success(`${platform} content copied to clipboard!`);
      
      // Reset copied state after 3 seconds
      setTimeout(() => setCopiedContent(''), 3000);
    } catch (err) {
      toast.error('Failed to copy content');
    }
  };

  const shareContent = async (content: string, platform: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${platform} Content - DAMITV`,
          text: content
        });
      } catch (err) {
        // Fallback to copy
        copyToClipboard(content, platform);
      }
    } else {
      copyToClipboard(content, platform);
    }
  };

  const getBestPostingTimes = () => {
    return {
      facebook: ['09:00 GMT', '13:00 GMT', '15:00 GMT', '20:00 GMT'],
      twitter: ['08:00 GMT', '12:00 GMT', '17:00 GMT', '19:00 GMT'],
      telegram: ['10:00 GMT', '14:00 GMT', '18:00 GMT', '21:00 GMT']
    };
  };

  const postingTimes = getBestPostingTimes();

  const SocialPlatformCard = ({ 
    platform, 
    contents, 
    icon, 
    color, 
    times 
  }: { 
    platform: string; 
    contents: string[]; 
    icon: React.ReactNode; 
    color: string;
    times: string[];
  }) => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          <span className="capitalize">{platform}</span>
          <Badge variant="outline" className={color}>
            {contents.length} posts
          </Badge>
        </CardTitle>
        <CardDescription>
          Best posting times: {times.join(', ')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {contents.map((content, index) => (
          <div key={index} className="p-3 border rounded-lg bg-muted/50">
            <div className="flex items-start justify-between gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                Post #{index + 1}
              </Badge>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(content, platform)}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => shareContent(content, platform)}
                  className="h-6 w-6 p-0"
                >
                  <Share2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <p className="text-sm whitespace-pre-wrap font-mono bg-background p-2 rounded border">
              {content}
            </p>
            {copiedContent === content && (
              <p className="text-xs text-green-600 mt-1">✅ Copied!</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );

  if (!autoGenerate && !matchInfo && !leagueName) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Provide match info or league name to generate social media content
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Social Media Content Generator</h2>
        <p className="text-muted-foreground">
          Ready-to-post content for Facebook, Twitter, and Telegram
        </p>
        {matchInfo && (
          <Badge variant="outline" className="text-sm">
            {matchInfo.homeTeam} vs {matchInfo.awayTeam} - {matchInfo.league}
          </Badge>
        )}
      </div>

      {/* Posting Schedule Tip */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Clock className="h-4 w-4" />
            Optimal Posting Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700">
          <p className="mb-2">📅 <strong>Match Day Strategy:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Pre-match: 2 hours before kickoff</li>
            <li>Live updates: Every 15-30 minutes during match</li>
            <li>Post-match: Within 1 hour of final whistle</li>
          </ul>
        </CardContent>
      </Card>

      {/* Social Platform Cards */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <SocialPlatformCard
          platform="facebook"
          contents={socialContent.facebook}
          icon={<Share2 className="h-4 w-4 text-blue-600" />}
          color="border-blue-600 text-blue-600"
          times={postingTimes.facebook}
        />
        
        <SocialPlatformCard
          platform="twitter"
          contents={socialContent.twitter}
          icon={<MessageCircle className="h-4 w-4 text-sky-500" />}
          color="border-sky-500 text-sky-500"
          times={postingTimes.twitter}
        />
        
        <SocialPlatformCard
          platform="telegram"
          contents={socialContent.telegram}
          icon={<Share2 className="h-4 w-4 text-blue-500" />}
          color="border-blue-500 text-blue-500"
          times={postingTimes.telegram}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center pt-4">
        <Button 
          onClick={() => {
            const allContent = [
              '=== FACEBOOK ===',
              ...socialContent.facebook,
              '',
              '=== TWITTER ===', 
              ...socialContent.twitter,
              '',
              '=== TELEGRAM ===',
              ...socialContent.telegram
            ].join('\n');
            
            copyToClipboard(allContent, 'All Platforms');
          }}
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy All Content
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => window.open('/social-scheduler', '_blank')}
        >
          Schedule Posts
        </Button>
      </div>
    </div>
  );
};

export default SocialMediaGenerator;