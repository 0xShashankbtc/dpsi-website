import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Bell } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";

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
      const dismissedKey = `dpsi_popup_dismissed_${activePopup._id}_${activePopup.cacheVersion || "v1"}`;
      if (sessionStorage.getItem(dismissedKey) !== "true") {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1000);
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

  if (!isOpen || !activePopup) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative max-w-lg w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xl text-slate-900"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-lg bg-white/90 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
            title="Close Notice"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Optional Popup Image */}
          {activePopup.imageUrl && (
            <div className="w-full max-h-64 sm:max-h-72 bg-slate-50 overflow-hidden relative border-b border-slate-100 flex items-center justify-center">
              <img
                src={activePopup.imageUrl}
                alt={activePopup.title}
                className="w-full h-full object-cover"
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
    </AnimatePresence>
  );
}
