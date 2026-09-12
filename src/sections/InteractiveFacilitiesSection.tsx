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
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Layers,
  Compass,
  ArrowUpRight,
  Maximize2,
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
    name: "Digital Knowledge Repository",
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
    name: "Auditorium & Music Studio",
    category: "Creative Expression",
    icon: Music,
    image: "/images/facilities/auditorium.webp",
    tagline: "Acoustically Tuned Studios for Instrumental & Performing Arts",
    description:
      "Acoustically engineered 1,200-seat auditorium paired with specialized soundproofed rehearsal spaces equipped with grand pianos, orchestral instruments, Indian classical instruments, and studio-grade sound recording consoles.",
    highlights: [
      "1,200-seat sound-engineered main auditorium with 4K projection",
      "Soundproofed acoustic recording and audio mastering suite",
      "Classical Indian & Western orchestral instrument stations",
    ],
    metrics: [
      { value: "100%", label: "Acoustic Treated" },
      { value: "30+", label: "Instruments" },
      { value: "1,200+", label: "Auditorium Seats" },
    ],
  },
  {
    id: "art-craft",
    name: "Fine Art & Craft Studio",
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
    name: "AI & Robotics Incubator",
    category: "STEM & Innovation",
    icon: Cpu,
    image: "/images/facilities/ai_robotics_lab.webp",
    tagline: "Future-Ready Technology Education",
    description:
      "A state-of-the-art innovation incubator certified under Atal Innovation Mission, equipped with 3D printers, IoT kits, drone simulation rigs, and dedicated Python programming workstations.",
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
    name: "Smart Classrooms & Safety",
    category: "Digital Pedagogy",
    icon: GraduationCap,
    image: "/images/facilities/smart_classroom.webp",
    tagline: "Interactive Ergonomic Learning Spaces",
    description:
      "Acoustically treated, air-conditioned smart classrooms equipped with 4K touch displays, ergonomic furniture, 350+ AI-CCTV cameras, and GPS-monitored fleet.",
    highlights: [
      "Interactive 4K digital flat panels with cloud lecture sync",
      "Ergonomic seating designed for student posture",
      "350+ AI security cameras & 100% GPS AC transport fleet",
    ],
    metrics: [
      { value: "100%", label: "Digitized Rooms" },
      { value: "4K", label: "Interactive Touch" },
      { value: "350+", label: "AI CCTV Cameras" },
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

export default function InteractiveFacilitiesSection() {
  const { data: cmsFacilities } = trpc.cms.listFacilities.useQuery();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<"story" | "explorer">("story");

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
              category: f.category || "Campus Facility",
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
      className="bg-slate-950 text-white relative border-t border-slate-800"
    >
      {/* Top Banner & Editorial Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Eyebrow Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-500/20 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              World-Class Infrastructure & Learning Ecosystems
            </span>
          </div>

          {/* Main Title */}
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-5">
            Architected for <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">Curiosity & Excellence</span>
          </h2>

          {/* Subtitle */}
          <p className="text-slate-300 text-base sm:text-lg md:text-xl font-normal max-w-3xl mx-auto leading-relaxed mb-8">
            Immerse yourself in our premier educational facilities, research laboratories, and athletic arenas designed to inspire holistic leadership at Delhi Public School Indirapuram.
          </p>

          {/* Mode Switcher & Direct Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <button
                type="button"
                onClick={() => setViewMode("story")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  viewMode === "story"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Story Flow (3D Parallax)</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("explorer")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  viewMode === "explorer"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Interactive Explorer</span>
              </button>
            </div>

            <Button
              variant="outline"
              className="border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs sm:text-sm font-bold px-4 py-2 h-auto"
              asChild
            >
              <Link to="/facilities" className="flex items-center gap-1.5">
                <span>View All 12+ Facilities</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* RENDER MODE 1: HIGH-END 3D STORY SCROLL (GSAP ScrollTrigger Powered) */}
      {viewMode === "story" && (
        <FlowArt
          as="div"
          aria-label="DPS Indirapuram World-Class Facilities Showcase"
          className="relative w-full"
        >
          {/* 01 — AI & ROBOTICS LAB */}
          <FlowSection
            aria-label="01 Next-Gen AI and Atal Robotics Incubator"
            style={{ backgroundColor: "#06130D", color: "#F8FAFC" }}
            className="border-t border-emerald-950/50"
          >
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-black tracking-widest border border-emerald-500/30">
                  01 / 05
                </span>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-400">
                  STEM & Future Technologies
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300/80">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>NITI Aayog Atal Tinkering Lab Certified</span>
              </div>
            </div>

            {/* Main Stage Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto py-6">
              {/* Left Column: Visual Showcase */}
              <div className="lg:col-span-7 relative group">
                <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/30 bg-slate-900">
                  <img
                    src="/images/facilities/ai_robotics_lab.webp"
                    alt="AI & Robotics Lab at DPS Indirapuram"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Floating Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-emerald-300 text-xs font-bold border border-emerald-500/30">
                      Python • ROS • Machine Learning
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-amber-300 text-xs font-bold border border-amber-500/30">
                      3D Prototyping
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <div>
                      <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Innovation Hub</p>
                      <h4 className="text-lg sm:text-xl font-black">Atal Tinkering Robotics Studio</h4>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/30 text-emerald-200 text-xs font-bold backdrop-blur-sm border border-emerald-400/40">
                      <Sparkles className="w-3.5 h-3.5" /> High-Tech
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Editorial Copy */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 w-max px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-500/20">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Next-Gen Incubator</span>
                </div>

                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] text-white mb-4">
                  AI & Humanoid Robotics Lab
                </h3>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                  Our NITI Aayog-certified Atal Tinkering Lab empowers students from middle school onwards to code autonomous robots, train computer vision models, engineer IoT telemetry sensors, and manufacture mechanical hardware with rapid dual-extrusion 3D printers.
                </p>

                {/* Key Highlights */}
                <div className="space-y-3 mb-8">
                  {[
                    "Hands-on Python, ROS robotics, Arduino & Raspberry Pi toolkits",
                    "National Robotics & Autonomous Drone Championship training arena",
                    "Rapid 3D printing, laser micro-cutting & sensor testbeds",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Action Row */}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20"
                    asChild
                  >
                    <Link to="/facilities">
                      Explore Curriculum <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-emerald-500/30 text-emerald-200 hover:bg-emerald-950/50 rounded-xl font-semibold"
                    asChild
                  >
                    <Link to="/admissions">Schedule Campus Tour</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom Row: Metrics & Scroll Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-emerald-500/20 pt-4">
              <div className="flex flex-wrap gap-4 sm:gap-8">
                <div>
                  <p className="text-xl sm:text-2xl font-black text-emerald-400">50+</p>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">AI Workstations</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-emerald-400">100%</p>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Practical Immersion</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-emerald-400">15+</p>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">National STEM Laurels</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300/70 animate-bounce">
                <span>Scroll down to continue tour</span>
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </FlowSection>

          {/* 02 — HEATED AQUATICS & SPORTS ARENAS */}
          <FlowSection
            aria-label="02 All-Weather Heated Aquatics and Championship Sports Arenas"
            style={{ backgroundColor: "#040F1E", color: "#F8FAFC" }}
            className="border-t border-cyan-950/50"
          >
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-black tracking-widest border border-cyan-500/30">
                  02 / 05
                </span>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-400">
                  Athletics & Physical Mastery
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300/80">
                <Waves className="w-4 h-4 text-cyan-400" />
                <span>25m Competition Pool • All-Weather Heated</span>
              </div>
            </div>

            {/* Main Stage Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto py-6">
              {/* Left Column: Visual Showcase */}
              <div className="lg:col-span-7 relative group">
                <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl border border-cyan-500/30 bg-slate-900">
                  <img
                    src="/images/facilities/swimming_pool.webp"
                    alt="Olympic Aquatics and Sports Complex at DPS Indirapuram"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Floating Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-cyan-300 text-xs font-bold border border-cyan-500/30">
                      Temperature Controlled
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-amber-300 text-xs font-bold border border-amber-500/30">
                      FINA Certified Lifeguards
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <div>
                      <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Aquatics Complex</p>
                      <h4 className="text-lg sm:text-xl font-black">Half-Olympic Heated Swimming Arena</h4>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/30 text-cyan-200 text-xs font-bold backdrop-blur-sm border border-cyan-400/40">
                      <Trophy className="w-3.5 h-3.5" /> State Champions
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Editorial Copy */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 w-max px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-3 border border-cyan-500/20">
                  <Waves className="w-3.5 h-3.5" />
                  <span>Olympic Sports Infrastructure</span>
                </div>

                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] text-white mb-4">
                  Heated Aquatics & Sports Arenas
                </h3>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                  Our sports ecosystem fosters competitive resilience through an all-weather heated 25m swimming pool, alongside floodlit US Open synthetic tennis courts, squash courts, indoor wooden badminton halls, and automated cricket bowling nets.
                </p>

                {/* Key Highlights */}
                <div className="space-y-3 mb-8">
                  {[
                    "Half-Olympic 25m heated pool with certified FINA lifesavers",
                    "Synthetic tennis, basketball & indoor wooden badminton courts",
                    "Cricket nets with high-speed automated bowling telemetry",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Action Row */}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20"
                    asChild
                  >
                    <Link to="/facilities">
                      View Sports Roster <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-cyan-500/30 text-cyan-200 hover:bg-cyan-950/50 rounded-xl font-semibold"
                    asChild
                  >
                    <Link to="/admissions">Athletic Scholarships</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom Row: Metrics & Scroll Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-cyan-500/20 pt-4">
              <div className="flex flex-wrap gap-4 sm:gap-8">
                <div>
                  <p className="text-xl sm:text-2xl font-black text-cyan-400">25m</p>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Heated Competition Pool</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-cyan-400">8+</p>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Sport Disciplines</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-cyan-400">100%</p>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">NIS Coaches</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300/70 animate-bounce">
                <span>Scroll down for Science Labs</span>
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </FlowSection>

          {/* 03 — RESEARCH-GRADE SCIENCE LABS */}
          <FlowSection
            aria-label="03 Research-Grade Experimental Science Laboratories"
            style={{ backgroundColor: "#F8F6F0", color: "#0F172A" }}
            className="border-t border-amber-900/10"
          >
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 pb-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-amber-800/10 text-amber-900 font-mono text-xs font-black tracking-widest border border-amber-800/20">
                  03 / 05
                </span>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-900">
                  Experiential Sciences & STEAM
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <FlaskConical className="w-4 h-4 text-amber-800" />
                <span>Exceeds CBSE Experimental Standards</span>
              </div>
            </div>

            {/* Main Stage Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto py-6">
              {/* Left Column: Visual Showcase */}
              <div className="lg:col-span-7 relative group">
                <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl border border-slate-300 bg-slate-100">
                  <img
                    src="/images/facilities/science_lab.webp"
                    alt="Research-Grade Science Labs at DPS Indirapuram"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Floating Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-amber-300 text-xs font-bold border border-amber-400/30">
                      Physics • Chemistry • Biology
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-emerald-300 text-xs font-bold border border-emerald-400/30">
                      Digital Sensors
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <div>
                      <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Discovery Suites</p>
                      <h4 className="text-lg sm:text-xl font-black">Specialized Senior Experimental Laboratories</h4>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/30 text-emerald-200 text-xs font-bold backdrop-blur-sm border border-emerald-400/40">
                      <ShieldCheck className="w-3.5 h-3.5" /> 100% Safe
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Editorial Copy */}
              <div className="lg:col-span-5 flex flex-col justify-center text-slate-900">
                <div className="inline-flex items-center gap-2 w-max px-3 py-1 rounded-lg bg-amber-900/10 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-900/20">
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Scientific Rigor</span>
                </div>

                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] text-slate-900 mb-4">
                  Research-Grade Science Labs
                </h3>

                <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                  Dedicated experimental suites for Physics, Chemistry, Biology, and Biotechnology provide every learner with an individual station featuring German optical microscopes, analytical sensors, chemical fume hoods, and automated eye-wash stations.
                </p>

                {/* Key Highlights */}
                <div className="space-y-3 mb-8">
                  {[
                    "Individual workstations ensuring direct hands-on experimental validation",
                    "High-precision digital measuring instruments and spectrophotometers",
                    "Exceeds CBSE safety protocols with automated emergency showers",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="font-semibold">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Action Row */}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg"
                    asChild
                  >
                    <Link to="/facilities">
                      View Lab Specs <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-300 text-slate-800 hover:bg-slate-200 rounded-xl font-semibold"
                    asChild
                  >
                    <Link to="/admissions">Science Accreditations</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom Row: Metrics & Scroll Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-300 pt-4 text-slate-900">
              <div className="flex flex-wrap gap-4 sm:gap-8">
                <div>
                  <p className="text-xl sm:text-2xl font-black text-amber-900">4</p>
                  <p className="text-[11px] font-medium text-slate-600 uppercase tracking-wider">Dedicated Labs</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-amber-900">1:1</p>
                  <p className="text-[11px] font-medium text-slate-600 uppercase tracking-wider">Student Apparatus</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-amber-900">Zero</p>
                  <p className="text-[11px] font-medium text-slate-600 uppercase tracking-wider">Safety Incidents</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 animate-bounce">
                <span>Scroll down for Auditorium</span>
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </FlowSection>

          {/* 04 — GRAND ACOUSTIC AUDITORIUM & ART ATELIERS */}
          <FlowSection
            aria-label="04 Grand Acoustic Auditorium and Creative Arts Studios"
            style={{ backgroundColor: "#17071A", color: "#F8FAFC" }}
            className="border-t border-fuchsia-950/50"
          >
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-fuchsia-500/20 pb-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-mono text-xs font-black tracking-widest border border-fuchsia-500/30">
                  04 / 05
                </span>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-fuchsia-400">
                  Visual & Performing Arts
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-fuchsia-300/80">
                <Music className="w-4 h-4 text-fuchsia-400" />
                <span>1,200 Seats • Acoustic Sound Engineering</span>
              </div>
            </div>

            {/* Main Stage Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto py-6">
              {/* Left Column: Visual Showcase */}
              <div className="lg:col-span-7 relative group">
                <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl border border-fuchsia-500/30 bg-slate-900">
                  <img
                    src="/images/facilities/auditorium.webp"
                    alt="Grand Auditorium and Performing Arts at DPS Indirapuram"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Floating Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-fuchsia-300 text-xs font-bold border border-fuchsia-500/30">
                      1,200 Capacity
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-amber-300 text-xs font-bold border border-amber-500/30">
                      4K Cinema Projection
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <div>
                      <p className="text-xs font-semibold text-fuchsia-400 uppercase tracking-widest">Main Amphitheatre</p>
                      <h4 className="text-lg sm:text-xl font-black">Acoustically Tuned Performing Arts Center</h4>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-fuchsia-500/30 text-fuchsia-200 text-xs font-bold backdrop-blur-sm border border-fuchsia-400/40">
                      <Palette className="w-3.5 h-3.5" /> Creative Hub
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Editorial Copy */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 w-max px-3 py-1 rounded-lg bg-fuchsia-500/10 text-fuchsia-300 text-xs font-bold uppercase tracking-wider mb-3 border border-fuchsia-500/20">
                  <Music className="w-3.5 h-3.5" />
                  <span>Cultural Grandeur</span>
                </div>

                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] text-white mb-4">
                  Auditorium & Art Ateliers
                </h3>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                  A majestic venue for drama, international model UNs, and symphonies. Equipped with acoustically calculated timber paneling, motorised stage rigging, an attached sound recording console, and sunlit fine art studios with electric pottery kilns.
                </p>

                {/* Key Highlights */}
                <div className="space-y-3 mb-8">
                  {[
                    "1,200-seat sound-engineered main auditorium with 4K projection",
                    "Soundproofed recording suite with classical and western instruments",
                    "Sunlit fine arts atelier with electric pottery wheels & ceramic kilns",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Action Row */}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    className="bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-fuchsia-500/20"
                    asChild
                  >
                    <Link to="/facilities">
                      Cultural Gallery <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-fuchsia-500/30 text-fuchsia-200 hover:bg-fuchsia-950/50 rounded-xl font-semibold"
                    asChild
                  >
                    <Link to="/admissions">Auditorium Specs</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom Row: Metrics & Scroll Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-fuchsia-500/20 pt-4">
              <div className="flex flex-wrap gap-4 sm:gap-8">
                <div>
                  <p className="text-xl sm:text-2xl font-black text-fuchsia-400">1,200+</p>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Acoustic Seats</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-fuchsia-400">30+</p>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Musical Instruments</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-fuchsia-400">100%</p>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Acoustic Isolated</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-fuchsia-300/70 animate-bounce">
                <span>Scroll down for Smart Classrooms</span>
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </FlowSection>

          {/* 05 — SMART DIGITAL INFRASTRUCTURE & SAFE FLEET */}
          <FlowSection
            aria-label="05 Smart Digitized Learning Studios and Safe Transit Fleet"
            style={{ backgroundColor: "#070B16", color: "#F8FAFC" }}
            className="border-t border-indigo-950/50"
          >
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/20 pb-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-black tracking-widest border border-indigo-500/30">
                  05 / 05
                </span>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-400">
                  Digital Pedagogy & Campus Safety
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300/80">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>350+ AI Surveillance Nodes • 100% AC Fleet</span>
              </div>
            </div>

            {/* Main Stage Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto py-6">
              {/* Left Column: Visual Showcase */}
              <div className="lg:col-span-7 relative group">
                <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl border border-indigo-500/30 bg-slate-900">
                  <img
                    src="/images/facilities/smart_classroom.webp"
                    alt="Smart Classrooms and Secure Campus at DPS Indirapuram"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Floating Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-indigo-300 text-xs font-bold border border-indigo-500/30">
                      4K Interactive Touch Panels
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-emerald-300 text-xs font-bold border border-emerald-500/30">
                      GPS-Tracked Transport
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <div>
                      <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Digital Learning</p>
                      <h4 className="text-lg sm:text-xl font-black">Ergonomic Smart Digital Classrooms</h4>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/30 text-indigo-200 text-xs font-bold backdrop-blur-sm border border-indigo-400/40">
                      <GraduationCap className="w-3.5 h-3.5" /> Smart Campus
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Editorial Copy */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 w-max px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3 border border-indigo-500/20">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Smart Ecosystem</span>
                </div>

                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] text-white mb-4">
                  Smart Studios & Secure Fleet
                </h3>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                  All classrooms feature 4K interactive collaborative touch flat panels, high-speed fiber internet, and posture-friendly ergonomic furniture. Backed by 350+ AI-assisted security cameras, RFID access control, and a 100% air-conditioned bus fleet with real-time GPS tracking.
                </p>

                {/* Key Highlights */}
                <div className="space-y-3 mb-8">
                  {[
                    "Interactive 4K smart flat panels with cloud lecture recording sync",
                    "24/7 AI-assisted perimeter security, RFID gate passes & doctor infirmary",
                    "100% air-conditioned bus fleet with live parent GPS mobile tracking app",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Action Row */}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    className="bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20"
                    asChild
                  >
                    <Link to="/facilities">
                      Explore All Facilities <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-indigo-500/30 text-indigo-200 hover:bg-indigo-950/50 rounded-xl font-semibold"
                    asChild
                  >
                    <Link to="/admissions">Admissions Enquiry</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom Row: Metrics & Final Action */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-indigo-500/20 pt-4">
              <div className="flex flex-wrap gap-4 sm:gap-8">
                <div>
                  <p className="text-xl sm:text-2xl font-black text-indigo-400">100%</p>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Digitized Classrooms</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-indigo-400">350+</p>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">AI Security Cameras</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-indigo-400">100%</p>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">AC GPS Bus Fleet</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewMode("explorer")}
                  className="text-xs border-indigo-400/40 text-indigo-300 hover:bg-indigo-950/40 rounded-xl"
                >
                  <Compass className="w-3.5 h-3.5 mr-1" /> Switch to Interactive Explorer
                </Button>
              </div>
            </div>
          </FlowSection>
        </FlowArt>
      )}

      {/* RENDER MODE 2: INTERACTIVE TABBED EXPLORER */}
      {viewMode === "explorer" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Super Smooth Interactive Facilities Slider with Chevron Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-10 group"
          >
            {/* Left Arrow Button */}
            <button
              type="button"
              onClick={() => scrollSlider("left")}
              aria-label="Previous facility"
              className="absolute -left-2 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-800 text-slate-200 shadow-xl border border-slate-700 flex items-center justify-center hover:bg-slate-700 hover:scale-110 active:scale-95 transition-all cursor-pointer opacity-90 hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Right Arrow Button */}
            <button
              type="button"
              onClick={() => scrollSlider("right")}
              aria-label="Next facility"
              className="absolute -right-2 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-800 text-slate-200 shadow-xl border border-slate-700 flex items-center justify-center hover:bg-slate-700 hover:scale-110 active:scale-95 transition-all cursor-pointer opacity-90 hover:opacity-100"
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
                        ? "bg-white text-slate-900 shadow-lg shadow-white/10"
                        : "bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800"
                    }`}
                  >
                    <TabIcon
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? "text-amber-500" : "text-slate-400"
                      }`}
                    />
                    <span className="whitespace-nowrap">{facility.name}</span>
                    {isSelected && (
                      <motion.div
                        layoutId="activeFacilityIndicator"
                        className="absolute inset-0 rounded-2xl ring-2 ring-white pointer-events-none"
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
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-slate-900/90 rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl backdrop-blur-sm"
            >
              {/* Left: Image with Subtle Hover Zoom */}
              <div className="lg:col-span-7 relative aspect-[16/10] rounded-2xl overflow-hidden shadow-lg border border-slate-700 group bg-slate-950">
                <img
                  src={activeFacility.image}
                  alt={activeFacility.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/20 text-xs font-bold shadow-md">
                    {activeFacility.category}
                  </span>
                </div>
              </div>

              {/* Right: Interactive Details */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 shadow-sm border border-slate-700 flex items-center justify-center mb-5 text-white">
                    <IconComponent className="w-6 h-6 text-emerald-400" />
                  </div>

                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
                    {activeFacility.tagline}
                  </p>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 tracking-tight">
                    {activeFacility.name}
                  </h3>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6 font-normal">
                    {activeFacility.description}
                  </p>

                  {/* Key Highlights Checklist */}
                  <div className="space-y-2.5 mb-8">
                    {activeFacility.highlights.map((h, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 font-medium"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-800 mb-6">
                  {activeFacility.metrics.map((m, i) => (
                    <div
                      key={i}
                      className="text-center p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 shadow-inner"
                    >
                      <p className="text-lg sm:text-xl font-black text-white tracking-tight">
                        {m.value}
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5">
                        {m.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Action Link */}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    className="w-full sm:w-max bg-white hover:bg-slate-100 text-slate-900 font-bold px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                    asChild
                  >
                    <Link to="/facilities">
                      Explore Full Facilities <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setViewMode("story")}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl"
                  >
                    <Layers className="w-4 h-4 mr-1.5" />
                    View 3D Story Flow
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
