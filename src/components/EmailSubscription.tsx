import React, { useState } from 'react';
import { Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EmailSubscriptionProps {
  compact?: boolean;
}

const EmailSubscription: React.FC<EmailSubscriptionProps> = ({ compact = false }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const { toast } = useToast();

  const popularTeams = [
    'Manchester United', 'Liverpool', 'Arsenal', 'Chelsea', 'Manchester City',
    'Real Madrid', 'Barcelona', 'Bayern Munich', 'Paris Saint-Germain'
  ];

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('email_subscriptions')
        .insert({
          email,
          subscribed_teams: selectedTeams,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Already subscribed',
            description: 'This email is already subscribed to match alerts.',
          });
        } else {
          throw error;
        }
      } else {
        setSubscribed(true);
        toast({
          title: 'Successfully subscribed!',
          description: 'You\'ll receive match alerts for your selected teams.',
        });
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: 'Error',
        description: 'Failed to subscribe. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTeam = (team: string) => {
    setSelectedTeams(prev =>
      prev.includes(team)
        ? prev.filter(t => t !== team)
        : [...prev, team]
    );
  };

  if (subscribed) {
    return (
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <Check className="h-12 w-12 text-primary mx-auto mb-3" />
          <h3 className="text-xl font-semibold mb-2">You're all set!</h3>
          <p className="text-muted-foreground">
            Check your email for a confirmation link.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
        />
        <Button
          onClick={handleSubscribe}
          disabled={loading}
          className="bg-primary hover:bg-primary/90"
        >
          <Mail className="h-4 w-4 mr-2" />
          Subscribe
        </Button>
      </div>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="h-6 w-6 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Never Miss a Match</h3>
            <p className="text-sm text-muted-foreground">
              Get match alerts delivered to your inbox
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">
              Select your favorite teams (optional):
            </Label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {popularTeams.map((team) => (
                <div key={team} className="flex items-center space-x-2">
                  <Checkbox
                    id={team}
                    checked={selectedTeams.includes(team)}
                    onCheckedChange={() => toggleTeam(team)}
                  />
                  <Label
                    htmlFor={team}
                    className="text-sm cursor-pointer"
                  >
                    {team}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {loading ? 'Subscribing...' : 'Subscribe to Match Alerts'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By subscribing, you agree to receive match notifications. 
            Unsubscribe anytime.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailSubscription;
