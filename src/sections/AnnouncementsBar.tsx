import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { DEFAULT_MARQUEES } from "@/lib/initialDataSnapshot";

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
    }));

  const fallbackMarquees = DEFAULT_MARQUEES.map((m) => ({
    id: m._id,
    title: m.text,
    link: m.linkUrl || "",
    bgColor: m.bgColor,
    textColor: m.textColor,
    badgeText: m.badgeText,
    isTransparent: false,
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
        }))
      : fallbackMarquees;

  useEffect(() => {
    if (!items.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (!items.length) return null;

  const safeIndex = currentIndex % items.length;
  const current = items[safeIndex];
  if (!current) return null;

  const hasCmsBg = !current.isTransparent && Boolean(current.bgColor);

  return (
    <div
      className="py-2 px-4 relative overflow-hidden text-xs transition-colors duration-300 border-b border-slate-800"
      style={{
        backgroundColor: hasCmsBg ? current.bgColor : "#0f172a",
        color: current.textColor || "#f8fafc",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id + safeIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex items-center gap-2 font-medium text-center truncate"
          >
            {current.badgeText ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/15 text-white shrink-0 border border-white/20">
                {current.badgeText}
              </span>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            )}

            <span className="truncate">{current.title}</span>

            {current.link && (
              <Link
                to={current.link}
                className="inline-flex items-center gap-1 text-white/90 hover:text-white underline underline-offset-4 font-semibold ml-1 shrink-0 transition-opacity"
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
