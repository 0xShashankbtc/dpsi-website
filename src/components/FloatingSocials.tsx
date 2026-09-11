import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Facebook, Youtube, Linkedin, Instagram, X, Globe, Twitter } from "lucide-react";
import { trpc } from "@/providers/trpc";

export default function FloatingSocials() {
  const { data: siteSettings } = trpc.cms.getSiteSettings.useQuery(undefined, {
    staleTime: 60000,
  });

  const getSetting = (key: string, fallback: string) => {
    const item = siteSettings?.find((s: any) => s.key === key);
    return item?.value?.trim() || fallback;
  };

  const fbUrl = getSetting("social_facebook", "https://www.facebook.com/DPSIndirapuramGhaziabad");
  const instaUrl = getSetting("social_instagram", "https://www.instagram.com/dps_indirapuram/");
  const ytUrl = getSetting("social_youtube", "https://www.youtube.com/channel/UC-jQAVRh4pBXEktpml3yeIQ/videos");
  const liUrl = getSetting("social_linkedin", "https://www.linkedin.com/school/dps-indirapuram/");
  const twUrl = getSetting("social_twitter", "https://twitter.com/dps_indirapuram");

  const socialLinks = [
    {
      name: "Facebook",
      icon: <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />,
      url: fbUrl,
      color: "bg-[#1877F2] hover:bg-[#166fe5]",
    },
    {
      name: "Instagram",
      icon: <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />,
      url: instaUrl,
      color: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90",
    },
    {
      name: "YouTube",
      icon: <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />,
      url: ytUrl,
      color: "bg-[#FF0000] hover:bg-[#cc0000]",
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />,
      url: liUrl,
      color: "bg-[#0A66C2] hover:bg-[#095196]",
    },
    {
      name: "Twitter",
      icon: <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />,
      url: twUrl,
      color: "bg-sky-500 hover:bg-sky-600",
    },
  ].filter((s) => !!s.url);

  const [isOpen, setIsOpen] = useState(false);
  const userInteractedRef = useRef(false);

  useEffect(() => {
    const openTimer = setTimeout(() => {
      if (!userInteractedRef.current) {
        setIsOpen(true);
      }
    }, 2500);

    const closeTimer = setTimeout(() => {
      if (!userInteractedRef.current) {
        setIsOpen(false);
      }
    }, 7000);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
    };
  }, []);

  const handleToggle = () => {
    userInteractedRef.current = true;
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="hidden md:flex fixed left-4 bottom-8 z-40 flex-col items-center">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.25, staggerChildren: 0.05 }}
            className="flex flex-col gap-2 mb-3 items-center"
          >
            {socialLinks.map((social) => (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                whileHover={{ scale: 1.15, x: 4 }}
                whileTap={{ scale: 0.9 }}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${social.color}`}
                title={social.name}
                aria-label={`Visit our ${social.name} page`}
              >
                {social.icon}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all cursor-pointer border border-white/20 ${
          isOpen
            ? "bg-slate-900 text-white hover:bg-slate-800"
            : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500"
        }`}
        aria-label="Toggle social links"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div
              key="globe"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Globe className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
