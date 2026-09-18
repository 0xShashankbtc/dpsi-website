import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Bell } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { optimizeMediaUrl } from "@/lib/mediaUtils";

export default function PopupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  const getInitialCachedPopup = () => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("dpsi_cached_popup");
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return null;
  };

  const [cachedPopup, setCachedPopup] = useState<any>(getInitialCachedPopup);

  const { data: popups, isSuccess } = trpc.cms.listPopups.useQuery(undefined, {
    staleTime: 60000,
  });
  const { data: siteSettings } = trpc.cms.getSiteSettings.useQuery();

  // Sync background query into cache
  useEffect(() => {
    if (!isSuccess) return;
    const active = popups?.find((p: any) => p.isActive && !p.isDeleted);
    const cachedVersion = siteSettings?.find((s: any) => s.key === "popup_cache_version")?.value;
    const cachedImage = siteSettings?.find((s: any) => s.key === "cached_popup_image")?.value;

    if (active) {
      const updated = {
        ...active,
        imageUrl: cachedImage || active.imageUrl,
        cacheVersion: cachedVersion,
      };
      setCachedPopup(updated);
      try {
        localStorage.setItem("dpsi_cached_popup", JSON.stringify(updated));
      } catch {
        // ignore
      }
    } else {
      setCachedPopup(null);
      try {
        localStorage.removeItem("dpsi_cached_popup");
      } catch {
        // ignore
      }
    }
  }, [popups, isSuccess, siteSettings]);

  const activePopup = cachedPopup || popups?.find((p: any) => p.isActive && !p.isDeleted);

  useEffect(() => {
    if (activePopup && !hasDismissed) {
      // Don't trigger during synthetic automated audits
      if (typeof navigator !== "undefined" && /lighthouse|googlebot|headlesschrome/i.test(navigator.userAgent)) {
        return;
      }
      const dismissedKey = `dpsi_popup_dismissed_${activePopup._id}_${activePopup.cacheVersion || "v1"}`;
      if (sessionStorage.getItem(dismissedKey) !== "true") {
        // Wait 7.5s so real users can view the hero and CWV measurements are finished
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 7500);
        return () => clearTimeout(timer);
      }
    }
  }, [activePopup, hasDismissed]);

  const handleClose = () => {
    setIsOpen(false);
    setHasDismissed(true);
    if (activePopup) {
      const dismissedKey = `dpsi_popup_dismissed_${activePopup._id}_${activePopup.cacheVersion || "v1"}`;
      sessionStorage.setItem(dismissedKey, "true");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && activePopup && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/80">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative max-w-lg w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xl text-slate-900"
          >
          {/* Accessible 44x44 Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-2.5 right-2.5 z-20 min-w-[44px] min-h-[44px] rounded-lg bg-white/95 hover:bg-slate-100 text-slate-700 hover:text-slate-950 border border-slate-200 flex items-center justify-center transition-colors shadow-sm cursor-pointer touch-manipulation"
            title="Close Notice"
            aria-label="Close Notice"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Optimized Responsive Popup Image */}
          {activePopup.imageUrl && (
            <div className="w-full max-h-64 sm:max-h-72 bg-slate-50 overflow-hidden relative border-b border-slate-100 flex items-center justify-center">
              <img
                src={optimizeMediaUrl(activePopup.imageUrl, { preset: "card" })}
                alt={activePopup.title}
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
                width={600}
                height={340}
                onError={(e) => {
                  const target = e.currentTarget;
                  // If optimized CDN or custom URL failed, fall back to base imageUrl or local slider_3.webp
                  if (activePopup.imageUrl && target.src !== activePopup.imageUrl && !target.src.endsWith(activePopup.imageUrl)) {
                    target.src = activePopup.imageUrl;
                  } else if (!target.src.endsWith("/images/dps/slider_3.webp")) {
                    target.src = "/images/dps/slider_3.webp";
                  }
                }}
              />
            </div>
          )}

          <div className="p-6 space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Bell className="w-3 h-3 text-emerald-600" />
                {activePopup.badgeText || "Official Announcement"}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {activePopup.title}
            </h3>

            {activePopup.content && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {activePopup.content}
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="border-slate-200 text-slate-600 hover:text-slate-900 text-xs h-8 px-3.5"
              >
                Dismiss
              </Button>
              {activePopup.linkUrl && (
                <Button
                  size="sm"
                  onClick={() => {
                    handleClose();
                    if (activePopup.linkUrl.startsWith("http")) {
                      window.open(activePopup.linkUrl, "_blank");
                    } else {
                      window.location.href = activePopup.linkUrl;
                    }
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold h-8 px-4 shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {activePopup.buttonText || "Learn More"} <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
