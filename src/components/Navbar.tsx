import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/providers/trpc";
import {
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";


const navLinks = [
  { label: "Home", href: "/" },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "Vision & Mission", href: "/about#vision" },
      { label: "Leadership", href: "/about#leadership" },
      { label: "Timeline", href: "/about#timeline" },
    ],
  },
  {
    label: "Academics",
    href: "/academics",
    children: [
      { label: "Curriculum", href: "/academics#curriculum" },
      { label: "Departments", href: "/academics#departments" },
      { label: "Results", href: "/academics#results" },
    ],
  },
  { label: "Admissions", href: "/admissions" },
  { label: "Facilities", href: "/facilities" },
  { label: "News & Events", href: "/news-events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const location = useLocation();

  const { data: dbMenus } = trpc.cms.listMenus.useQuery({ location: "header" });
  const { data: siteSettings } = trpc.cms.getSiteSettings.useQuery();

  const getSetting = (key: string, fallback: string) => {
    const item = siteSettings?.find((s: any) => s.key === key);
    return item?.value?.trim() || fallback;
  };

  const logoUrl = getSetting("logo_url", "/images/dps/logo.webp");
  const logoHeight = parseInt(getSetting("logo_height", "52"), 10) || 52;
  const logoShape = getSetting("logo_shape", "default");
  const logoShowText = getSetting("logo_show_text", "false") === "true";
  const schoolName = getSetting("school_name", "Delhi Public School Indirapuram");
  const schoolTagline = getSetting("school_tagline", "Excellence in Education");

  // Construct dynamic hierarchical nav links from MongoDB
  const dynamicNavLinks = (() => {
    if (!dbMenus || dbMenus.length === 0) return navLinks;

    const headerMenus = dbMenus.filter(
      (m: any) => (!m.location || m.location === "header") && m.isActive !== false && !m.isDeleted
    );
    if (headerMenus.length === 0) return navLinks;

    const parents = headerMenus
      .filter((m: any) => !m.parent || m.parent.trim() === "" || m.parent === "None")
      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

    return parents.map((p: any) => {
      const pTitle = (p.title || "").trim().toLowerCase();
      const pId = p._id ? p._id.toString() : "";
      const pUrl = (p.url || "").trim().toLowerCase();

      const children = headerMenus
        .filter((c: any) => {
          if (!c.parent || c.parent.trim() === "" || c.parent === "None") return false;
          const cParent = c.parent.trim().toLowerCase();
          return cParent === pTitle || cParent === pId || cParent === pUrl;
        })
        .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

      return {
        label: p.title,
        href: p.url,
        children: children.length > 0 ? children.map((c: any) => ({ label: c.title, href: c.url })) : undefined,
      };
    });
  })();

  const activeNavItems = dynamicNavLinks.length > 0 ? dynamicNavLinks : navLinks;

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled((prev) => {
            const next = window.scrollY > 20;
            return prev !== next ? next : prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setIsMobileOpen(false);
    setActiveDropdown(null);
  }

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const isAdmin = true;

  const { data: dbMarquees } = trpc.cms.listMarquees.useQuery();

  const phone = getSetting("contact_phone", "+91-0120-4660000, 4670000");
  const email = getSetting("contact_email", "INFO@DPSINDIRAPURAM.COM");
  const affiliationNo = getSetting("cbse_affiliation_no", "2130663");
  const schoolCode = getSetting("school_code", "60297");
  const tagline = getSetting("school_tagline", "ADMISSIONS OPEN FOR SESSION 2026-27");

  const activeMarquees = dbMarquees?.filter((m: any) => m.isActive !== false && !m.isDeleted);

  return (
    <>
      <div className="bg-emerald-900 text-white text-xs py-2 overflow-hidden border-b border-emerald-700/50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
          <div className="flex-1 overflow-hidden relative">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-8 font-semibold text-emerald-200">
              {activeMarquees && activeMarquees.length > 0 ? (
                activeMarquees.map((m: any, idx: number) => (
                  <React.Fragment key={m._id || idx}>
                    <span
                      className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md text-xs font-semibold"
                      style={{
                        color: m.textColor || "#ffffff",
                        backgroundColor: m.bgColor || "transparent",
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full animate-ping shrink-0"
                        style={{ backgroundColor: m.textColor || "#fbbf24" }}
                      />
                      {m.badgeText && (
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-black/25">
                          {m.badgeText}
                        </span>
                      )}
                      {m.linkUrl ? (
                        <a href={m.linkUrl} className="hover:underline">
                          {m.text}
                        </a>
                      ) : (
                        <span>{m.text}</span>
                      )}
                    </span>
                    <span className="text-emerald-400/50">•</span>
                  </React.Fragment>
                ))
              ) : (

                <>
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    {tagline.toUpperCase()}
                  </span>
                  <span>•</span>
                  <span>CBSE AFFILIATION NO: {affiliationNo} | SCHOOL CODE: {schoolCode}</span>
                  <span>•</span>
                  <span>CALL US: {phone} | EMAIL: {email.toUpperCase()}</span>
                </>
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-[11px] font-bold text-white shrink-0">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://dpsindp.schoolforschools.ai/login"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded shadow-md transition-all font-extrabold"
            >
              SchoolsOS Login
            </motion.a>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/admissions" className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-all block">
                Apply Now
              </Link>
            </motion.div>
            {isAdmin && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/admin"
                  className="px-2 py-0.5 bg-black/40 hover:bg-black/60 text-emerald-300 hover:text-white rounded border border-emerald-500/30 transition-all block text-[10px] font-semibold"
                  title="Open Admin Dashboard"
                >
                  Admin CMS
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <motion.header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg border-b border-slate-200/60 dark:border-slate-800/60"
            : "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md"
        }`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.img
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                src={logoUrl}
                alt={schoolName}
                style={{ height: `${Math.min(Math.max(logoHeight, 32), 75)}px` }}
                className={`w-auto object-contain transition-transform duration-300 ${
                  logoShape === "circle"
                    ? "rounded-full"
                    : logoShape === "rounded"
                    ? "rounded-xl"
                    : logoShape === "rectangle"
                    ? "rounded-none"
                    : ""
                }`}
                loading="eager"
                decoding="async"
              />
              {logoShowText && (
                <div className="hidden md:flex flex-col">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                    {schoolName}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    {schoolTagline}
                  </span>
                </div>
              )}
            </Link>

            <nav className="hidden lg:flex items-center gap-1 xl:gap-2" onMouseLeave={() => setHoveredLink(null)}>
              {activeNavItems.map((link) => {
                const isActive =
                  location.pathname === link.href ||
                  (link.href !== "/" && location.pathname.startsWith(link.href));
                const isHovered = hoveredLink === link.label;
                const hasChildren = link.children && link.children.length > 0;

                return (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => {
                      setHoveredLink(link.label);
                      if (hasChildren) setActiveDropdown(link.label);
                    }}
                    onMouseLeave={() => {
                      if (link.children) setActiveDropdown(null);
                    }}
                  >
                    <Link
                      to={link.href}
                      className={`relative z-10 px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                        isActive
                          ? "text-emerald-800 dark:text-emerald-300"
                          : "text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400"
                      }`}
                    >
                      {/* Smooth Gliding Active / Hover Rectangle Indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="navActivePill"
                          className="absolute inset-0 bg-emerald-100/90 dark:bg-emerald-950/60 border border-emerald-300/60 dark:border-emerald-700/50 rounded-lg -z-10 shadow-2xs"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      {!isActive && isHovered && (
                        <motion.div
                          layoutId="navHoverPill"
                          className="absolute inset-0 bg-slate-100/80 dark:bg-slate-800/60 rounded-lg -z-10"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}

                      <span>{link.label}</span>
                      {link.children && (
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === link.label ? "rotate-180" : ""}`} />
                      )}
                    </Link>

                    <AnimatePresence>
                      {link.children && activeDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute top-full left-0 mt-1.5 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden py-1 z-50"
                        >
                          {link.children.map((child, idx) => (
                            <motion.div
                              key={child.label}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.15, delay: idx * 0.04 }}
                            >
                              <Link
                                to={child.href}
                                className="block px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                              >
                                {child.label}
                              </Link>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">

              <div className="flex items-center pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
                <motion.img
                  whileHover={{ scale: 1.06 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  src="/images/dps/international_logo.webp"
                  alt="British Council International Dimension in Schools 2020-23"
                  className="h-12 sm:h-16 lg:h-[72px] w-auto object-contain rounded-md drop-shadow-sm hover:drop-shadow-md transition-all cursor-pointer"
                  title="British Council International Dimension in Schools 2020-23"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsDark(!isDark)}
                className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
              >
                {isMobileOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 overflow-hidden"
            >
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={{
                  open: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
                  closed: { transition: { staggerChildren: 0.02, staggerDirection: -1 } }
                }}
                className="px-4 py-4 space-y-1"
              >
                {activeNavItems.map((link) => (
                  <div key={link.label}>
                    <Link
                      to={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        location.pathname === link.href
                          ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                          : "text-slate-700 dark:text-slate-200 hover:text-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {link.label}
                    </Link>
                    {link.children && (
                      <div className="pl-4 space-y-1">
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            to={child.href}
                            onClick={() => setIsMobileOpen(false)}
                            className="block px-3 py-1.5 text-sm text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isAdmin && (
                  <motion.div
                    variants={{
                      open: { opacity: 1, y: 0 },
                      closed: { opacity: 0, y: -6 }
                    }}
                  >
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileOpen(false)}
                      className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50"
                    >
                      Admin CMS
                    </Link>
                  </motion.div>
                )}

                <div className="pt-3 mt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3 px-3">
                  <img
                    src="/images/dps/international_logo.webp"
                    alt="British Council International Dimension in Schools"
                    className="h-14 w-auto object-contain rounded drop-shadow-xs"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      British Council IDS Accredited
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      International Dimension in Schools
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}