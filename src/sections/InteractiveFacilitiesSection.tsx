import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  Cpu,
  Waves,
  FlaskConical,
  BookOpen,
  Trophy,
  GraduationCap,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Music,
  Palette,
  Dumbbell,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FlowArt, { FlowSection } from "@/components/ui/story-scroll";
import { trpc } from "@/providers/trpc";
import { optimizeMediaUrl } from "@/lib/mediaUtils";

interface FacilityItem {
  id: string;
  name: string;
  category: string;
  subBadge?: string;
  icon: React.ComponentType<{ className?: string }>;
  image: string;
  tagline: string;
  description: string;
  highlights: string[];
  metrics: { value: string; label: string }[];
  videoUrl?: string;
}

const FACILITIES_FALLBACK: FacilityItem[] = [
  {
    id: "ai-lab",
    name: "AI & Humanoid Robotics Lab",
    category: "STEM & Future Technologies",
    subBadge: "NITI Aayog Atal Tinkering Lab Certified",
    icon: Cpu,
    image: "/images/facilities/ai_robotics_lab.webp",
    tagline: "Next-Gen Innovation Incubator",
    description:
      "A state-of-the-art innovation incubator certified under Atal Innovation Mission, equipped with 3D rapid prototyping, humanoid robotics kits, drone simulation rigs, and dedicated Python & ROS programming workstations.",
    highlights: [
      "Hands-on AI, Machine Learning & Robotics curriculum",
      "National Robotics Championship accredited training arena",
      "3D rapid prototyping and multi-sensor toolkits",
    ],
    metrics: [
      { value: "50+", label: "AI Workstations" },
      { value: "100%", label: "Practical Immersion" },
      { value: "15+", label: "National Laurels" },
    ],
  },
  {
    id: "sports-aquatic",
    name: "Olympic Aquatics & Sports Complex",
    category: "Athletics & Physical Mastery",
    subBadge: "25m Competition Pool • All-Weather Heated",
    icon: Waves,
    image: "/images/facilities/swimming_pool.webp",
    tagline: "World-Class Athletic & Heated Aquatic Arenas",
    description:
      "All-weather heated half-Olympic 25m competition pool paired with floodlit synthetic tennis, basketball, squash courts, cricket practice nets with automated bowling machines, and indoor wooden badminton arenas.",
    highlights: [
      "Half-Olympic 25m heated pool with certified FINA lifesavers",
      "Synthetic tennis, basketball & indoor wooden badminton courts",
      "Cricket nets with high-speed automated bowling machines",
    ],
    metrics: [
      { value: "25m", label: "Heated Pool" },
      { value: "8+", label: "Sports Arenas" },
      { value: "100%", label: "NIS Coaches" },
    ],
  },
  {
    id: "science",
    name: "Research-Grade Science Labs",
    category: "Experiential Sciences & STEAM",
    subBadge: "Exceeds CBSE Experimental Standards",
    icon: FlaskConical,
    image: "/images/facilities/science_lab.webp",
    tagline: "Specialized Senior Experimental Laboratories",
    description:
      "Dedicated experimental suites for Physics, Chemistry, Biology, and Biotechnology provide every learner with an individual station featuring German optical microscopes, analytical sensors, chemical fume hoods, and automated eye-wash stations.",
    highlights: [
      "Individual workstations ensuring direct hands-on experimental validation",
      "High-precision digital measuring instruments and spectrophotometers",
      "Exceeds CBSE safety protocols with automated emergency showers",
    ],
    metrics: [
      { value: "4", label: "Dedicated Labs" },
      { value: "1:1", label: "Student Apparatus" },
      { value: "Zero", label: "Safety Incidents" },
    ],
  },
  {
    id: "performing-arts",
    name: "Acoustic Auditorium & Arts Atelier",
    category: "Creative Arts & Performance",
    subBadge: "Acoustically Engineered • 1,200 Seats",
    icon: Music,
    image: "/images/facilities/auditorium.webp",
    tagline: "Acoustically Tuned Studios for Fine & Performing Arts",
    description:
      "Acoustically engineered 1,200-seat auditorium with 4K projection paired with soundproofed rehearsal studios equipped with grand pianos, orchestral instruments, Indian classical stations, and studio-grade sound recording consoles.",
    highlights: [
      "1,200-seat sound-engineered main auditorium with 4K projection",
      "Soundproofed acoustic recording and audio mastering suite",
      "Classical Indian & Western orchestral instrument stations",
    ],
    metrics: [
      { value: "1,200+", label: "Auditorium Seats" },
      { value: "30+", label: "Instruments" },
      { value: "100%", label: "Acoustic Treated" },
    ],
  },
  {
    id: "smart-classes",
    name: "Smart Digital Classrooms & Safe Campus",
    category: "Digital Pedagogy & Campus Safety",
    subBadge: "350+ AI Surveillance Nodes • 100% AC Fleet",
    icon: GraduationCap,
    image: "/images/facilities/smart_classroom.webp",
    tagline: "Ergonomic Smart Digital Learning Suites",
    description:
      "Acoustically treated, air-conditioned smart classrooms equipped with 4K touch displays, ergonomic furniture, 350+ AI-CCTV cameras, and 100% air-conditioned GPS-monitored student transport fleet.",
    highlights: [
      "Interactive 4K digital flat panels with cloud lecture sync",
      "Ergonomic seating designed for optimal student posture",
      "350+ AI security cameras & 100% GPS AC transport fleet",
    ],
    metrics: [
      { value: "100%", label: "Digitized Rooms" },
      { value: "4K", label: "Interactive Touch" },
      { value: "350+", label: "AI CCTV Nodes" },
    ],
  },
];

const ICON_LOOKUP: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu,
  Waves,
  FlaskConical,
  BookOpen,
  Trophy,
  GraduationCap,
  Microscope: FlaskConical,
  Music,
  Palette,
  Dumbbell,
  ShieldCheck,
  Default: Sparkles,
};

const CARD_THEMES = [
  {
    bg: "#F8FAFc", // slate-50
    isDark: false,
    textColor: "text-slate-900",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    catColor: "text-emerald-700",
    tagBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    btnPrimary: "bg-emerald-600 hover:bg-emerald-500 text-white font-bold",
    btnOutline: "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
    metricColor: "text-emerald-700",
    subTextColor: "text-slate-600",
    descColor: "text-slate-600",
    highlightTextColor: "text-slate-800",
    checkColor: "text-emerald-600",
    borderTop: "border-slate-200",
    imgBorder: "border-slate-200",
    defaultSubBadge: "NITI Aayog Atal Tinkering Lab Certified",
    scrollHintColor: "text-slate-400",
  },
  {
    bg: "#F0F9FF", // sky-50
    isDark: false,
    textColor: "text-slate-900",
    badgeBg: "bg-sky-100 text-sky-800 border-sky-200",
    catColor: "text-sky-800",
    tagBg: "bg-sky-100 text-sky-800 border-sky-200",
    btnPrimary: "bg-sky-600 hover:bg-sky-500 text-white font-bold",
    btnOutline: "border-sky-200 text-sky-800 hover:bg-sky-50",
    metricColor: "text-sky-800",
    subTextColor: "text-slate-600",
    descColor: "text-slate-600",
    highlightTextColor: "text-slate-800",
    checkColor: "text-sky-600",
    borderTop: "border-sky-200",
    imgBorder: "border-sky-200",
    defaultSubBadge: "25m Competition Pool • All-Weather Heated",
    scrollHintColor: "text-slate-400",
  },
  {
    bg: "#FFFBEB", // amber-50
    isDark: false,
    textColor: "text-slate-900",
    badgeBg: "bg-amber-100 text-amber-900 border-amber-200",
    catColor: "text-amber-900",
    tagBg: "bg-amber-100 text-amber-900 border-amber-200",
    btnPrimary: "bg-amber-600 hover:bg-amber-500 text-white font-bold",
    btnOutline: "border-amber-200 text-amber-800 hover:bg-amber-50",
    metricColor: "text-amber-900",
    subTextColor: "text-slate-700",
    descColor: "text-slate-700",
    highlightTextColor: "text-slate-800",
    checkColor: "text-emerald-600",
    borderTop: "border-amber-200",
    imgBorder: "border-amber-200",
    defaultSubBadge: "Exceeds CBSE Experimental Standards",
    scrollHintColor: "text-slate-500",
  },
  {
    bg: "#FAF5FF", // fuchsia-50
    isDark: false,
    textColor: "text-slate-900",
    badgeBg: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
    catColor: "text-fuchsia-800",
    tagBg: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
    btnPrimary: "bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold",
    btnOutline: "border-fuchsia-200 text-fuchsia-800 hover:bg-fuchsia-50",
    metricColor: "text-fuchsia-800",
    subTextColor: "text-slate-600",
    descColor: "text-slate-600",
    highlightTextColor: "text-slate-800",
    checkColor: "text-fuchsia-600",
    borderTop: "border-fuchsia-200",
    imgBorder: "border-fuchsia-200",
    defaultSubBadge: "1,200 Seats • Acoustic Sound Engineering",
    scrollHintColor: "text-slate-400",
  },
  {
    bg: "#EEF2FF", // indigo-50
    isDark: false,
    textColor: "text-slate-900",
    badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-200",
    catColor: "text-indigo-800",
    tagBg: "bg-indigo-100 text-indigo-800 border-indigo-200",
    btnPrimary: "bg-indigo-600 hover:bg-indigo-500 text-white font-bold",
    btnOutline: "border-indigo-200 text-indigo-800 hover:bg-indigo-50",
    metricColor: "text-indigo-800",
    subTextColor: "text-slate-600",
    descColor: "text-slate-600",
    highlightTextColor: "text-slate-800",
    checkColor: "text-indigo-600",
    borderTop: "border-indigo-200",
    imgBorder: "border-indigo-200",
    defaultSubBadge: "AI & Cybersecurity Lab",
    scrollHintColor: "text-slate-400",
  },
];

export default function InteractiveFacilitiesSection() {
  // Cached facilities for zero-latency instant hydration
  const [cachedFacilities, setCachedFacilities] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("dpsi_cached_facilities");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [];
  });

  const { data: cmsFacilities } = trpc.cms.listFacilities.useQuery(undefined, {
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (cmsFacilities && cmsFacilities.length > 0 && typeof window !== "undefined") {
      try {
        localStorage.setItem("dpsi_cached_facilities", JSON.stringify(cmsFacilities));
        setCachedFacilities(cmsFacilities);
      } catch {}
    }
  }, [cmsFacilities]);

  const rawFacilities =
    cmsFacilities && cmsFacilities.length > 0 ? cmsFacilities : cachedFacilities;

  // Combine live MongoDB facilities with rich templates (100% admin-editable)
  const facilities: FacilityItem[] =
    rawFacilities && rawFacilities.length > 0
      ? rawFacilities
          .filter((f: any) => !f.isDeleted && f.isActive !== false)
          .map((f: any, idx: number) => {
            const fallback = FACILITIES_FALLBACK[idx % FACILITIES_FALLBACK.length];
            const IconComp = ICON_LOOKUP[f.icon] || fallback?.icon || Sparkles;
            const theme = CARD_THEMES[idx % CARD_THEMES.length];
            return {
              id: f._id?.toString() || f.id || `fac-${idx}`,
              name: f.title || fallback?.name,
              category: f.category || fallback?.category || "Campus Facility",
              subBadge: f.subBadge || fallback?.subBadge || theme?.defaultSubBadge,
              icon: IconComp,
              image: f.imageUrl ? optimizeMediaUrl(f.imageUrl, { preset: "card" }) : (fallback?.image || "/images/facilities/ai_robotics_lab.webp"),
              tagline: f.tagline || fallback?.tagline || "World-Class Learning Environment",
              description: f.description || fallback?.description || "",
              highlights:
                Array.isArray(f.highlights) && f.highlights.length > 0
                  ? f.highlights
                  : fallback?.highlights || [],
              metrics:
                Array.isArray(f.metrics) && f.metrics.length > 0
                  ? f.metrics
                  : fallback?.metrics || [
                      { value: "100%", label: "Hands-on Practical" },
                      { value: "A+", label: "Safety Rating" },
                    ],
              videoUrl: f.videoUrl,
            };
          })
      : FACILITIES_FALLBACK;

  const displayCards = facilities.slice(0, 5);

  return (
    <section
      id="interactive-facilities"
      className="bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white relative border-none"
    >
      {/* Editorial Section Header (Light Theme & Centered) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Eyebrow Badge — Clean, no icons/logos */}
          <div className="flex items-center justify-center mb-4">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/20 shadow-xs">
              World-Class Infrastructure & Learning Ecosystems
            </span>
          </div>

          {/* Main Title */}
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
            Architected for{" "}
            <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-800 dark:from-emerald-400 dark:via-teal-300 dark:to-amber-300 bg-clip-text text-transparent">
              Curiosity & Excellence
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg md:text-xl font-normal max-w-3xl mx-auto leading-relaxed mb-6">
            Immerse yourself in our premier educational facilities, research laboratories, and athletic arenas designed to inspire holistic leadership at Delhi Public School Indirapuram.
          </p>

          {/* Direct Action Link */}
          <div className="flex items-center justify-center">
            <Button
              className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold px-5 py-2.5 h-auto shadow-sm transition-all hover:scale-105 cursor-pointer"
              asChild
            >
              {typeof window !== "undefined" && window.location.pathname.startsWith("/facilities") ? (
                <a href="#all-facilities">
                  View All 12+ Facilities <ArrowUpRight className="w-4 h-4 ml-1.5" />
                </a>
              ) : (
                <Link to="/facilities">
                  View All 12+ Facilities <ArrowUpRight className="w-4 h-4 ml-1.5" />
                </Link>
              )}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* 3D PARALLAX STORY FLOW (GSAP ScrollTrigger Powered) — Matching Image 1 */}
      <FlowArt
        as="div"
        aria-label="DPS Indirapuram World-Class Facilities Showcase"
        className="relative w-full border-none shadow-none"
      >
        {displayCards.map((facility, idx) => {
          const theme = CARD_THEMES[idx % CARD_THEMES.length];
          const IconComp = facility.icon || Sparkles;
          const stepNum = `0${idx + 1} / 0${displayCards.length}`;

          return (
            <FlowSection
              key={`fac-card-${idx}`}
              aria-label={`${stepNum} ${facility.name}`}
              style={{ backgroundColor: theme.bg }}
              className="border-none shadow-none outline-none"
            >
              {/* Card Top Row */}
              <div className={`flex flex-wrap items-center justify-between gap-2 sm:gap-3 pb-2 sm:pb-3 border-b ${theme.borderTop}`}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span
                    className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full font-mono text-[11px] sm:text-xs font-black tracking-widest border ${theme.badgeBg}`}
                  >
                    {stepNum}
                  </span>
                  <span className={`text-[11px] sm:text-sm font-bold uppercase tracking-wider ${theme.catColor}`}>
                    {facility.category}
                  </span>
                </div>
                <div className={`flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold ${theme.subTextColor}`}>
                  <IconComp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${theme.catColor}`} />
                  <span className="truncate max-w-[160px] sm:max-w-none">{facility.subBadge || theme.defaultSubBadge}</span>
                </div>
              </div>

              {/* Main Stage Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-10 items-center my-auto py-1 sm:py-4">
                {/* Left Column: Visual Showcase */}
                <div className="lg:col-span-7 relative group">
                  <div className={`relative aspect-[18/9] sm:aspect-[16/9] lg:aspect-[16/10] max-h-[170px] sm:max-h-[250px] lg:max-h-none rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border ${theme.imgBorder} ${theme.isDark ? 'bg-slate-900' : 'bg-white'}`}>
                    <img
                      src={facility.image}
                      alt={facility.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading={idx === 0 ? "eager" : "lazy"}
                      decoding="async"
                      fetchPriority={idx === 0 ? "high" : "auto"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                    {/* Floating Highlights Badges */}
                    <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 flex flex-wrap gap-1.5 sm:gap-2">
                      {facility.highlights.slice(0, 2).map((hl, hIdx) => (
                        <span
                          key={hIdx}
                          className="px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-950/85 text-white text-[10px] sm:text-xs font-bold border border-white/20 shadow-xs"
                        >
                          {hl}
                        </span>
                      ))}
                    </div>

                    <div className="absolute bottom-2 left-2.5 right-2.5 sm:bottom-4 sm:left-4 sm:right-4 flex items-center justify-between text-white">
                      <div className="min-w-0 pr-2">
                        <p className={`text-[10px] sm:text-xs font-semibold uppercase tracking-widest ${theme.catColor} truncate`}>
                          {facility.category}
                        </p>
                        <p className="text-sm sm:text-xl font-black truncate">{facility.tagline}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg bg-slate-950/75 text-white text-[10px] sm:text-xs font-bold border border-white/25 shrink-0">
                        <ShieldCheck className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${theme.catColor}`} /> Certified
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Editorial Copy */}
                <div className={`lg:col-span-5 flex flex-col justify-center ${theme.textColor}`}>
                  <div
                    className={`inline-flex items-center gap-1.5 sm:gap-2 w-max px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 sm:mb-3 border ${theme.tagBg}`}
                  >
                    <IconComp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="truncate max-w-[240px] sm:max-w-none">{facility.subBadge || facility.tagline}</span>
                  </div>

                  <h3 className={`text-xl sm:text-3xl lg:text-5xl font-black tracking-tight leading-[1.12] sm:leading-[1.08] mb-1.5 sm:mb-4 ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
                    {facility.name}
                  </h3>

                  <p className={`text-xs sm:text-sm lg:text-base leading-relaxed mb-2.5 sm:mb-6 font-normal ${theme.descColor} line-clamp-2 sm:line-clamp-3 lg:line-clamp-none`}>
                    {facility.description}
                  </p>

                  {/* Key Highlights */}
                  <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-6">
                    {facility.highlights.slice(0, 3).map((item, i) => (
                      <div key={i} className={`flex items-start gap-2 text-xs sm:text-sm ${theme.highlightTextColor} ${i >= 2 ? 'hidden sm:flex' : 'flex'}`}>
                        <CheckCircle2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${theme.checkColor} shrink-0 mt-0.5`} />
                        <span className="font-semibold line-clamp-1 sm:line-clamp-none">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Row */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Button
                      className={`${theme.btnPrimary} font-bold px-3.5 sm:px-5 py-1.5 sm:py-2.5 h-8 sm:h-auto text-xs sm:text-sm rounded-xl shadow-md cursor-pointer`}
                      asChild
                    >
                      <Link to="/facilities">
                        View Facility Specs <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className={`${theme.btnOutline} rounded-xl font-semibold h-8 sm:h-auto text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2.5 cursor-pointer`}
                      asChild
                    >
                      <Link to="/admissions">Admissions Enquiry</Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Metrics & Scroll Guidance */}
              <div className={`flex flex-wrap items-center justify-between gap-2 sm:gap-4 pt-2 sm:pt-3 border-t ${theme.borderTop} ${theme.textColor}`}>
                <div className="flex flex-wrap gap-4 sm:gap-8">
                  {facility.metrics.map((metric, mIdx) => (
                    <div key={mIdx}>
                      <p className={`text-base sm:text-xl lg:text-2xl font-black ${theme.metricColor}`}>
                        {metric.value}
                      </p>
                      <p className={`text-[9px] sm:text-[11px] font-medium uppercase tracking-wider ${theme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>

                {idx < displayCards.length - 1 && (
                  <div className={`flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold ${theme.scrollHintColor} animate-bounce`}>
                    <span>Scroll to explore {displayCards[idx + 1]?.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                  </div>
                )}
              </div>
            </FlowSection>
          );
        })}
      </FlowArt>
    </section>
  );
}
