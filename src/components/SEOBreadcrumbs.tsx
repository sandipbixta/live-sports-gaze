import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface Breadcrumb {
  name: string;
  url: string;
}

interface SEOBreadcrumbsProps {
  breadcrumbs: Breadcrumb[];
  className?: string;
}

const SEOBreadcrumbs: React.FC<SEOBreadcrumbsProps> = ({
  breadcrumbs,
  className = ""
}) => {
  const allCrumbs = [
    { name: 'Home', url: '/' },
    ...breadcrumbs
  ];

  // Generate JSON-LD structured data for breadcrumbs
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": allCrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": {
        "@type": "WebPage",
        "@id": `https://damitv.pro${crumb.url}`
      }
    }))
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbStructuredData)}
      </script>
      
      {/* Visible breadcrumb navigation */}
      <nav 
        className={`flex items-center space-x-1 text-sm text-muted-foreground mb-4 ${className}`}
        aria-label="Breadcrumb navigation"
      >
        <ol className="flex items-center space-x-1" itemScope itemType="https://schema.org/BreadcrumbList">
          {allCrumbs.map((crumb, index) => (
            <li 
              key={index}
              className="flex items-center"
              itemProp="itemListElement" 
              itemScope 
              itemType="https://schema.org/ListItem"
            >
              <meta itemProp="position" content={String(index + 1)} />
              
              {index === 0 ? (
                <Link 
                  to={crumb.url}
                  className="flex items-center hover:text-primary transition-colors"
                  itemProp="item"
                  aria-label="Home page"
                >
                  <Home className="w-4 h-4" />
                  <span className="sr-only" itemProp="name">Home</span>
                </Link>
              ) : index === allCrumbs.length - 1 ? (
                <span 
                  className="text-foreground font-medium"
                  itemProp="name"
                  aria-current="page"
                >
                  {crumb.name}
                </span>
              ) : (
                <Link 
                  to={crumb.url}
                  className="hover:text-primary transition-colors"
                  itemProp="item"
                >
                  <span itemProp="name">{crumb.name}</span>
                </Link>
              )}
              
              {index < allCrumbs.length - 1 && (
                <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground" />
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default SEOBreadcrumbs;