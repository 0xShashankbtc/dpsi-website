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

interface FacilityItem {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  image: string;
  tagline: string;
  description: string;
  highlights: string[];
  metrics: { value: string; label: string }[];
}

const FACILITIES_FALLBACK: FacilityItem[] = [
  {
    id: "ai-lab",
    name: "AI & Humanoid Robotics Lab",
    category: "STEM & Future Technologies",
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
    bg: "#F0FDF4", // Soft emerald mist
    badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-300",
    catColor: "text-emerald-700",
    tagBg: "bg-emerald-100/90 text-emerald-900 border-emerald-200",
    btnPrimary: "bg-emerald-800 hover:bg-emerald-900 text-white",
    btnOutline: "border-emerald-300 text-emerald-900 hover:bg-emerald-100/60",
    metricColor: "text-emerald-800",
    defaultSubBadge: "NITI Aayog Atal Tinkering Lab Certified",
  },
  {
    bg: "#F0F9FF", // Soft sky breeze
    badgeBg: "bg-sky-100 text-sky-900 border-sky-300",
    catColor: "text-sky-700",
    tagBg: "bg-sky-100/90 text-sky-900 border-sky-200",
    btnPrimary: "bg-sky-800 hover:bg-sky-900 text-white",
    btnOutline: "border-sky-300 text-sky-900 hover:bg-sky-100/60",
    metricColor: "text-sky-800",
    defaultSubBadge: "25m Competition Pool • All-Weather Heated",
  },
  {
    bg: "#FFFBEB", // Soft warm cream
    badgeBg: "bg-amber-100 text-amber-900 border-amber-300",
    catColor: "text-amber-800",
    tagBg: "bg-amber-100/90 text-amber-900 border-amber-200",
    btnPrimary: "bg-amber-900 hover:bg-amber-950 text-white",
    btnOutline: "border-amber-300 text-amber-900 hover:bg-amber-100/60",
    metricColor: "text-amber-900",
    defaultSubBadge: "Exceeds CBSE Experimental Standards",
  },
  {
    bg: "#FAF5FF", // Soft lavender elegance
    badgeBg: "bg-purple-100 text-purple-900 border-purple-300",
    catColor: "text-purple-700",
    tagBg: "bg-purple-100/90 text-purple-900 border-purple-200",
    btnPrimary: "bg-purple-900 hover:bg-purple-950 text-white",
    btnOutline: "border-purple-300 text-purple-900 hover:bg-purple-100/60",
    metricColor: "text-purple-900",
    defaultSubBadge: "Acoustic Treated • Steinway Grand Piano",
  },
  {
    bg: "#F8FAFC", // Crisp modern slate
    badgeBg: "bg-slate-200 text-slate-900 border-slate-300",
    catColor: "text-slate-700",
    tagBg: "bg-slate-200/90 text-slate-800 border-slate-300",
    btnPrimary: "bg-slate-900 hover:bg-slate-800 text-white",
    btnOutline: "border-slate-300 text-slate-800 hover:bg-slate-200/60",
    metricColor: "text-slate-900",
    defaultSubBadge: "350+ AI Surveillance Nodes • 100% AC Fleet",
  },
];

export default function InteractiveFacilitiesSection() {
  const { data: cmsFacilities } = trpc.cms.listFacilities.useQuery();

  // Combine live MongoDB facilities with rich templates (100% admin-editable)
  const facilities: FacilityItem[] =
    cmsFacilities && cmsFacilities.length > 0
      ? cmsFacilities
          .filter((f: any) => !f.isDeleted && f.isActive !== false)
          .map((f: any, idx: number) => {
            const fallback = FACILITIES_FALLBACK[idx % FACILITIES_FALLBACK.length];
            const IconComp = ICON_LOOKUP[f.icon] || fallback?.icon || Sparkles;
            return {
              id: f._id?.toString() || f.id || `fac-${idx}`,
              name: f.title || fallback?.name,
              category: f.category || fallback?.category || "Campus Facility",
              icon: IconComp,
              image: f.imageUrl || fallback?.image || "/images/facilities/ai_robotics_lab.webp",
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
          {/* Eyebrow Badge — No emojis */}
          <div className="flex items-center justify-center mb-4">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/20 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
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

          {/* Direct Action Link — No mode switcher toggle */}
          <div className="flex items-center justify-center">
            <Button
              className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold px-5 py-2.5 h-auto shadow-sm transition-all hover:scale-105 cursor-pointer"
              asChild
            >
              <Link to="/facilities">
                View All 12+ Facilities <ArrowUpRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* 3D PARALLAX STORY FLOW (GSAP ScrollTrigger Powered) — No borders, light colors, zero line artifacts */}
      <FlowArt
        as="div"
        aria-label="DPS Indirapuram World-Class Facilities Showcase"
        className="relative w-full border-none shadow-none"
      >
        {displayCards.map((facility, idx) => {
          const theme = CARD_THEMES[idx % CARD_THEMES.length];
          const IconComp = facility.icon || theme.defaultIcon;
          const stepNum = `0${idx + 1} / 0${displayCards.length}`;

          return (
            <FlowSection
              key={facility.id || idx}
              aria-label={`${stepNum} ${facility.name}`}
              style={{ backgroundColor: theme.bg, color: "#0F172A" }}
              className="border-none shadow-none outline-none"
            >
              {/* Card Top Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full font-mono text-xs font-black tracking-widest border ${theme.badgeBg}`}
                  >
                    {stepNum}
                  </span>
                  <span className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${theme.catColor}`}>
                    {facility.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <IconComp className={`w-4 h-4 ${theme.catColor}`} />
                  <span>{theme.defaultSubBadge}</span>
                </div>
              </div>

              {/* Main Stage Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center my-auto py-4">
                {/* Left Column: Visual Showcase */}
                <div className="lg:col-span-7 relative group">
                  <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-white">
                    <img
                      src={facility.image}
                      alt={facility.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                    {/* Floating Highlights Badges */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      {facility.highlights.slice(0, 2).map((hl, hIdx) => (
                        <span
                          key={hIdx}
                          className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/20"
                        >
                          {hl}
                        </span>
                      ))}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">
                          {facility.category}
                        </p>
                        <h4 className="text-lg sm:text-xl font-black">{facility.tagline}</h4>
                      </div>
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20 text-white text-xs font-bold backdrop-blur-sm border border-white/30">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Certified
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Editorial Copy */}
                <div className="lg:col-span-5 flex flex-col justify-center text-slate-900">
                  <div
                    className={`inline-flex items-center gap-2 w-max px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-3 border ${theme.tagBg}`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    <span>{facility.tagline}</span>
                  </div>

                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.08] text-slate-900 mb-4">
                    {facility.name}
                  </h3>

                  <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                    {facility.description}
                  </p>

                  {/* Key Highlights */}
                  <div className="space-y-2.5 mb-6">
                    {facility.highlights.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-semibold">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Row */}
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      className={`${theme.btnPrimary} font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer`}
                      asChild
                    >
                      <Link to="/facilities">
                        View Facility Specs <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className={`${theme.btnOutline} rounded-xl font-semibold cursor-pointer`}
                      asChild
                    >
                      <Link to="/admissions">Admissions Enquiry</Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Metrics & Scroll Guidance */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 text-slate-900">
                <div className="flex flex-wrap gap-4 sm:gap-8">
                  {facility.metrics.map((metric, mIdx) => (
                    <div key={mIdx}>
                      <p className={`text-xl sm:text-2xl font-black ${theme.metricColor}`}>
                        {metric.value}
                      </p>
                      <p className="text-[11px] font-medium text-slate-600 uppercase tracking-wider">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>

                {idx < displayCards.length - 1 && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 animate-bounce">
                    <span>Scroll to explore {displayCards[idx + 1]?.name}</span>
                    <ChevronRight className="w-4 h-4 rotate-90" />
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
