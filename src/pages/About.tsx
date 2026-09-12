import { motion } from "framer-motion";
import { Target, Eye, Heart, BookOpen, Users, Award, Shield, Compass, Sparkles } from "lucide-react";
import Layout from "@/components/Layout";
import { trpc } from "@/providers/trpc";

const iconMap: Record<string, React.ReactNode> = {
  Target: <Target className="w-6 h-6" />,
  Eye: <Eye className="w-6 h-6" />,
  Heart: <Heart className="w-6 h-6" />,
  BookOpen: <BookOpen className="w-6 h-6" />,
  Users: <Users className="w-6 h-6" />,
  Award: <Award className="w-6 h-6" />,
  Shield: <Shield className="w-6 h-6" />,
  Compass: <Compass className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
};

export default function About() {
  const { data: leadershipList } = trpc.cms.listLeadership.useQuery();
  const { data: coreValues } = trpc.cms.listCoreValues.useQuery();
  const { data: timelineList } = trpc.cms.listTimeline.useQuery();
  const { data: siteSettings } = trpc.cms.getSiteSettings.useQuery();

  const getSetting = (key: string, fallback: string) => {
    const item = siteSettings?.find((s: any) => s.key === key);
    return item?.value?.trim() || fallback;
  };

  const schoolName = getSetting("school_name", "Delhi Public School Indirapuram");
  const schoolTagline = getSetting("school_tagline", "Service Before Self • Nurturing Global Leaders");
  const visionText = getSetting(
    "vision_text",
    "To be a world-class institution that nurtures young minds into responsible global citizens, equipped with the knowledge, skills, and values to lead and innovate in an ever-changing world."
  );
  const missionText = getSetting(
    "mission_text",
    "To provide a stimulating learning environment that fosters academic excellence, physical fitness, emotional well-being, and social responsibility through innovative pedagogy and state-of-the-art infrastructure."
  );

  return (
    <Layout>
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
              Our Heritage & Legacy
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-5 tracking-tight text-white drop-shadow-md">
              About {schoolName}
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-emerald-400 to-amber-400 mx-auto rounded-full mb-6" />
            <p className="text-base sm:text-lg md:text-xl text-slate-300 font-medium leading-relaxed">
              {schoolTagline}
            </p>
          </div>
        </div>
      </section>

      <section id="vision" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-8"
            >
              <div className="w-14 h-14 bg-emerald-700 rounded-xl flex items-center justify-center text-white mb-6">
                <Eye className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Our Vision</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {visionText}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-8"
            >
              <div className="w-14 h-14 bg-amber-600 rounded-xl flex items-center justify-center text-white mb-6">
                <Target className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Our Mission</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {missionText}
              </p>
            </motion.div>
          </div>
        </div>
      </section>


      {/* CORE VALUES */}
      {coreValues && coreValues.length > 0 && (
        <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Our Core Values</h2>
              <div className="w-16 h-1 bg-emerald-500 mx-auto mt-3 rounded-full" />
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {coreValues.map((v: any, i: number) => (
                <motion.div
                  key={v._id || v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                    {iconMap[v.icon || "Target"] || <Target className="w-6 h-6" />}
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LEADERSHIP */}
      {leadershipList && leadershipList.length > 0 && (
        <section id="leadership" className="py-20 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Our Leadership</h2>
              <div className="w-16 h-1 bg-emerald-500 mx-auto mt-3 rounded-full" />
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                Guided by visionary leaders who bring decades of experience in education and administration.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {leadershipList.map((l: any, i: number) => (
                <motion.div
                  key={l._id || l.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-lg hover:shadow-xl transition-all text-center flex flex-col items-center group"
                >
                  <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-2xl overflow-hidden mb-5 border-2 border-emerald-500/30 shadow-md group-hover:scale-105 transition-transform duration-500 bg-slate-900">
                    <img src={l.imageUrl || "/images/leadership/priya_john.webp"} alt={l.name} className="w-full h-full object-cover object-top" loading="lazy" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5">{l.name}</h3>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold leading-relaxed px-2">{l.role}</p>
                  {l.bio && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 px-2">{l.bio}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TIMELINE */}
      {timelineList && timelineList.length > 0 && (
        <section id="timeline" className="py-20 bg-emerald-50 dark:bg-emerald-950/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Our Journey</h2>
              <div className="w-16 h-1 bg-emerald-500 mx-auto mt-3 rounded-full" />
            </motion.div>

            <div className="relative">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-emerald-300 dark:bg-emerald-800 md:-translate-x-px" />

              {timelineList.map((item: any, i: number) => (
                <motion.div
                  key={item._id || item.year}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative flex items-start gap-6 mb-8 ${
                    i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className="hidden md:block md:w-1/2" />
                  <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 md:-translate-x-2 mt-1.5 z-10" />
                  <div className="ml-12 md:ml-0 md:w-1/2">
                    <div className={`bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm ${
                      i % 2 === 0 ? "md:mr-8" : "md:ml-8"
                    }`}>
                      <span className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-bold rounded-full mb-2">
                        {item.year}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}