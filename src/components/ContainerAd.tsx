import React, { useEffect, useRef } from "react";
import { adConfig, shouldShowAds } from "@/utils/adConfig";

const ContainerAd: React.FC = () => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shouldShowAds()) return;
    
    const adContainer = adRef.current;
    if (!adContainer) return;

    // Clean previous ad content if any
    adContainer.innerHTML = "";

    // Create the container div with the specific ID
    const containerDiv = document.createElement("div");
    containerDiv.id = adConfig.container.containerId;
    
    // Create and append the script
    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = adConfig.container.scriptSrc;
    
    adContainer.appendChild(containerDiv);
    adContainer.appendChild(script);

    return () => {
      // Clean up when component unmounts
      if (adContainer) {
        adContainer.innerHTML = "";
      }
    };
  }, []);

  if (!shouldShowAds()) {
    return null;
  }

  return (
    <div className="w-full flex items-center justify-center py-4">
      <div
        ref={adRef}
        className="w-full max-w-md mx-auto"
        style={{
          minHeight: 250,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      />
    </div>
  );
};

export default ContainerAd;