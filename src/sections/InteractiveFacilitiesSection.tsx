import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

const FACILITIES_DATA: FacilityItem[] = [
  {
    id: "sports-aquatic",
    name: "Sports & Aquatic Complex",
    category: "Athletics & Swimming",
    icon: Dumbbell,
    image: "/images/facilities/swimming_pool.webp",
    tagline: "World-Class Athletic & Heated Aquatic Arenas",
    description:
      "All-weather heated half-Olympic competition pool paired with floodlit synthetic tennis, basketball, squash courts, cricket practice nets, and indoor wooden badminton arenas.",
    highlights: [
      "Half-Olympic 25m heated pool with certified FINA lifesavers",
      "Synthetic tennis, basketball & indoor wooden badminton courts",
      "Cricket nets with high-speed automated bowling machines",
    ],
    metrics: [
      { value: "25m", label: "Heated Pool" },
      { value: "8+", label: "Sport Disciplines" },
      { value: "100%", label: "NIS Coaches" },
    ],
  },
  {
    id: "digital-knowledge",
    name: "Digital Knowledge",
    category: "Academic Research & Media",
    icon: BookOpen,
    image: "/images/facilities/library.webp",
    tagline: "35,000+ Curated Volumes & Digital Knowledge Repositories",
    description:
      "An expansive, quiet knowledge haven offering digital e-readers, JSTOR scientific archives, RFID smart cataloging, automated checkouts, and silent research pods.",
    highlights: [
      "Automated RFID borrowing & smart digital kiosk",
      "Direct portal access to global JSTOR & scientific journals",
      "Ergonomic silent research carrels with high-speed fiber Wi-Fi",
    ],
    metrics: [
      { value: "35K+", label: "Physical Books" },
      { value: "10K+", label: "E-Journals" },
      { value: "200+", label: "Seating Capacity" },
    ],
  },
  {
    id: "performing-arts",
    name: "Performance Arts & Music Studio",
    category: "Creative Expression",
    icon: Music,
    image: "/images/facilities/music_dance.webp",
    tagline: "Acoustically Tuned Studios for Instrumental & Performing Arts",
    description:
      "Specialized soundproofed rehearsal spaces equipped with grand pianos, orchestral instruments, Indian classical instruments, dance mirrors, and studio-grade sound recording consoles.",
    highlights: [
      "Soundproofed acoustic recording and audio mastering suite",
      "Classical Indian & Western orchestral instrument stations",
      "Sprung-floor dance studio with full-wall rehearsal mirrors",
    ],
    metrics: [
      { value: "100%", label: "Acoustic Treated" },
      { value: "30+", label: "Instruments" },
      { value: "1,200+", label: "Auditorium Seats" },
    ],
  },
  {
    id: "art-craft",
    name: "Art & Craft Studio",
    category: "Visual Design & Crafts",
    icon: Palette,
    image: "/images/facilities/art_craft_studio.webp",
    tagline: "Vibrant Creative Hub for Fine Arts, Pottery & Sculpting",
    description:
      "Sunlit studio fostering creative innovation through canvas painting, clay sculpting with pottery wheels, ceramic kilns, printmaking, and student exhibition galleries.",
    highlights: [
      "Pottery wheels, clay modeling tools, and high-temp ceramic kiln",
      "Easel painting stations with natural daylight skylights",
      "Annual curated student fine arts & design exhibitions",
    ],
    metrics: [
      { value: "40+", label: "Easel Stations" },
      { value: "Electric", label: "Kiln & Wheels" },
      { value: "National", label: "Art Laurels" },
    ],
  },
  {
    id: "ai-lab",
    name: "AI & Robotics Lab",
    category: "STEM & Innovation",
    icon: Cpu,
    image: "/images/facilities/ai_robotics_lab.webp",
    tagline: "Future-Ready Technology Education",
    description:
      "A state-of-the-art innovation incubator equipped with 3D printers, IoT kits, drone simulation rigs, and dedicated Python programming workstations.",
    highlights: [
      "Hands-on AI, Machine Learning & IoT curriculum",
      "National Robotics Championship training arena",
      "3D rapid prototyping and robotics toolkits",
    ],
    metrics: [
      { value: "50+", label: "Workstations" },
      { value: "100%", label: "Hands-on Practical" },
      { value: "15+", label: "STEM Awards" },
    ],
  },
  {
    id: "science",
    name: "Advanced Science Labs",
    category: "Experiential Learning",
    icon: FlaskConical,
    image: "/images/facilities/science_lab.webp",
    tagline: "Research-Grade Experimental Facilities",
    description:
      "Specialized Physics, Chemistry, and Biology laboratories equipped with digital microscopes, sensors, fume hoods, and individual student experiment stations.",
    highlights: [
      "Individual workstations for every student",
      "High-precision digital measuring instruments",
      "Exceeds CBSE safety and experimental standards",
    ],
    metrics: [
      { value: "4", label: "Dedicated Labs" },
      { value: "1:1", label: "Student Apparatus" },
      { value: "Zero", label: "Safety Incidents" },
    ],
  },
  {
    id: "smart-classes",
    name: "Smart Classrooms",
    category: "Digital Pedagogy",
    icon: GraduationCap,
    image: "/images/facilities/smart_classroom.webp",
    tagline: "Interactive Ergonomic Learning Spaces",
    description:
      "Acoustically treated, air-conditioned smart classrooms equipped with 4K touch displays, ergonomic furniture, and high-speed campus fiber networking.",
    highlights: [
      "Interactive 4K interactive digital flat panels",
      "Ergonomic seating designed for student posture",
      "Hybrid learning and digital cloud recording",
    ],
    metrics: [
      { value: "100%", label: "Digitized Rooms" },
      { value: "4K", label: "Interactive Touch" },
      { value: "1:25", label: "Teacher Ratio" },
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
  Default: Sparkles,
};

import { trpc } from "@/providers/trpc";

export default function InteractiveFacilitiesSection() {
  const { data: cmsFacilities } = trpc.cms.listFacilities.useQuery();
  const sliderRef = useRef<HTMLDivElement>(null);

  const facilities: FacilityItem[] =
    cmsFacilities && cmsFacilities.length > 0
      ? cmsFacilities
          .filter((f: any) => !f.isDeleted && f.isActive !== false)
          .map((f: any, idx: number) => {
            const fallback = FACILITIES_DATA[idx % FACILITIES_DATA.length];
            const IconComp = ICON_LOOKUP[f.icon] || fallback?.icon || Sparkles;
            return {
              id: f._id?.toString() || f.id || `fac-${idx}`,
              name: f.title,
              category: f.category || "Campus",
              icon: IconComp,
              image: f.imageUrl || fallback?.image || "/images/facilities/ai_robotics_lab.webp",
              tagline: f.tagline || fallback?.tagline || "World-Class Learning Environment",
              description: f.description || fallback?.description || "",
              highlights: Array.isArray(f.highlights) && f.highlights.length > 0 ? f.highlights : fallback?.highlights || [],
              metrics: Array.isArray(f.metrics) && f.metrics.length > 0 ? f.metrics : fallback?.metrics || [
                { value: "100%", label: "Hands-on Practical" },
                { value: "A+", label: "Safety Rating" },
              ],
            };
          })
      : FACILITIES_DATA;

  const [activeTab, setActiveTab] = useState(facilities[0]?.id || FACILITIES_DATA[0].id);
  const activeFacility = facilities.find((f) => f.id === activeTab) || facilities[0] || FACILITIES_DATA[0];
  const IconComponent = activeFacility.icon;

  const scrollSlider = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = 260;
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      id="interactive-facilities"
      className="py-12 sm:py-16 bg-white dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden border-t border-slate-200 dark:border-slate-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with smooth entrance */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3.5">
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-700">
              <span>Interactive Campus Showcase</span>
            </div>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
            World-Class Infrastructure
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            Explore our state-of-the-art facilities using the smooth interactive slider below.
          </p>
        </motion.div>

        {/* Super Smooth Interactive Facilities Slider with Chevron Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-10 group"
        >
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => scrollSlider("left")}
            aria-label="Previous facility"
            className="absolute -left-2 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-110 active:scale-95 transition-all cursor-pointer opacity-90 hover:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => scrollSlider("right")}
            aria-label="Next facility"
            className="absolute -right-2 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-110 active:scale-95 transition-all cursor-pointer opacity-90 hover:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Scrollable Track */}
          <div
            ref={sliderRef}
            className="flex items-center gap-3 overflow-x-auto py-2 px-1 sm:px-3 no-scrollbar scroll-smooth snap-x snap-mandatory"
            style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
          >
            {facilities.map((facility) => {
              const TabIcon = facility.icon;
              const isSelected = facility.id === activeTab;
              return (
                <motion.button
                  key={facility.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab(facility.id)}
                  className={`relative px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 shrink-0 transition-all cursor-pointer snap-center select-none ${
                    isSelected
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg shadow-black/10 dark:shadow-white/5"
                      : "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60"
                  }`}
                >
                  <TabIcon className={`w-4 h-4 shrink-0 ${isSelected ? "text-amber-400 dark:text-amber-600" : "text-slate-500 dark:text-slate-400"}`} />
                  <span className="whitespace-nowrap">{facility.name}</span>
                  {isSelected && (
                    <motion.div
                      layoutId="activeFacilityIndicator"
                      className="absolute inset-0 rounded-2xl ring-2 ring-slate-900 dark:ring-white pointer-events-none"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Interactive Showcase Card with Smooth Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFacility.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl"
          >
            {/* Left: Image with Subtle Hover Zoom */}
            <div className="lg:col-span-7 relative aspect-[16/10] rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 group bg-slate-900">
              <img
                src={activeFacility.image}
                alt={activeFacility.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold shadow-md">
                  {activeFacility.category}
                </span>
              </div>
            </div>

            {/* Right: Interactive Details */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-5 text-slate-900 dark:text-white">
                  <IconComponent className="w-6 h-6" />
                </div>

                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
                  {activeFacility.tagline}
                </p>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
                  {activeFacility.name}
                </h3>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-normal">
                  {activeFacility.description}
                </p>

                {/* Key Highlights Checklist */}
                <div className="space-y-2.5 mb-8">
                  {activeFacility.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200 dark:border-slate-800 mb-6">
                {activeFacility.metrics.map((m, i) => (
                  <div key={i} className="text-center p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                    <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">{m.value}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>

              {/* Action Link */}
              <Button
                className="w-full sm:w-max bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                asChild
              >
                <Link to="/facilities">
                  Explore All Facilities <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
