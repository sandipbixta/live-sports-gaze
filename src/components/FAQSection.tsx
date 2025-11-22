import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
  title?: string;
  className?: string;
}

/**
 * SEO-optimized FAQ section component with accordion UI
 * Generates FAQ schema for search engines
 */
const FAQSection: React.FC<FAQSectionProps> = ({ 
  faqs, 
  title = "Frequently Asked Questions",
  className = ""
}) => {
  if (faqs.length === 0) return null;

  return (
    <section className={`my-12 ${className}`}>
      <h2 className="text-3xl font-bold text-foreground mb-6">{title}</h2>
      <Accordion type="single" collapsible className="w-full space-y-2">
        {faqs.map((faq, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index}`}
            className="border border-border rounded-lg px-6"
          >
            <AccordionTrigger className="text-left hover:no-underline py-4">
              <h3 className="text-lg font-semibold text-foreground">
                {faq.question}
              </h3>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-4">
              <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default FAQSection;
