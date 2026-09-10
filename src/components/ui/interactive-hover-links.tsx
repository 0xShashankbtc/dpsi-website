import { useMotionValue, motion, useSpring, useTransform } from "framer-motion";
import React, { useRef } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { trpc } from "@/providers/trpc";

export interface InteractiveLinkItem {
  heading: string;
  subheading: string;
  imgSrc: string;
  href: string;
}

interface InteractiveHoverLinksProps {
  links?: InteractiveLinkItem[];
  className?: string;
  onLinkClick?: () => void;
}

export function InteractiveHoverLinks({
  links,
  className = "",
  onLinkClick,
}: InteractiveHoverLinksProps) {
  const { data: dbMenus } = trpc.cms.listMenus.useQuery({ location: "header" });
  const { data: siteSettings } = trpc.cms.getSiteSettings.useQuery();

  // If custom links were passed via props, use them
  // Otherwise build dynamic links combining DB menus & site settings, with curated fallbacks
  const resolvedLinks: InteractiveLinkItem[] = (() => {
    if (links && links.length > 0) return links;

    // Check if 360 tour URL is configured in DB site settings
    const view360Url = siteSettings?.find((s: any) => s.key === "view_360_url")?.value?.trim() || "https://dpsivr.vercel.app";
    const view360Enabled = siteSettings?.find((s: any) => s.key === "view_360_enabled")?.value !== "false";

    const baseList: InteractiveLinkItem[] = [
      {
        heading: "Academics",
        subheading: "CBSE curriculum, STEM, results & scholastic honors",
        imgSrc: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop",
        href: "/academics",
      },
      {
        heading: "Admissions",
        subheading: "Enrollment criteria, registration & fee structure 2026-27",
        imgSrc: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop",
        href: "/admissions",
      },
      {
        heading: "Campus Life",
        subheading: "World-class robotics labs, sports complex & smart classrooms",
        imgSrc: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop",
        href: "/facilities",
      },
      {
        heading: "News & Events",
        subheading: "School milestones, annual concerts & athletic championships",
        imgSrc: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop",
        href: "/news-events",
      },
    ];

    if (view360Enabled) {
      baseList.push({
        heading: "360 Virtual Tour",
        subheading: "Immersive VR walkthrough of the entire school campus",
        imgSrc: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop",
        href: view360Url,
      });
    }

    return baseList;
  })();

  return (
    <section className={`bg-transparent p-2 md:p-6 w-full ${className}`}>
      <div className="mx-auto max-w-5xl">
        {resolvedLinks.map((link) => (
          <LinkItem key={link.heading} {...link} onLinkClick={onLinkClick} />
        ))}
      </div>
    </section>
  );
}

interface LinkItemProps {
  heading: string;
  imgSrc: string;
  subheading: string;
  href: string;
  onLinkClick?: () => void;
}

function LinkItem({ heading, imgSrc, subheading, href, onLinkClick }: LinkItemProps) {
  const ref = useRef<HTMLAnchorElement | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 220, damping: 28 });
  const mouseYSpring = useSpring(y, { stiffness: 220, damping: 28 });

  const top = useTransform(mouseYSpring, [0.5, -0.5], ["30%", "70%"]);
  const left = useTransform(mouseXSpring, [0.5, -0.5], ["70%", "30%"]);
  const rotate = useTransform(mouseXSpring, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const isExternal = href.startsWith("http");

  const Content = (
    <>
      <div className="relative z-10 py-1 flex-1 pr-4">
        <motion.span
          variants={{
            initial: { x: 0 },
            whileHover: { x: -6 },
          }}
          transition={{
            type: "spring",
            staggerChildren: 0.035,
            delayChildren: 0.05,
            damping: 24,
            stiffness: 280,
          }}
          className="relative z-10 block text-2xl font-black text-slate-800 dark:text-slate-100 transition-colors duration-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 sm:text-3xl md:text-5xl tracking-tight leading-tight"
        >
          {heading.split("").map((l, i) => (
            <motion.span
              variants={{
                initial: { x: 0 },
                whileHover: { x: 6 },
              }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="inline-block"
              key={i}
            >
              {l === " " ? "\u00A0" : l}
            </motion.span>
          ))}
        </motion.span>
        <span className="relative z-10 mt-1.5 block text-xs sm:text-sm md:text-base font-medium text-slate-500 dark:text-slate-400 transition-colors duration-300 group-hover:text-slate-900 dark:group-hover:text-slate-200">
          {subheading}
        </span>
      </div>

      {/* Floating Realistic Preview Card */}
      <motion.div
        style={{
          top,
          left,
          rotate,
          translateX: "-20%",
          translateY: "-50%",
        }}
        variants={{
          initial: { scale: 0.8, opacity: 0, y: 10 },
          whileHover: { scale: 1, opacity: 1, y: 0 },
        }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="pointer-events-none absolute z-20 h-28 w-44 sm:h-36 sm:w-56 md:h-44 md:w-68 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10 dark:ring-white/15 bg-slate-900"
      >
        <img
          src={imgSrc}
          className="w-full h-full object-cover"
          alt={`Image representing ${heading}`}
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <span className="absolute bottom-2.5 left-3 text-[11px] font-bold text-white uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-xs border border-white/20">
          {heading}
        </span>
      </motion.div>

      <div className="overflow-hidden shrink-0 relative z-10">
        <motion.div
          variants={{
            initial: {
              x: "60%",
              opacity: 0,
            },
            whileHover: {
              x: "0%",
              opacity: 1,
            },
          }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className="p-2 sm:p-4"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm group-hover:scale-105 transition-transform">
            <ArrowRight className="size-5 sm:size-6" />
          </div>
        </motion.div>
      </div>
    </>
  );

  const sharedClasses =
    "group relative flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 py-3.5 sm:py-4 md:py-5 transition-colors duration-300 hover:border-emerald-600 dark:hover:border-emerald-400 cursor-pointer select-none";

  if (isExternal) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        ref={ref}
        onClick={onLinkClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          x.set(0);
          y.set(0);
        }}
        initial="initial"
        whileHover="whileHover"
        className={sharedClasses}
      >
        {Content}
      </motion.a>
    );
  }

  return (
    <motion.div
      ref={ref as any}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      initial="initial"
      whileHover="whileHover"
    >
      <Link to={href} onClick={onLinkClick} className={sharedClasses}>
        {Content}
      </Link>
    </motion.div>
  );
}

export const INTERACTIVE_LINKS: InteractiveLinkItem[] = [
  {
    heading: "Academics",
    subheading: "CBSE curriculum, STEM, results & scholastic honors",
    imgSrc:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop",
    href: "/academics",
  },
  {
    heading: "Admissions",
    subheading: "Enrollment criteria, registration & fee structure 2026-27",
    imgSrc:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop",
    href: "/admissions",
  },
  {
    heading: "Campus Life",
    subheading: "World-class robotics labs, sports complex & smart classrooms",
    imgSrc:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop",
    href: "/facilities",
  },
  {
    heading: "News & Events",
    subheading: "School milestones, annual concerts & athletic championships",
    imgSrc:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop",
    href: "/news-events",
  },
  {
    heading: "360 Virtual Tour",
    subheading: "Immersive VR walkthrough of the entire school campus",
    imgSrc:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop",
    href: "https://dpsivr.vercel.app",
  },
];
