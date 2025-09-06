import React from "react";
import { shouldShowAds } from "@/utils/adConfig";

const FixedBottomAd: React.FC = () => {
  if (!shouldShowAds()) {
    return null;
  }

  return (
    <div className="w-full flex justify-center py-4">
      <iframe
        style={{ backgroundColor: "white" }}
        width="320"
        height="100"
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