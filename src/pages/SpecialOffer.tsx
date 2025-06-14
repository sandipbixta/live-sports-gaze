
import React from "react";

const SpecialOffer: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-orange-500 mb-4">🎁 Special Offer</h1>
        {/* Uncomment the below if you want a button that continues to the external ad 
        <a
          href="https://monkeyhundredsarmed.com/zbt0wegpe?key=39548340a9430381e48a2856c8cf8d37"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-6 px-6 py-2 text-white bg-orange-500 rounded-lg font-semibold hover:bg-orange-600 transition"
        >
          Continue to Offer
        </a>
        */}
      </div>
    </div>
  );
};

export default SpecialOffer;
