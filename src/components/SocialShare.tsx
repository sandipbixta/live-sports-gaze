import React, { useState } from 'react';
import { Share2, Copy, Check, Twitter, Facebook, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface SocialShareProps {
  title: string;
  url?: string;
  description?: string;
  image?: string;
  className?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ 
  title, 
  url = window.location.href, 
  description = "Watch live sports streaming on DamiTV", 
  image,
  className = "" 
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Generate share URL based on current path
  const generateShareUrl = () => {
    const currentPath = window.location.pathname;
    const baseUrl = window.location.origin;
    
    // Extract content type and ID from current URL
    if (currentPath.includes('/match/')) {
      const parts = currentPath.split('/');
      if (parts.length >= 4) {
        const sportId = parts[2];
        const matchId = parts[3];
        return `${baseUrl}/share/match/${sportId}-${matchId}`;
      }
    } else if (currentPath.includes('/manual-match/')) {
      const parts = currentPath.split('/');
      if (parts.length >= 3) {
        const matchId = parts[2];
        return `${baseUrl}/share/manual-match/${matchId}`;
      }
    } else if (currentPath.includes('/channel/')) {
      const parts = currentPath.split('/');
      if (parts.length >= 4) {
        const country = parts[2];
        const channelId = parts[3];
        return `${baseUrl}/share/channel/${country}-${channelId}`;
      }
    }
    
    // Fallback to current URL if no special share format is needed
    return url;
  };

  const shareUrl = generateShareUrl();

  const shareData = {
    title,
    text: description,
    url: shareUrl
  };

  const handleNativeShare = async () => {
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully!",
          description: "Thanks for sharing DamiTV with others!",
        });
      } catch (error) {
        console.log('Share canceled or failed');
      }
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please try again or copy the URL manually.",
        variant: "destructive",
      });
    }
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}&hashtags=DamiTV,LiveSports,Football`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(title)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} - ${description} ${shareUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareToTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`;
    window.open(telegramUrl, '_blank');
  };

  // Check if native sharing is available
  const hasNativeShare = navigator.share && navigator.canShare && navigator.canShare(shareData);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`bg-[#242836] border-[#343a4d] text-white hover:bg-[#343a4d] ${className}`}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-[#1A1F2C] border-[#343a4d]">
        <div className="space-y-4">
          <h4 className="font-medium text-white">Share this match</h4>
          
          {/* Native share button (mobile) */}
          {hasNativeShare && (
            <Button 
              onClick={handleNativeShare}
              className="w-full bg-[#242836] border-[#343a4d] text-white hover:bg-[#343a4d]"
              variant="outline"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share via...
            </Button>
          )}
          
          {/* Social media buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={shareToTwitter}
              className="bg-[#1DA1F2] hover:bg-[#1a91da] text-white"
            >
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </Button>
            
            <Button 
              onClick={shareToFacebook}
              className="bg-[#4267B2] hover:bg-[#365899] text-white"
            >
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            
            <Button 
              onClick={shareToWhatsApp}
              className="bg-[#25D366] hover:bg-[#22c55e] text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            
            <Button 
              onClick={shareToTelegram}
              className="bg-[#0088cc] hover:bg-[#0077b5] text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Telegram
            </Button>
          </div>
          
          {/* Copy link button */}
          <Button 
            onClick={copyToClipboard}
            className="w-full bg-[#242836] border-[#343a4d] text-white hover:bg-[#343a4d]"
            variant="outline"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SocialShare;