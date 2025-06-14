
import React, { useEffect, useState } from "react";

const AD_URL = "https://monkeyhundredsarmed.com/zbt0wegpe?key=39548340a9430381e48a2856c8cf8d37";

const PopupAd: React.FC = () => {
  const [open, setOpen] = useState(true);

  // Prevent scrolling when popup is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center">
      <div className="relative rounded-lg shadow-2xl bg-white dark:bg-black border border-gray-300 dark:border-gray-700 w-full max-w-lg mx-2 sm:mx-0">
        <button
          aria-label="Close Popup Ad"
          onClick={() => setOpen(false)}
          className="absolute -right-3 -top-3 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-full text-xl w-8 h-8 flex items-center justify-center shadow hover:bg-red-100 hover:text-red-500 transition"
        >
          ×
        </button>
        <iframe
          src={AD_URL}
          title="Popup Advertisement"
          className="w-full h-[360px] sm:h-[420px] rounded-b-lg"
          style={{
            minHeight: 260,
            border: "none",
            display: "block"
          }}
          sandbox="allow-scripts allow-same-origin allow-popups"
        ></iframe>
      </div>
    </div>
  );
};

export default PopupAd;
