import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Radio } from "lucide-react";
import { trpc } from "@/providers/trpc";

export default function AnnouncementsBar() {
  const { data: cmsMarquees } = trpc.cms.listMarquees.useQuery();
  const { data: legacyAnnouncements } = trpc.announcements.list.useQuery();
  const [currentIndex, setCurrentIndex] = useState(0);

  const dynamicMarquees = cmsMarquees
    ?.filter((m: any) => !m.isDeleted && m.isActive !== false)
    ?.map((m: any) => ({
      id: m._id?.toString() || m._id,
      title: m.text,
      link: m.linkUrl || "",
      bgColor: m.bgColor,
      textColor: m.textColor,
      badgeText: m.badgeText,
      isTransparent: !!m.isTransparent,
      shape: m.shape || "rectangle",
      borderRadius: m.borderRadius || "none",
    }));

  const items =
    dynamicMarquees && dynamicMarquees.length > 0
      ? dynamicMarquees
      : legacyAnnouncements && legacyAnnouncements.length > 0
      ? legacyAnnouncements.map((a: any) => ({
          id: a.id || a._id,
          title: a.title,
          link: a.link || "",
          bgColor: undefined,
          textColor: undefined,
          badgeText: undefined,
          isTransparent: false,
          shape: "rectangle",
          borderRadius: "none",
        }))
      : [];

  useEffect(() => {
    if (!items.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (!items.length) return null;

  const safeIndex = currentIndex % items.length;
  const current = items[safeIndex];
  if (!current) return null;

  // Use custom CMS colors if provided, otherwise fall back to cobalt blue
  const hasCmsColor = !current.isTransparent && current.bgColor;

  return (
    <div
      className="py-2 px-4 relative overflow-hidden border-b"
      style={
        hasCmsColor
          ? {
              backgroundColor: current.bgColor,
              color: current.textColor || "#ffffff",
              borderColor: "transparent",
            }
          : current.isTransparent
          ? { backgroundColor: "transparent", color: current.textColor || "#1e3a8a" }
          : { backgroundColor: "#f0f4ff", color: "#1e3a8a", borderColor: "#dbeafe" }
      }
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        {/* Live indicator dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-700" />
        </span>

        <span
          className="text-[10px] font-black uppercase tracking-widest shrink-0 opacity-70"
          style={{ color: hasCmsColor ? (current.textColor || "#fff") : "#2563eb" }}
        >
          <Radio className="inline w-3 h-3 mr-1 -mt-0.5" />
          LIVE
        </span>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id + safeIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-center"
          >
            {current.badgeText && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-700/15 text-blue-800 shrink-0 border border-blue-200">
                {current.badgeText}
              </span>
            )}
            <span>{current.title}</span>

            {current.link && (
              <Link
                to={current.link}
                className="inline-flex items-center gap-1 underline underline-offset-4 hover:opacity-70 font-bold ml-1 shrink-0 text-blue-700"
              >
                Know More <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
