import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/providers/trpc";
import {
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Compass,
} from "lucide-react";
import { InteractiveHoverLinks } from "@/components/ui/interactive-hover-links";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { preloadRoute } from "@/lib/routePreloader";


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
  const [isExploreOpen, setIsExploreOpen] = useState(false);
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
  const logoHeight = parseInt(getSetting("logo_height", "62"), 10) || 62;
  const logoShape = getSetting("logo_shape", "default");
  const logoShowText = getSetting("logo_show_text", "false") === "true";
  const schoolName = getSetting("school_name", "Delhi Public School Indirapuram");
  const schoolTagline = getSetting("school_tagline", "Excellence in Education");
  const internationalLogoUrl = getSetting("international_logo_url", "/images/dps/international_logo.webp");
  const showInternationalLogo = getSetting("show_international_logo", "true") !== "false";
  const secondaryLogoTitle = getSetting("secondary_logo_title", "Accreditation & Partner School");

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

  // Responsive breakpoint tracking to eliminate any possible navbar overlap
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine max visible top-level links before overflowing to "More" dropdown
  const maxVisibleLinks = useMemo(() => {
    if (windowWidth < 1200) return 4;   // 1024px - 1199px (compact laptop/iPad Pro)
    if (windowWidth < 1380) return 5;   // 1200px - 1379px (standard 13" laptop)
    if (windowWidth < 1536) return 7;   // 1380px - 1535px (large laptop/monitor)
    return 8;                           // 1536px+ (2K / 4K wide monitor)
  }, [windowWidth]);

  const visibleNavItems = useMemo(
    () => activeNavItems.slice(0, maxVisibleLinks),
    [activeNavItems, maxVisibleLinks]
  );

  const overflowNavItems = useMemo(
    () => activeNavItems.slice(maxVisibleLinks),
    [activeNavItems, maxVisibleLinks]
  );

  const isMoreActive = useMemo(
    () =>
      overflowNavItems.some(
        (item: any) =>
          location.pathname === item.href ||
          (item.href !== "/" && location.pathname.startsWith(item.href)) ||
          item.children?.some(
            (c: any) =>
              location.pathname === c.href ||
              (c.href !== "/" && location.pathname.startsWith(c.href))
          )
      ),
    [overflowNavItems, location.pathname]
  );

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
    setIsExploreOpen(false);
    setActiveDropdown(null);
  }

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Lock background window scroll when modal or mobile drawer is open
  useEffect(() => {
    if (isExploreOpen || isMobileOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isExploreOpen, isMobileOpen]);

  // Global listener to open explore modal from any component (HeroSection, QuickLinks, etc.)
  useEffect(() => {
    const handleOpenExplore = () => setIsExploreOpen(true);
    window.addEventListener("dpsi:open-explore", handleOpenExplore);
    return () => window.removeEventListener("dpsi:open-explore", handleOpenExplore);
  }, []);

  const { data: dbMarquees } = trpc.cms.listMarquees.useQuery();

  const phone = getSetting("contact_phone", "+91-0120-4660000, 4670000");
  const email = getSetting("contact_email", "INFO@DPSINDIRAPURAM.COM");
  const affiliationNo = getSetting("cbse_affiliation_no", "2130663");
  const schoolCode = getSetting("school_code", "60297");
  const tagline = getSetting("school_tagline", "ADMISSIONS OPEN FOR SESSION 2026-27");

  // Dynamic Explore Button configuration from MongoDB
  const exploreEnabled = getSetting("explore_button_enabled", "true") !== "false";
  const exploreLabel = getSetting("explore_button_text", "Explore");
  const exploreMode = (getSetting("explore_button_mode", "text") as "text" | "icon");
  const exploreActionType = getSetting("explore_action_type", "modal");
  const exploreLink = getSetting("explore_button_link", "#interactive-facilities");

  const handleExploreClick = () => {
    if (exploreActionType === "link") {
      if (exploreLink.startsWith("#")) {
        const el = document.querySelector(exploreLink);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          return;
        }
      }
      window.location.href = exploreLink;
    } else {
      setIsExploreOpen(true);
    }
  };

  const activeMarquees = dbMarquees?.filter((m: any) => m.isActive !== false && !m.isDeleted);

  return (
    <>
      <header className="sticky top-0 z-50 w-full transform-gpu">
        {/* Attached & Connected Green Marquee Top Bar */}
        <div className="bg-emerald-900 text-white text-xs pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 overflow-hidden border-b border-emerald-700/50">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
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
                <a
                  href="https://dpsivr.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded transition-all block font-bold flex items-center gap-1 shadow-xs"
                  title="360 Virtual Tour"
                >
                  <span>360 View</span>
                </a>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div
          className={`w-full transition-colors duration-200 transform-gpu ${
            isScrolled
              ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md border-b border-slate-200/60 dark:border-slate-800/60"
              : "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-100 dark:border-slate-800/40"
          }`}
        >
        <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-18 lg:h-22 gap-2 sm:gap-3 xl:gap-6">
            <Link to="/" className="flex items-center gap-2 group shrink min-w-0 mr-auto lg:mr-8 xl:mr-12">
              <motion.img
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                src={logoUrl}
                alt={schoolName}
                style={
                  windowWidth < 640
                    ? { height: "32px", maxHeight: "34px" }
                    : { height: `${Math.min(Math.max(logoHeight, 40), 84)}px` }
                }
                className={`h-8 sm:h-14 lg:h-18 w-auto max-w-[170px] xs:max-w-[200px] sm:max-w-none object-contain transition-transform duration-300 shrink-0 ${
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

            <nav className="hidden lg:flex items-center justify-center gap-0.5 xl:gap-1 2xl:gap-2 shrink min-w-0" onMouseLeave={() => setHoveredLink(null)}>
              {visibleNavItems.map((link) => {
                const isActive =
                  location.pathname === link.href ||
                  (link.href !== "/" && location.pathname.startsWith(link.href));
                const isHovered = hoveredLink === link.label;
                const hasChildren = link.children && link.children.length > 0;

                return (
                  <div
                    key={link.label}
                    className="relative shrink-0"
                    onMouseEnter={() => {
                      setHoveredLink(link.label);
                      preloadRoute(link.href);
                      if (hasChildren) setActiveDropdown(link.label);
                      else setActiveDropdown(null);
                    }}
                    onMouseLeave={() => {
                      if (link.children) setActiveDropdown(null);
                    }}
                  >
                    <Link
                      to={link.href}
                      className={`relative z-10 px-2 xl:px-2.5 2xl:px-3 py-1.5 xl:py-2 text-xs xl:text-sm font-semibold rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
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
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.96 }}
                          transition={{ duration: 0.16, ease: "easeOut" }}
                          className="absolute top-full left-0 mt-2 w-64 rounded-2xl border border-white/80 dark:border-slate-800 p-2 z-50 divide-y divide-slate-100/90 dark:divide-slate-800/70"
                          style={{
                            backgroundColor: isDark ? "#0f172a" : "#ffffff",
                            boxShadow: isDark
                              ? "0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.1)"
                              : "0 20px 45px -10px rgba(0, 0, 0, 0.18), 0 6px 16px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.95), inset 0 1px 0 rgba(255, 255, 255, 1)",
                          }}
                        >
                          {link.children.map((child: any, idx: number) => (
                            <motion.div
                              key={child.label}
                              initial={{ opacity: 0, x: -4 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.12, delay: idx * 0.03 }}
                            >
                              <Link
                                to={child.href}
                                onMouseEnter={() => preloadRoute(child.href)}
                                className="group flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-emerald-700 dark:hover:text-emerald-300 rounded-xl transition-all"
                                onClick={() => setActiveDropdown(null)}
                              >
                                <span>{child.label}</span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                              </Link>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Seamless "More" Dropdown Menu for Overflow Links */}
              {overflowNavItems.length > 0 && (
                <div
                  className="relative shrink-0"
                  onMouseEnter={() => {
                    setHoveredLink("More");
                    setActiveDropdown("More");
                  }}
                  onMouseLeave={() => {
                    setActiveDropdown(null);
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setActiveDropdown(activeDropdown === "More" ? null : "More")
                    }
                    className={`relative z-10 px-2 xl:px-2.5 2xl:px-3 py-1.5 xl:py-2 text-xs xl:text-sm font-semibold rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                      isMoreActive
                        ? "text-emerald-800 dark:text-emerald-300 font-bold"
                        : "text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400"
                    }`}
                  >
                    {isMoreActive && (
                      <motion.div
                        layoutId="navActivePill"
                        className="absolute inset-0 bg-emerald-100/90 dark:bg-emerald-950/60 border border-emerald-300/60 dark:border-emerald-700/50 rounded-lg -z-10 shadow-2xs"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    {!isMoreActive && hoveredLink === "More" && (
                      <motion.div
                        layoutId="navHoverPill"
                        className="absolute inset-0 bg-slate-100/80 dark:bg-slate-800/60 rounded-lg -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}

                    <span>More</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        activeDropdown === "More" ? "rotate-180 text-emerald-600 dark:text-emerald-400" : "opacity-70"
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === "More" && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                        className="absolute top-full right-0 mt-2 w-64 rounded-2xl border border-white/80 dark:border-slate-800 p-2 z-[100] divide-y divide-slate-100/90 dark:divide-slate-800/70 shadow-2xl"
                        style={{
                          backgroundColor: isDark ? "#0f172a" : "#ffffff",
                          boxShadow: isDark
                            ? "0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.1)"
                            : "0 20px 45px -10px rgba(0, 0, 0, 0.18), 0 6px 16px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.95), inset 0 1px 0 rgba(255, 255, 255, 1)",
                        }}
                      >
                        {overflowNavItems.map((item: any) => {
                          const isItemActive =
                            location.pathname === item.href ||
                            (item.href !== "/" && location.pathname.startsWith(item.href));
                          const hasChildren = item.children && item.children.length > 0;

                          return (
                            <div key={item.label} className="py-1">
                              <Link
                                to={item.href}
                                className={`group flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                                  isItemActive
                                    ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 shadow-xs border border-emerald-200/60 dark:border-emerald-800/60"
                                    : "text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-emerald-700 dark:hover:text-emerald-300 hover:translate-x-0.5"
                                }`}
                                onClick={() => setActiveDropdown(null)}
                              >
                                <div className="flex items-center gap-2.5">
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                                      isItemActive
                                        ? "bg-emerald-600 scale-125"
                                        : "bg-slate-300 dark:bg-slate-600 group-hover:bg-emerald-500"
                                    }`}
                                  />
                                  <span className="tracking-tight">{item.label}</span>
                                </div>
                                {isItemActive ? (
                                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                                    Active
                                  </span>
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                                )}
                              </Link>

                              {hasChildren && (
                                <div className="pl-6 pr-2 py-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 ml-4 my-1">
                                  {item.children.map((child: any) => (
                                    <Link
                                      key={child.label}
                                      to={child.href}
                                      className="block px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 rounded-lg hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 transition-colors"
                                      onClick={() => setActiveDropdown(null)}
                                    >
                                      {child.label}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-2.5 shrink-0 z-20">

              {/* Interactive Liquid Metal Explore Trigger */}
              {exploreEnabled && (
                <div className="hidden md:flex items-center shrink-0 my-auto">
                  <LiquidMetalButton
                    label={exploreLabel}
                    viewMode={exploreMode}
                    onClick={handleExploreClick}
                    title="Explore Campus Facilities & Key Links"
                    icon={<Compass className="w-3.5 h-3.5 text-emerald-400" />}
                  />
                </div>
              )}

              {/* Secondary School Logo (located on right side of Explore button) */}
              {showInternationalLogo && (
                <div className="hidden sm:flex items-center pl-1.5 sm:pl-2.5 border-l border-slate-200 dark:border-slate-800 shrink-0">
                  <motion.img
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    src={internationalLogoUrl}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes("/images/dps/international_logo.webp")) {
                        target.src = "/images/dps/international_logo.webp";
                      }
                    }}
                    alt={secondaryLogoTitle}
                    className="h-8 w-8 sm:h-9 sm:w-9 lg:h-9 lg:w-9 object-contain aspect-square shrink-0 cursor-pointer"
                    title={secondaryLogoTitle}
                    loading="eager"
                  />
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsDark(!isDark)}
                className="p-1.5 sm:p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer shrink-0"
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
                className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer shrink-0"
                aria-label="Toggle navigation menu"
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
        </div>
      </header>

      {/* Full-Screen / Viewport-Level Solid Opaque Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-[99999] lg:hidden overflow-hidden flex flex-col justify-start">
            {/* Tap-outside backdrop to dismiss */}
            <motion.div
              key="mobile-nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs -z-10 cursor-pointer"
              aria-hidden="true"
            />

            {/* Slide-over Drawer with 100% solid, fully opaque background (no translucent bleed-through) */}
            <motion.div
              key="mobile-nav-drawer"
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              data-lenis-prevent
              style={{
                backgroundColor: isDark ? "#020617" : "#ffffff",
              }}
              className="w-full max-h-[92dvh] flex flex-col bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-white"
            >
              {/* Clean Top Branding Bar inside drawer with Close button */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 shrink-0">
                <Link
                  to="/"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-2.5 min-w-0"
                >
                  <img
                    src={logoUrl}
                    alt={schoolName}
                    className="h-9 sm:h-10 w-auto object-contain shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {schoolName}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 truncate">
                      {schoolTagline}
                    </span>
                  </div>
                </Link>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsDark(!isDark)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                    aria-label="Toggle dark mode"
                  >
                    {isDark ? (
                      <Sun className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Moon className="w-4 h-4 text-slate-600" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsMobileOpen(false)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer active:scale-95"
                    aria-label="Close navigation menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Navigation Body */}
              <div
                data-lenis-prevent
                className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-4 custom-scrollbar bg-white dark:bg-slate-950"
                style={{
                  backgroundColor: isDark ? "#020617" : "#ffffff",
                }}
              >
                {/* Top Slideable Quick Action Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar -mx-1 px-1">
                  {exploreEnabled && (
                    <button
                      onClick={() => {
                        setIsMobileOpen(false);
                        handleExploreClick();
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300/80 dark:border-emerald-700/60 flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95 transition-transform cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>🧭 {exploreLabel}</span>
                    </button>
                  )}
                  <a
                    href="https://dpsivr.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMobileOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800/60 flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95 transition-transform"
                  >
                    <span>🌐 360 View</span>
                    <span className="text-[11px] opacity-70">↗</span>
                  </a>
                  <a
                    href="https://dpsindp.schoolforschools.ai/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMobileOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300/70 dark:border-amber-700/60 flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95 transition-transform"
                  >
                    <span>⚡ SchoolsOS Login</span>
                    <span className="text-[11px] opacity-70">↗</span>
                  </a>
                </div>

                {/* Navigation Links with generous tap targets */}
                <motion.div
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={{
                    open: { transition: { staggerChildren: 0.03, delayChildren: 0.02 } },
                    closed: { transition: { staggerChildren: 0.02, staggerDirection: -1 } }
                  }}
                  className="space-y-1 pt-1"
                >
                  {activeNavItems.map((link) => {
                    const isActive = location.pathname === link.href;
                    return (
                      <motion.div
                        key={link.label}
                        variants={{
                          open: { opacity: 1, x: 0 },
                          closed: { opacity: 0, x: -8 }
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link
                          to={link.href}
                          onClick={() => setIsMobileOpen(false)}
                          onMouseEnter={() => preloadRoute(link.href)}
                          onTouchStart={() => preloadRoute(link.href)}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.99] touch-manipulation ${
                            isActive
                              ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 shadow-xs"
                              : "text-slate-800 dark:text-slate-100 hover:text-emerald-700 hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
                          }`}
                        >
                          <span>{link.label}</span>
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        </Link>
                        {link.children && (
                          <div className="pl-4 pr-2 py-1 space-y-1">
                            {link.children.map((child: any) => (
                              <Link
                                key={child.label}
                                to={child.href}
                                onClick={() => setIsMobileOpen(false)}
                                onMouseEnter={() => preloadRoute(child.href)}
                                onTouchStart={() => preloadRoute(child.href)}
                                className="block px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors touch-manipulation"
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Interactive Quick Highlights with hover animations */}
                <div className="pt-3 mt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                  <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Explore Key Portals</span>
                  </p>
                  <InteractiveHoverLinks onLinkClick={() => setIsMobileOpen(false)} />
                </div>

                {/* Accreditations at Drawer Bottom */}
                {showInternationalLogo && (
                  <div className="pt-4 mt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3 px-2 shrink-0">
                    <img
                      src={internationalLogoUrl}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes("/images/dps/international_logo.webp")) {
                          target.src = "/images/dps/international_logo.webp";
                        }
                      }}
                      alt="British Council International Dimension in Schools"
                      className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded drop-shadow-xs shrink-0"
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
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full-Screen Interactive Hover Links Modal - rendered at body level with top z-index (z-[9999]) */}
      <AnimatePresence>
        {isExploreOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/80 backdrop-blur-md overflow-hidden"
          >
            {/* Backdrop click to dismiss */}
            <div
              className="fixed inset-0 -z-10 cursor-pointer"
              onClick={() => setIsExploreOpen(false)}
              aria-hidden="true"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col my-auto overflow-hidden text-slate-900 dark:text-white"
            >
              {/* Header with close button - Fixed at top, distinct from scrollable links */}
              <div className="flex items-center justify-between px-6 sm:px-10 py-5 sm:py-6 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-center shrink-0">
                    <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      Interactive Campus Directory
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Hover over any section to reveal immersive imagery and quick links
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExploreOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer active:scale-95 shrink-0"
                  aria-label="Close explore modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Interactive Links Container - Scrollable without visible scrollbar bar */}
              <div data-lenis-prevent className="overflow-y-auto max-h-[calc(85vh-100px)] px-6 sm:px-10 py-3 sm:py-5 no-scrollbar flex-1">
                <InteractiveHoverLinks onLinkClick={() => setIsExploreOpen(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}