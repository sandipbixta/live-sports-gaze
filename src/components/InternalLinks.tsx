import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface InternalLink {
  text: string;
  url: string;
  description?: string;
}

interface InternalLinksProps {
  links: InternalLink[];
  title?: string;
  className?: string;
}

/**
 * SEO-optimized internal linking component
 * Helps with site navigation and passes link equity between pages
 */
const InternalLinks: React.FC<InternalLinksProps> = ({ 
  links, 
  title = "Related Pages",
  className = ""
}) => {
  if (links.length === 0) return null;

  return (
    <section className={`my-8 ${className}`}>
      <h2 className="text-2xl font-bold text-foreground mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {links.map((link, index) => (
          <Link key={index} to={link.url} className="group">
            <Card className="h-full transition-all hover:border-primary hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center justify-between">
                  {link.text}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </CardTitle>
                {link.description && (
                  <CardDescription>{link.description}</CardDescription>
                )}
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default InternalLinks;
