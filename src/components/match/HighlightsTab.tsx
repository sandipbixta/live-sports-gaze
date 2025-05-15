
import { Film } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const HighlightsTab = () => {
  return (
    <Card className="bg-sports-card border-sports">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-6 text-center text-white">Match Highlights</h3>
        <div className="text-center py-8">
          <Film className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Highlights will be available after the match</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HighlightsTab;
