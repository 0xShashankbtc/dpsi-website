import { useState } from "react";
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
  Compass,
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
    id: "swimming",
    name: "Olympic Swimming Pool",
    category: "Aquatic Sports",
    icon: Waves,
    image: "/images/facilities/swimming_pool.webp",
    tagline: "All-Weather Heated Aquatic Facility",
    description:
      "Half-Olympic sized heated swimming pool built to international standards with certified FINA lifesavers, water purification plant, and separate learner pools.",
    highlights: [
      "Temperature-regulated water year-round",
      "Dedicated certified NIS swimming coaches",
      "Host of CBSE National Aquatic Meets",
    ],
    metrics: [
      { value: "25m", label: "Pool Length" },
      { value: "6", label: "Competition Lanes" },
      { value: "100%", label: "Trained Lifeguards" },
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
    id: "library",
    name: "Knowledge Hub & Library",
    category: "Academic Resources",
    icon: BookOpen,
    image: "/images/facilities/library.webp",
    tagline: "Over 35,000 Curated Volumes & Digital Repositories",
    description:
      "An expansive, serene reading sanctuary housing thousands of global literary classics, research journals, digital e-book readers, and quiet study carrels.",
    highlights: [
      "Automated RFID cataloging and circulation",
      "Access to global JSTOR & scientific journals",
      "Dedicated primary and senior reading sections",
    ],
    metrics: [
      { value: "35K+", label: "Physical Books" },
      { value: "10K+", label: "E-Journals" },
      { value: "200+", label: "Seating Capacity" },
    ],
  },
  {
    id: "sports",
    name: "Multisport Complex",
    category: "Athletic Excellence",
    icon: Trophy,
    image: "/images/facilities/sports_complex.webp",
    tagline: "World-Class Outdoor & Indoor Arenas",
    description:
      "Comprehensive sports arena featuring floodlit synthetic tennis courts, wooden indoor badminton courts, cricket nets with bowling machines, and basketball courts.",
    highlights: [
      "Certified trainers for football, cricket & basketball",
      "Regular inter-school tournaments & coaching clinics",
      "State-of-the-art injury prevention & medical care",
    ],
    metrics: [
      { value: "8+", label: "Major Sports" },
      { value: "12", label: "National Players" },
      { value: "Floodlit", label: "Night Matches" },
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
  Default: Sparkles,
};

import { trpc } from "@/providers/trpc";

export default function InteractiveFacilitiesSection() {
  const { data: cmsFacilities } = trpc.cms.listFacilities.useQuery(undefined, {
    staleTime: 60000,
  });
  const { data: siteSettings } = trpc.cms.getSiteSettings.useQuery();

  const getSetting = (key: string, fallback: string) => {
    const item = siteSettings?.find((s: any) => s.key === key);
    return item?.value?.trim() || fallback;
  };

  const view360Url = getSetting("view_360_url", "https://dpsivr.vercel.app");
  const view360Label = getSetting("view_360_label", "360 View");
  const view360Enabled = getSetting("view_360_enabled", "true") !== "false";

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

  return (
    <section
      id="interactive-facilities"
      className="py-20 sm:py-24 bg-white dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden border-t border-slate-200 dark:border-slate-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3.5">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Interactive Campus Showcase</span>
            </div>

            {view360Enabled && (
              <a
                href={view360Url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all cursor-pointer border border-emerald-400/30"
              >
                <Compass className="w-3.5 h-3.5 animate-spin-slow text-amber-300" />
                <span>Launch {view360Label} (VR Tour)</span>
              </a>
            )}
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
            World-Class Infrastructure
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            Click any facility below to preview our cutting-edge learning spaces, laboratories, and sports arenas.
          </p>
        </div>

        {/* Interactive Tab Switcher */}
        <div className="flex items-center justify-start lg:justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {facilities.map((facility) => {
            const TabIcon = facility.icon;
            const isSelected = facility.id === activeTab;
            return (
              <button
                key={facility.id}
                onClick={() => setActiveTab(facility.id)}
                className={`relative px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{facility.name}</span>
                {isSelected && (
                  <motion.div
                    layoutId="activeFacilityIndicator"
                    className="absolute inset-0 rounded-xl ring-2 ring-slate-900 dark:ring-white pointer-events-none"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

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
                loading="eager"
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
