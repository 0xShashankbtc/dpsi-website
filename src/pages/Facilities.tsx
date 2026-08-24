import { motion } from "framer-motion";
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
  Bot,
  Cpu,
  Boxes,
  Hammer,
  Wrench,
  Rocket,
  Lightbulb,
  Atom,
  Sparkles,
  Code,
  PenTool,
} from "lucide-react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";

const iconMap: Record<string, React.ReactNode> = {
  Microscope: <Microscope className="w-8 h-8" />,
  FlaskConical: <FlaskConical className="w-8 h-8" />,
  Wifi: <Wifi className="w-8 h-8" />,
  Dumbbell: <Dumbbell className="w-8 h-8" />,
  BookOpen: <BookOpen className="w-8 h-8" />,
  Music: <Music className="w-8 h-8" />,
  Palette: <Palette className="w-8 h-8" />,
  Bus: <Bus className="w-8 h-8" />,
  Shield: <Shield className="w-8 h-8" />,
  HeartPulse: <HeartPulse className="w-8 h-8" />,
  Building: <Building className="w-8 h-8" />,
  Bot: <Bot className="w-8 h-8" />,
  Cpu: <Cpu className="w-8 h-8" />,
  Boxes: <Boxes className="w-8 h-8" />,
  Hammer: <Hammer className="w-8 h-8" />,
  Wrench: <Wrench className="w-8 h-8" />,
  Rocket: <Rocket className="w-8 h-8" />,
  Lightbulb: <Lightbulb className="w-8 h-8" />,
  Atom: <Atom className="w-8 h-8" />,
  Sparkles: <Sparkles className="w-8 h-8" />,
  Code: <Code className="w-8 h-8" />,
  PenTool: <PenTool className="w-8 h-8" />,
};

export default function Facilities() {
  const { data: facilitiesList } = trpc.cms.listFacilities.useQuery();

  return (
    <Layout>
      {/* HERO SECTION WITH GUARANTEED RENDERING & CINEMATIC GLOW */}
      <section className="relative py-20 sm:py-24 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 text-white overflow-hidden">
        {/* Dynamic Background Mesh Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 blur-3xl pointer-events-none rounded-full"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/15 blur-3xl pointer-events-none rounded-full"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
              Campus Infrastructure
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-5 tracking-tight text-white drop-shadow-md">
              World-Class Facilities
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-emerald-400 to-amber-400 mx-auto rounded-full mb-6" />
            <p className="text-base sm:text-lg md:text-xl text-slate-300 font-medium leading-relaxed">
              Our infrastructure is designed to inspire learning, foster creativity, and ensure the holistic development of every student.
            </p>
          </div>
        </div>
      </section>

      {/* INFRASTRUCTURE GRID (100% DYNAMIC FROM MONGO) */}
      {facilitiesList && facilitiesList.length > 0 && (
        <section className="py-20 bg-slate-50 dark:bg-slate-950 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Explore Our Infrastructure
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 mx-auto mt-3 rounded-full" />
              <p className="text-slate-600 dark:text-slate-400 mt-3 text-sm sm:text-base font-medium max-w-xl mx-auto">
                Equipped with state-of-the-art labs, sports grounds, creative spaces, and safety measures.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilitiesList.map((f: any, i: number) => (
                <motion.div
                  key={f._id || f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: i * 0.05, ease: "easeOut" }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="h-full"
                >
                  <Card className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-2xl hover:border-emerald-500/40 transition-all duration-300 group h-full flex flex-col justify-between bg-white dark:bg-slate-900">
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={f.imageUrl || "/images/facilities/ai_robotics_lab.webp"}
                        alt={f.title}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="w-10 h-10 bg-emerald-600/90 backdrop-blur-md rounded-xl flex items-center justify-center mb-2 shadow-md">
                          {iconMap[f.icon || "Microscope"] || <Microscope className="w-6 h-6" />}
                        </div>
                        <h3 className="font-extrabold text-lg leading-snug">{f.title}</h3>
                      </div>
                    </div>
                    <CardContent className="p-5 flex-1 flex flex-col justify-between">
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{f.description}</p>
                      <span className="mt-3 inline-block px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold w-max border border-emerald-500/20">
                        {f.category || "Campus Facility"}
                      </span>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}