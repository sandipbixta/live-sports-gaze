import React from "react";
import { shouldShowAds } from "@/utils/adConfig";

const AdultBannerAd: React.FC = () => {
  if (!shouldShowAds()) {
    return null;
  }

  return (
    <div className="w-full flex justify-center py-4 mb-4">
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
        className="max-w-full rounded-lg"
      />
    </div>
  );
};

export default AdultBannerAd;