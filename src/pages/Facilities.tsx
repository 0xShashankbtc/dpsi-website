import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  FlaskConical,
  BookOpen,
  Dumbbell,
  Microscope,
  Music,
  Palette,
  Wifi,
  Bus,
  Shield,
  HeartPulse,
  Building,
  Cpu,
  Waves,
  Sparkles,
  Trophy,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Compass,
  Phone,
  Calendar,
} from "lucide-react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import InteractiveFacilitiesSection from "@/sections/InteractiveFacilitiesSection";

interface FacilityDetail {
  id: string;
  name: string;
  category: "STEM & Labs" | "Sports & Aquatics" | "Arts & Culture" | "Campus & Safety";
  icon: React.ComponentType<{ className?: string }>;
  image: string;
  tagline: string;
  description: string;
  highlights: string[];
  metrics: { value: string; label: string }[];
}

const ALL_FACILITIES: FacilityDetail[] = [
  {
    id: "ai-robotics",
    name: "AI & Humanoid Robotics Incubator",
    category: "STEM & Labs",
    icon: Cpu,
    image: "/images/facilities/ai_robotics_lab.webp",
    tagline: "NITI Aayog Atal Tinkering Lab Certified",
    description:
      "A high-tech incubator equipped with dual-extrusion 3D printers, IoT microcontrollers, drone test rigs, and high-performance workstations for Python, ROS, and machine learning.",
    highlights: [
      "Hands-on AI, Computer Vision & ROS robotics curriculum",
      "National Robotics & Drone Championship training testbed",
      "Dual-extrusion rapid 3D printing & sensor telemetry rigs",
    ],
    metrics: [
      { value: "50+", label: "GPU Workstations" },
      { value: "100%", label: "Practical Immersion" },
      { value: "15+", label: "STEM Awards" },
    ],
  },
  {
    id: "science-labs",
    name: "Advanced Science Laboratories",
    category: "STEM & Labs",
    icon: FlaskConical,
    image: "/images/facilities/science_lab.webp",
    tagline: "Research-Grade Experimental Facilities",
    description:
      "Dedicated senior suites for Physics, Chemistry, Biology, and Biotechnology equipped with German optical glassware, digital spectrophotometers, and emergency wash stations exceeding CBSE safety benchmarks.",
    highlights: [
      "Individual student workstations ensuring 1:1 apparatus handling",
      "High-precision digital measuring instruments and spectrophotometers",
      "Automated emergency eye-wash & chemical shower safety systems",
    ],
    metrics: [
      { value: "4", label: "Dedicated Subject Labs" },
      { value: "1:1", label: "Student Apparatus" },
      { value: "Zero", label: "Safety Compromises" },
    ],
  },
  {
    id: "aquatics-pool",
    name: "Heated All-Weather Aquatics Complex",
    category: "Sports & Aquatics",
    icon: Waves,
    image: "/images/facilities/swimming_pool.webp",
    tagline: "Half-Olympic 25m Heated Pool",
    description:
      "An all-weather temperature-regulated 25m swimming pool with automated chlorine-filtration, electronic timing pads, certified FINA lifeguards, and dedicated learn-to-swim zones.",
    highlights: [
      "25m half-Olympic competition pool with year-round climate heating",
      "Full-time certified FINA lifeguards and medical station",
      "Regular host venue for CBSE National & Inter-School Aquatic Meets",
    ],
    metrics: [
      { value: "25m", label: "Heated Pool" },
      { value: "100%", label: "FINA Certified Staff" },
      { value: "Year-Round", label: "All-Weather" },
    ],
  },
  {
    id: "sports-arenas",
    name: "Championship Sports Arenas",
    category: "Sports & Aquatics",
    icon: Dumbbell,
    image: "/images/facilities/sports_complex.webp",
    tagline: "Floodlit Courts & Automated Cricket Nets",
    description:
      "Expansive athletic grounds featuring floodlit US Open synthetic tennis courts, FIBA-spec basketball courts, shock-absorbent wooden badminton halls, squash courts, and automated bowling machines.",
    highlights: [
      "US Open synthetic tennis courts and wooden indoor badminton courts",
      "Cricket nets with high-speed automated bowling telemetry",
      "NIS-accredited professional coaching faculty across 8+ sports",
    ],
    metrics: [
      { value: "8+", label: "Sports Arenas" },
      { value: "100%", label: "NIS Coaches" },
      { value: "Floodlit", label: "Night Play" },
    ],
  },
  {
    id: "auditorium",
    name: "Grand 1,200-Seat Acoustic Auditorium",
    category: "Arts & Culture",
    icon: Building,
    image: "/images/facilities/auditorium.webp",
    tagline: "Sound-Engineered Performing Arts Amphitheatre",
    description:
      "A majestic venue for drama, international Model UNs, and symphonies. Equipped with acoustically calculated timber panelling, motorised stage rigging, JBL line-array audio, and 4K cinema projection.",
    highlights: [
      "1,200-seat sound-engineered main auditorium with 4K projection",
      "Motorized theatrical lighting and multi-channel sound mixing",
      "Annual hosting of prestigious cultural fests and youth summits",
    ],
    metrics: [
      { value: "1,200+", label: "Seating Capacity" },
      { value: "100%", label: "Acoustic Treated" },
      { value: "4K", label: "Cinema Projection" },
    ],
  },
  {
    id: "library",
    name: "Digital Knowledge Repository & Library",
    category: "Campus & Safety",
    icon: BookOpen,
    image: "/images/facilities/library.webp",
    tagline: "35,000+ Curated Volumes & Research Archives",
    description:
      "A quiet academic sanctuary offering automated RFID checkout kiosks, digital e-readers, JSTOR journal subscriptions, comfortable reading pods, and collaborative project rooms.",
    highlights: [
      "Automated RFID borrowing & self-checkout smart kiosks",
      "Direct digital portal access to global JSTOR & scientific papers",
      "Ergonomic silent research carrels with high-speed fiber Wi-Fi",
    ],
    metrics: [
      { value: "35,000+", label: "Physical Books" },
      { value: "10,000+", label: "E-Journals" },
      { value: "200+", label: "Seating Pods" },
    ],
  },
  {
    id: "smart-classes",
    name: "Smart Ergonomic Classrooms",
    category: "Campus & Safety",
    icon: GraduationCap,
    image: "/images/facilities/smart_classroom.webp",
    tagline: "Interactive 4K Pedagogy Suites",
    description:
      "Every classroom is acoustically isolated and air-conditioned, featuring 4K interactive collaborative touch flat panels, high-speed fiber networking, and posture-friendly ergonomic furniture.",
    highlights: [
      "Interactive 4K digital flat panels with cloud lecture sync",
      "Ergonomic desks and chairs designed for spinal posture",
      "Integrated audio systems and smart attendance logging",
    ],
    metrics: [
      { value: "100%", label: "Digitized Rooms" },
      { value: "4K", label: "Touch Displays" },
      { value: "1:25", label: "Teacher Ratio" },
    ],
  },
  {
    id: "art-studio",
    name: "Fine Art & Pottery Atelier",
    category: "Arts & Culture",
    icon: Palette,
    image: "/images/facilities/art_craft_studio.webp",
    tagline: "Sculpting, Kiln Ceramics & Fine Arts",
    description:
      "Sunlit creative studios equipped with natural daylight skylights, easel stations, electric pottery sculpting wheels, high-fire ceramic kilns, and student exhibition galleries.",
    highlights: [
      "Electric pottery wheels, sculpting tools, and ceramic kiln",
      "Easel stations with natural daylight skylights",
      "Annual curated student fine arts & design exhibitions",
    ],
    metrics: [
      { value: "40+", label: "Easel Stations" },
      { value: "Electric", label: "Kiln & Wheels" },
      { value: "National", label: "Art Laurels" },
    ],
  },
  {
    id: "music-dance",
    name: "Performing Arts & Music Studios",
    category: "Arts & Culture",
    icon: Music,
    image: "/images/facilities/music_dance.webp",
    tagline: "Soundproofed Instrumental & Dance Studios",
    description:
      "Specialised soundproof rehearsal studios outfitted with acoustic baffling, grand pianos, Indian classical sitar & tabla, Western orchestra instruments, and mirrored sprung-floor dance studios.",
    highlights: [
      "Soundproofed acoustic recording and audio mastering suite",
      "Indian classical and Western orchestral instrument stations",
      "Sprung-floor dance studio with full-wall rehearsal mirrors",
    ],
    metrics: [
      { value: "30+", label: "Instruments" },
      { value: "100%", label: "Soundproofed" },
      { value: "Sprung", label: "Dance Floor" },
    ],
  },
  {
    id: "medical-infirmary",
    name: "Medical Infirmary & Wellness Bay",
    category: "Campus & Safety",
    icon: HeartPulse,
    image: "/images/facilities/medical_infirmary.webp",
    tagline: "24/7 Full-Time Doctor & Emergency Protocol",
    description:
      "A fully equipped on-campus medical center staffed with a full-time resident doctor and qualified nurses, emergency oxygen beds, first aid trauma equipment, and an on-standby ambulance.",
    highlights: [
      "Full-time qualified resident doctor and certified paediatric nurse",
      "Oxygen concentrators, automated defibrillator, and trauma beds",
      "On-call hospital tie-ups and dedicated campus emergency ambulance",
    ],
    metrics: [
      { value: "24/7", label: "Medical Cover" },
      { value: "Full-Time", label: "Resident Doctor" },
      { value: "Dedicated", label: "Ambulance" },
    ],
  },
  {
    id: "transport-bus",
    name: "Air-Conditioned GPS Transport Fleet",
    category: "Campus & Safety",
    icon: Bus,
    image: "/images/facilities/transport_bus.webp",
    tagline: "100% AC Fleet with Real-Time Parent App",
    description:
      "A modern, well-maintained fleet of air-conditioned school buses fitted with real-time GPS trackers, speed governors, CCTV surveillance, RFID attendance tapping, and female attendants.",
    highlights: [
      "Live GPS tracking for parents via dedicated mobile app",
      "CCTV surveillance inside every bus with speed governors",
      "Trained female attendants and verified professional drivers",
    ],
    metrics: [
      { value: "100%", label: "Air-Conditioned" },
      { value: "Live", label: "GPS Parent App" },
      { value: "RFID", label: "Child Attendance" },
    ],
  },
  {
    id: "campus-security",
    name: "Campus Security & AI Surveillance",
    category: "Campus & Safety",
    icon: ShieldCheck,
    image: "/images/facilities/campus_security.webp",
    tagline: "350+ AI-CCTV Nodes & RFID Perimeter",
    description:
      "Comprehensive multi-tier security featuring 350+ AI-assisted high-definition CCTV cameras, RFID smart turnstile gates, biometric visitor management, and 24/7 trained security personnel.",
    highlights: [
      "350+ high-definition AI perimeter and corridor cameras",
      "RFID smart entry turnstiles and digital visitor verification",
      "24/7 central command control room with instant alarm triggers",
    ],
    metrics: [
      { value: "350+", label: "AI Cameras" },
      { value: "24/7", label: "Central Command" },
      { value: "100%", label: "RFID Gate Access" },
    ],
  },
];

const CATEGORIES = [
  "All Facilities",
  "STEM & Labs",
  "Sports & Aquatics",
  "Arts & Culture",
  "Campus & Safety",
] as const;

export default function Facilities() {
  const { data: cmsFacilities } = trpc.cms.listFacilities.useQuery();
  const [selectedCategory, setSelectedCategory] = useState<string>("All Facilities");

  const filteredFacilities = ALL_FACILITIES.filter((f) => {
    if (selectedCategory === "All Facilities") return true;
    return f.category === selectedCategory;
  });

  return (
    <Layout>
      {/* 1. HERO SECTION WITH CINEMATIC GLOW & CAMPUS STATS */}
      <section className="relative py-20 sm:py-28 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden border-b border-slate-800">
        {/* Dynamic Background Mesh Orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 blur-3xl pointer-events-none rounded-full"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/15 blur-3xl pointer-events-none rounded-full"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-widest mb-5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              DPS Indirapuram • Campus Infrastructure
            </span>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-6 tracking-tight text-white drop-shadow-md">
              World-Class <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Facilities</span>
            </h1>

            <div className="w-24 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 mx-auto rounded-full mb-6" />

            <p className="text-base sm:text-xl text-slate-300 font-normal leading-relaxed max-w-3xl mx-auto mb-10">
              Our campus infrastructure is architected to ignite intellectual curiosity, nurture Olympic-standard athleticism, and celebrate artistic mastery across 40+ acres of purpose-built educational facilities.
            </p>

            {/* Overview Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4 border-t border-slate-800/80">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-inner">
                <p className="text-2xl sm:text-3xl font-black text-emerald-400">40+ Acres</p>
                <p className="text-xs font-medium text-slate-400 mt-0.5">Lush Green Campus</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-inner">
                <p className="text-2xl sm:text-3xl font-black text-cyan-400">12+ Studios</p>
                <p className="text-xs font-medium text-slate-400 mt-0.5">Labs & Arenas</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-inner">
                <p className="text-2xl sm:text-3xl font-black text-amber-400">25m Heated</p>
                <p className="text-xs font-medium text-slate-400 mt-0.5">Olympic Pool</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-inner">
                <p className="text-2xl sm:text-3xl font-black text-indigo-400">100% Safe</p>
                <p className="text-xs font-medium text-slate-400 mt-0.5">AI Surveillance & GPS</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE FLAGSHIP HIGH-END STORY SCROLL COMPONENT */}
      <InteractiveFacilitiesSection />

      {/* 3. COMPREHENSIVE 12-FACILITY CAMPUS DIRECTORY */}
      <section className="py-20 sm:py-28 bg-slate-900/40 relative border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Explore Our Entire Campus
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2 mb-4">
              All Campus Infrastructure & Studios
            </h2>
            <p className="text-slate-400 text-sm sm:text-base font-normal max-w-2xl mx-auto">
              Browse through our comprehensive directory of specialised academic, scientific, athletic, and creative spaces.
            </p>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                      : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Complete 12-Facility Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFacilities.map((f, i) => {
              const IconComponent = f.icon;
              return (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: (i % 3) * 0.08, ease: "easeOut" }}
                  whileHover={{ y: -6 }}
                  className="h-full"
                >
                  <Card className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl hover:shadow-2xl hover:border-emerald-500/40 transition-all duration-300 group h-full flex flex-col justify-between">
                    {/* Visual Banner */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                      <img
                        src={f.image}
                        alt={f.name}
                        className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                      
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/20 text-xs font-bold shadow-md">
                          {f.category}
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="w-10 h-10 bg-emerald-500/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-2 border border-emerald-500/30 text-emerald-300">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <h3 className="font-extrabold text-lg sm:text-xl leading-snug">{f.name}</h3>
                      </div>
                    </div>

                    {/* Content Body */}
                    <CardContent className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                          {f.tagline}
                        </p>
                        <p className="text-sm text-slate-300 leading-relaxed mb-5 font-normal">
                          {f.description}
                        </p>

                        {/* Feature Highlights */}
                        <div className="space-y-2 mb-6">
                          {f.highlights.map((h, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Metrics Footer */}
                      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800 text-center">
                        {f.metrics.map((m, idx) => (
                          <div key={idx} className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                            <p className="text-sm font-bold text-white tracking-tight">{m.value}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{m.label}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. CAMPUS TOUR INVITATION & ADMISSIONS CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-emerald-950 via-slate-950 to-slate-900 border-t border-emerald-900/30 relative overflow-hidden text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
            <div className="max-w-2xl">
              <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                Visit DPS Indirapuram
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
                Experience Our Infrastructure in Person
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                We invite prospective parents and students to tour our laboratories, olympic swimming pool, digital classrooms, and creative ateliers. Guided by our senior leadership team.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 text-sm"
                asChild
              >
                <Link to="/admissions" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Book Guided Campus Tour</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="border-slate-700 text-slate-200 hover:bg-slate-800 rounded-xl px-5 py-3 text-sm font-semibold"
                asChild
              >
                <Link to="/contact">
                  <Phone className="w-4 h-4 mr-2 text-emerald-400" /> Contact Admissions Office
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}