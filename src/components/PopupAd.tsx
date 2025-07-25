
import React, { useEffect, useRef, useState, MouseEvent } from "react";

const LOCAL_SPECIAL_OFFER_URL = "/special-offer";
const AD_URL = "https://monkeyhundredsarmed.com/zbt0wegpe?key=39548340a9430381e48a2856c8cf8d37";

const SESSION_KEY = "specialOfferClosed";

const PopupAd: React.FC = () => {
  const [open, setOpen] = useState<boolean>(() => {
    // Only show popup if it hasn't been closed in this session
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem(SESSION_KEY);
    }
    return true;
  });
  const popupRef = useRef<HTMLDivElement | null>(null);

  // Prevent background scrolling when the popup is open
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

  // Handler to close popup and mark in sessionStorage
  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem(SESSION_KEY, "true");
    // For debugging: log close action
    console.log("[PopupAd] Special offer popup closed");
  };

  // Handler to open the special offer route (not when clicking close btn)
  const handleBoxClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-close-btn="true"]')) {
      return;
    }
    window.open(LOCAL_SPECIAL_OFFER_URL, "_blank", "noopener noreferrer");
  };

  // Fallback: allow overlay click to close if adblocker breaks close button
  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    // Only allow close if clicked directly on overlay (not child nodes)
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center"
      onClick={handleOverlayClick}
      aria-label="Special Offer Overlay"
    >
      <div
        ref={popupRef}
        className="relative rounded-xl shadow-2xl bg-white dark:bg-neutral-900 border border-gray-300 dark:border-gray-700 max-w-xs w-full mx-2 animate-scale-in cursor-pointer"
        onClick={handleBoxClick}
        tabIndex={0}
        aria-label="Special Offer (click to open)"
        role="button"
        style={{ outline: "none" }}
      >
        <button
          aria-label="Close Special Offer"
          onClick={handleClose}
          className="absolute -right-3 -top-3 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-700 rounded-full text-xl w-8 h-8 flex items-center justify-center shadow hover:bg-red-100 hover:text-red-500 transition z-10"
          data-close-btn="true"
          tabIndex={0}
          type="button"
          style={{ cursor: "pointer" }}
        >
          ×
        </button>
        {/* Special Offer Header */}
        <div className="w-full flex items-center justify-center py-2 border-b border-gray-200 dark:border-gray-700 bg-orange-50 dark:bg-orange-900 rounded-t-xl pointer-events-none select-none">
          <span className="text-base font-semibold text-orange-600 dark:text-orange-200">
            🎁 Special Offer
          </span>
        </div>
        {/* Ad iframe */}
        <div className="p-3 flex justify-center items-center select-none pointer-events-none">
          <div className="pointer-events-auto">
            <iframe
              src={AD_URL}
              title="Special Offer Advertisement"
              className="w-[300px] h-[250px] rounded-lg border-none"
              style={{
                minWidth: "200px",
                minHeight: "100px",
                display: "block",
                backgroundColor: "#fff",
                border: "none",
              }}
              sandbox="allow-scripts allow-same-origin allow-popups"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupAd;
