import { useMotionValue, motion, useSpring, useTransform } from "framer-motion";
import React, { useRef } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

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
  links = INTERACTIVE_LINKS,
  className = "",
  onLinkClick,
}: InteractiveHoverLinksProps) {
  return (
    <section className={`bg-transparent p-2 md:p-6 w-full ${className}`}>
      <div className="mx-auto max-w-5xl">
        {links.map((link) => (
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

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 25 });

  const top = useTransform(mouseYSpring, [0.5, -0.5], ["35%", "65%"]);
  const left = useTransform(mouseXSpring, [0.5, -0.5], ["65%", "35%"]);

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
      <div className="relative z-10 py-1">
        <motion.span
          variants={{
            initial: { x: 0 },
            whileHover: { x: -8 },
          }}
          transition={{
            type: "spring",
            staggerChildren: 0.04,
            delayChildren: 0.1,
          }}
          className="relative z-10 block text-2xl font-black text-slate-800 dark:text-slate-100 transition-colors duration-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 sm:text-3xl md:text-5xl tracking-tight"
        >
          {heading.split("").map((l, i) => (
            <motion.span
              variants={{
                initial: { x: 0 },
                whileHover: { x: 8 },
              }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="inline-block"
              key={i}
            >
              {l === " " ? "\u00A0" : l}
            </motion.span>
          ))}
        </motion.span>
        <span className="relative z-10 mt-1 block text-xs sm:text-sm md:text-base font-medium text-slate-500 dark:text-slate-400 transition-colors duration-300 group-hover:text-slate-900 dark:group-hover:text-slate-200">
          {subheading}
        </span>
      </div>

      <motion.img
        style={{
          top,
          left,
          translateX: "-10%",
          translateY: "-50%",
        }}
        variants={{
          initial: { scale: 0, opacity: 0, rotate: "-10deg" },
          whileHover: { scale: 1, opacity: 1, rotate: "8deg" },
        }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        src={imgSrc}
        className="pointer-events-none absolute z-0 h-24 w-36 rounded-xl object-cover shadow-2xl ring-2 ring-emerald-500/30 md:h-36 md:w-56"
        alt={`Image representing ${heading}`}
        loading="lazy"
      />

      <div className="overflow-hidden shrink-0">
        <motion.div
          variants={{
            initial: {
              x: "100%",
              opacity: 0,
            },
            whileHover: {
              x: "0%",
              opacity: 1,
            },
          }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative z-10 p-2 sm:p-4"
        >
          <ArrowRight className="size-6 text-emerald-600 dark:text-emerald-400 sm:size-8 md:size-10" />
        </motion.div>
      </div>
    </>
  );

  const sharedClasses =
    "group relative flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 py-3 transition-colors duration-300 hover:border-emerald-600 dark:hover:border-emerald-400 md:py-5 cursor-pointer select-none";

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
