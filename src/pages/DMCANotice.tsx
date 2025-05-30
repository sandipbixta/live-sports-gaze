
import React from 'react';
import PageLayout from '../components/PageLayout';

const DMCANotice = () => {
  return (
    <PageLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-6">DMCA NOTICE – NOTICE OF ALLEGED ILLEGAL CONTENT</h1>
        
        <div className="bg-white dark:bg-black rounded-xl p-6 border border-black dark:border-white text-black dark:text-white space-y-6 mb-8">
          <p>
            DamiTV.pro is an Internet Service Provider offering a platform that merely displays links to audiovisual content located on servers of third parties and provided and/or transmitted by third parties. DamiTV.pro does not host nor transmit any audiovisual content itself and does not control nor influence such content. DamiTV.pro cannot accept any liability for the content transmitted by others. Any responsibility for this content lies with those who host or transmit it.
          </p>
          
          <p>
            Of course, DamiTV.pro is concerned about allegations that illegal content is made available on the websites to which hyperlinks on its website direct. Although DamiTV.pro cannot actively monitor the content which is transmitted via third-party websites, it is willing to take action in removing links to illegal content upon obtaining proper notice thereof. DamiTV.pro will remove links to illegal content from its website expeditiously; however, it cannot prevent that links are replaced by visitors of its website. To prevent a link from being replaced again after being removed by DamiTV.pro, we advise you to contact the owner of the website where the content originates from.
          </p>
          
          <p>
            If you have discovered or will discover in the future any links to illegal content, a notice can be submitted to the e-mail or physical address listed below. The notice must contain at least the following information:
          </p>
        </div>
        
        <div className="bg-white dark:bg-black rounded-xl p-6 border border-black dark:border-white text-black dark:text-white space-y-6 mb-8">
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white mb-2">1. Identity of the content</h2>
            <p>That you claim to be illegal and the grounds for the illegality. Examples include:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Offensive, slanderous, or abusive language</li>
              <li>Unlawful publications</li>
              <li>Infringement of privacy or moral rights</li>
              <li>Misleading or unlawful advertising</li>
              <li>Infringement of intellectual property rights</li>
              <li>Transmission of trade secrets, know-how, or otherwise secret information</li>
              <li>Sexual or child-abusive content or otherwise illegal material</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white mb-2">2. Identification of the location</h2>
            <p>Of the content that you claim to be illegal, including:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>The exact URL of the webpage where the content is found</li>
              <li>The date and time you identified the content</li>
              <li>A screenshot of the webpage</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white mb-2">3. Identification of the link</h2>
            <p>Displayed on our site that leads to the illegal content, including:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>The exact URL of the page on DamiTV.pro where the link is found</li>
              <li>The date and time you identified the link</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white mb-2">4. Your contact information</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Full name</li>
              <li>Street or mailing address</li>
              <li>Telephone number</li>
              <li>E-mail address</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white mb-2">5. A formal declaration stating that:</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>You have a good faith belief that the disputed use is unauthorized.</li>
              <li>The disputed use is not permitted by law, such as under copyright law.</li>
              <li>You have attempted to contact the original content host, or explain why not.</li>
              <li>The information in your notice is accurate, and under penalty of perjury, you are authorized to act on behalf of the rightsholder.</li>
              <li>You indemnify DamiTV.pro, its affiliates, directors, employees, and agents from any liability resulting from this notice.</li>
              <li>You agree that this notice and any related dispute will be governed by the laws of Europe, and resolved exclusively in Madrid, Spain.</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-white dark:bg-black rounded-xl p-6 border border-black dark:border-white text-black dark:text-white">
          <h2 className="text-xl font-bold text-black dark:text-white mb-4">Contact Information</h2>
          <p>DamiTV.pro</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default DMCANotice;
