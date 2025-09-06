import React from "react";
import { shouldShowAds } from "@/utils/adConfig";

const FixedBottomAd: React.FC = () => {
  if (!shouldShowAds()) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white flex justify-center py-2 shadow-lg border-t border-gray-200">
      <iframe
        style={{ backgroundColor: "white" }}
        width="900"
        height="250"
        scrolling="no"
        frameBorder="0"
        allowTransparency={true}
        marginHeight={0}
        marginWidth={0}
        name="spot_id_1234567"
        src="https://a.adtng.com/get/10013899"
        className="max-w-full"
      />
    </div>
  );
};

export default FixedBottomAd;