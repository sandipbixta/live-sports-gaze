import GoogleAdSense from './GoogleAdSense';
import { Card } from '@/components/ui/card';

interface BlogAdUnitProps {
  position: 'top' | 'middle' | 'bottom' | 'sidebar';
}

const BlogAdUnit = ({ position }: BlogAdUnitProps) => {
  // Different ad slots for different positions
  const adSlots = {
    top: '1234567890', // Replace with your actual ad slot IDs
    middle: '1234567891',
    bottom: '1234567892',
    sidebar: '1234567893'
  };

  const adConfigs = {
    top: {
      format: 'horizontal' as const,
      className: 'mb-8',
      style: { minHeight: '90px' }
    },
    middle: {
      format: 'rectangle' as const,
      className: 'my-8',
      style: { minHeight: '250px' }
    },
    bottom: {
      format: 'horizontal' as const,
      className: 'mt-8',
      style: { minHeight: '90px' }
    },
    sidebar: {
      format: 'vertical' as const,
      className: '',
      style: { minHeight: '600px' }
    }
  };

  const config = adConfigs[position];

  return (
    <Card className={`p-4 bg-muted/30 border-dashed ${config.className}`}>
      <div className="text-xs text-muted-foreground text-center mb-2">
        Advertisement
      </div>
      <GoogleAdSense
        adSlot={adSlots[position]}
        adFormat={config.format}
        style={config.style}
      />
    </Card>
  );
};

export default BlogAdUnit;