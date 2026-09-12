import { motion } from "framer-motion";
import { BookOpen, FlaskConical, Calculator, Globe, Palette, Cpu, Activity, BarChart3, GraduationCap } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { trpc } from "@/providers/trpc";

const iconMap: Record<string, React.ReactNode> = {
  FlaskConical: <FlaskConical className="w-8 h-8" />,
  Calculator: <Calculator className="w-8 h-8" />,
  Globe: <Globe className="w-8 h-8" />,
  Palette: <Palette className="w-8 h-8" />,
  Cpu: <Cpu className="w-8 h-8" />,
  Activity: <Activity className="w-8 h-8" />,
  BookOpen: <BookOpen className="w-8 h-8" />,
  GraduationCap: <GraduationCap className="w-8 h-8" />,
};

// Fallback data shown while CMS data loads or if no entries added yet
const FALLBACK_RESULT_DATA = [
  { year: "2022", passRate: 98, distinction: 45 },
  { year: "2023", passRate: 99, distinction: 52 },
  { year: "2024", passRate: 99.5, distinction: 58 },
  { year: "2025", passRate: 99.8, distinction: 65 },
  { year: "2026", passRate: 99.9, distinction: 72 },
];

const FALLBACK_STREAM_DATA = [
  { name: "Science", value: 40, color: "#047857" },
  { name: "Commerce", value: 35, color: "#059669" },
  { name: "Humanities", value: 25, color: "#10b981" },
];

export default function Academics() {
  const { data: departments } = trpc.cms.listDepartments.useQuery();
  const { data: boardResults } = trpc.cms.listBoardResults.useQuery();
  const { data: streamDistributions } = trpc.cms.listStreamDistributions.useQuery();
  const { data: siteSettings } = trpc.cms.getSiteSettings.useQuery();

  const getSetting = (key: string, fallback: string) => {
    const item = siteSettings?.find((s: any) => s.key === key);
    return item?.value?.trim() || fallback;
  };

  // Use CMS data if available, fall back to hardcoded defaults
  const resultData = (boardResults && boardResults.length > 0)
    ? boardResults.map((r: any) => ({ year: r.year, passRate: r.passRate, distinction: r.distinction }))
    : FALLBACK_RESULT_DATA;

  const streamData = (streamDistributions && streamDistributions.length > 0)
    ? streamDistributions.map((s: any) => ({ name: s.name, value: s.value, color: s.color }))
    : FALLBACK_STREAM_DATA;

  const academicsTitle = getSetting("academics_title", "Academic Excellence");
  const academicsSubtitle = getSetting("academics_subtitle", "Our comprehensive curriculum is designed to foster critical thinking, creativity, and a lifelong love for learning.");
  const academicsTagline = getSetting("academics_tagline", "Pedagogical Standards & Curriculum");

  // Latest result stats for summary cards
  const latestResult = resultData[resultData.length - 1];

  return (
    <Layout>
      <SEO
        title="Academics & CBSE Curriculum"
        description="Comprehensive academic streams (Science, Commerce, Humanities), CBSE curriculum, and board examination results at DPS Indirapuram."
      />
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
              {academicsTagline}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-5 tracking-tight text-white drop-shadow-md">
              {academicsTitle}
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-emerald-400 to-amber-400 mx-auto rounded-full mb-6" />
            <p className="text-base sm:text-lg md:text-xl text-slate-300 font-medium leading-relaxed">
              {academicsSubtitle}
            </p>
          </div>
        </div>
      </section>

      <section id="curriculum" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Our Curriculum</h2>
            <div className="w-16 h-1 bg-emerald-500 mx-auto mt-3 rounded-full" />
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">CBSE Curriculum</h3>
                  <p className="text-slate-600 dark:text-slate-300">Affiliated with CBSE, we follow the NCERT framework with additional enrichment programs for holistic development.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">STEM Focus</h3>
                  <p className="text-slate-600 dark:text-slate-300">Advanced STEM programs including robotics, AI, coding, and scientific research from middle school onwards.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Global Exposure</h3>
                  <p className="text-slate-600 dark:text-slate-300">Exchange programs, international collaborations, and multilingual education prepare students for global citizenship.</p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="grid grid-cols-2 gap-4">
              <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-0">
                <CardContent className="p-6 text-center">
                  <span className="block text-3xl font-bold text-emerald-700 dark:text-emerald-400">{latestResult?.passRate}%</span>
                  <p className="text-sm text-muted-foreground mt-1">Pass Rate</p>
                </CardContent>
              </Card>
              <Card className="bg-amber-50 dark:bg-amber-950/20 border-0">
                <CardContent className="p-6 text-center">
                  <span className="block text-3xl font-bold text-amber-700 dark:text-amber-400">{latestResult?.distinction}%</span>
                  <p className="text-sm text-muted-foreground mt-1">Distinction</p>
                </CardContent>
              </Card>
              <Card className="bg-amber-50/80 dark:bg-amber-950/30 border-0">
                <CardContent className="p-6 text-center">
                  <span className="block text-3xl font-bold text-amber-600 dark:text-amber-300">25+</span>
                  <p className="text-sm text-muted-foreground mt-1">Subjects</p>
                </CardContent>
              </Card>
              <Card className="bg-emerald-50/80 dark:bg-emerald-950/30 border-0">
                <CardContent className="p-6 text-center">
                  <span className="block text-3xl font-bold text-emerald-800 dark:text-emerald-300">300+</span>
                  <p className="text-sm text-muted-foreground mt-1">Faculty</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* DYNAMIC DEPARTMENTS FROM CMS */}
      {departments && departments.length > 0 && (
        <section id="departments" className="py-20 bg-slate-50 dark:bg-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Departments & Disciplines</h2>
              <div className="w-16 h-1 bg-emerald-500 mx-auto mt-3 rounded-full" />
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((dept: any, i: number) => (
                <motion.div key={dept._id || dept.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Card className="hover:shadow-lg transition-shadow h-full border border-slate-200/80 dark:border-slate-700">
                    <CardContent className="p-6">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${dept.color || "bg-emerald-50 text-emerald-700"}`}>
                        {iconMap[dept.icon || "BookOpen"] || <BookOpen className="w-8 h-8" />}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{dept.name}</h3>
                      <p className="text-sm text-muted-foreground">{dept.subjects}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BOARD RESULTS — dynamically driven from admin panel */}
      <section id="results" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Academic Results</h2>
            <div className="w-16 h-1 bg-emerald-500 mx-auto mt-3 rounded-full" />
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-600" /> Pass Rate & Distinction Trends
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={resultData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="passRate" name="Pass Rate %" fill="#047857" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="distinction" name="Distinction %" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Student Stream Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={streamData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                        {streamData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-2 flex-wrap">
                    {streamData.map((s) => (
                      <div key={s.name} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                        <span>{s.name} ({s.value}%)</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
